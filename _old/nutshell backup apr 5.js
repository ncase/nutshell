/*************************************************************************

NUTSHELL.JS

You know how in Memento, the guy with amnesia tattoos reminders on his body?
That is basically how I document my code. The following "documentation"
is for future Nicky to remember what the heck they were doing.
If others find it helpful, that is a side effect.

== Design Principles ==

Dead Simple:
Just put a <script> in the header and that's it.
That's why this file even contains the CSS & others' minified libraries

Decentralized:
Nutshell Sections can be embedded across websites & authors

Backwards Compatible:
Should work with blogs & writings that already exist.
(thus, find sections using <h*>, <b>, etc – the standard markup!)
And heck, why not, Wikipedia API integration.

Minimalist:
don't send me any issues or pull requests for more features
thx


== Terminology ==

Nutshell: name of this library
Nutshell Section: a piece text that can be embedded elsewhere.
  (also called just "Sections" or "Nutshells", confusingly.)
Expandable: a button you can click to get an "expandable explanation"
  (also called just "Button" or "link". Look, I'm not consistent with this.)
Bubble: the box that expands below an expandable, containing a Nutshell Section


== What Nutshell Needs To Do ==

1) Convert :links to expandable buttons
  - Like so:
    <a href="pageURL#Section">:link text</a>
    should be converted to an expandable labeled "link text", that when clicked,
    expands a bubble with the section #Section (case-insensitive) from pageURL
  - By default, do this on page load complete
  - MAYBE: If an expandable is on the top page, AFTER its section is defined,
    hide it on top page only: it's a pre-req.

2) When expandable is clicked, it should...

  a. Get HTML of the source page

    If already cached, use that.

    Getting Raw:
      - If it's *this* page, easy peasy.
      - If it's a remote page, and it's not already in the cache:
        Say "loading...", then try fetching the HTML.
        If CORS fails, use iframe & postMessage to get the HTML
        (If that fails, throw error. Give reader direct new-tab link.)
      - If it's Wikipedia, just use their API.
      - (MAYBE: also embed images, YouTube/Vimeo?... iframe entire sites? like geogebra)
      - (plugin in general? but then fail cross-site...)

    Process it:
      - DOMPurify it: no styles, no scripts, iframes allowed but sandboxed
      - (MAYBE: LaTeX)
      - Convert all links to absolute

    Then cache it!

  b. Make a Section DOM

    Get the HTML from page URL
      - Very forgiving search: find <h*> that *contains* the string #Section,
        case-insensitive, doesn't even care about punctuation.
        Get all <p> after that up until the next <h>, <hr>, or end of post
      - If no such <h*>, get first <p> with match in <i>, <b>, <em>, <strong>
      - If still none, get the first <p> with test string *at all*.
      - (STILL none? Throw error. Remind author of typos/regional spellings.)
      - (MAYBE: specify # of paragraphs to include or cut, before/after text?)

    Process
      - Convert :links to Nutshells (yay, recursion!)

  c. Put it in the "expandable" part below the button (after punctuation)
    - (MAYBE: also allow on-hover modal expand?)
    - Should repeat/continue text afterwards in light gray for reading context
    - also, link to source, embed button, & close button

3) MAYBE: Convert headers
  - On hover, each header reveals two icon-buttons:
    one to permalink to that section, one to embed a Nutshell
  - For all headers that start with a colon, ":header", HIDE IT
    and replace it with just an expandable button
  - MAYBE: also hide paragraphs starting with ":", to indicate content
    that should only be shown when embedded elsewhere, NOT top-level?

TODO: What prior art exists?
already a library for this within-site? pop-up?
StretchText - original idea to use across authors?
https://github.com/BradNeuberg/stretchtext.js (but not across websites)
Use ////'s arrow styling idea
Wikipedia
Gwern
LessWrong
selling points: NOT DISRUPTIVE, JUST-IN-TIME LEARNING
Telescopic text
Stretchtext can also be implemented in JavaScript, as in Brad Neuberg’s Stretchtext.js, and illustrated in an extensive system on Ted Goranson’s blog.

TODO: If no #SectionID, get "main article"?

TODO NEXT, IN ORDER OF IMPORTANCE:
- Load remote page @done
- Links to absolute @done
- Dompurify @done
- iframe with postmessage @done

TODO NEXT, IN ORDER OF IMPORTANCE:
- Visuals
  - Bubble looks goooood! @done
  - Loading signs, etc @done
  - Expandable arrows @done
  - error messages @done

TODO NEXT:
- Bubble Head / Foot
- punctuation
- Embedding & convert headers
  - simple embed modal
  - in bubble head
  - headers, on hover, give link and nutshell icons
  - on link, scrollTo and focus-select URL bar
- Forgiving Search <b> & paragraphs, full article
- Images/Iframe/Plugins etc
- Latex

FINALLY:
- Main page with explainers
- Demo (record video, tho)
- Full documentation
- Shipping with examples on my blog?

TODO: don't understand why "Loop from 8082" doesn't work.

TODO: glitch with arrow at bigger font sizes???!??!

//
- Better bubble UI, triangle etc, CSS for imagewidth, etc
- Bubble after punctuation

*************************************************************************/

{

    window.Nutshell = {};

    /////////////////////
    // On load...
    /////////////////////

    // By default, start Nutshell when page loads
    // (you may want it to not do this, if your blog's content is being
    // loaded remotely. but seriously why are you doing that)
    window.addEventListener('load', ()=>{ // TODO: or "load complete"?
        if(Nutshell.options.startOnLoad) Nutshell.start();
    });

    // IF TOP PAGE: Convert this page's links & headers
    // IF NOT: Just postMessage the parent, let 'em deal with it.
    Nutshell.start = ()=>{
        if(window == window.top){

            // Add self's HTML to my own cached
            Nutshell.htmlCache[Nutshell.thisPageURL] = document.body.innerHTML;

            // Add styles & convert page
            Nutshell.addStyles();
            Nutshell.convertLinksToExpandables(document.body);
            // TODO: Nutshell.convertHeaders();

        }else{

            // Tell my parent (from any origin) my HTML!
            _sendParentMyHTML();

        }
    };

    /////////////////////
    // Options
    /////////////////////

    Nutshell.options = {

        // Start Nutshell on load? (default: yes)
        startOnLoad: true,

        // Should bubbles be expanded on hover, instead of click? (default: no)
        showOnHover: false, // TODO: click only on mobile?

        // You can override the CSS however you like
        customCSS: '',

        // What language Nutshell's info-text is in
        lang: 'en'

    };

    /////////////////////
    // Localizeable text
    /////////////////////

    Nutshell.language = {
        en: {
            notFoundError: "Uh oh, the page was not found! Double check the link:",
            loadingError: "Uh oh, the page was found but didn't hand over its content! Check that the other site has Nutshell installed or CORS enabled:",
            sectionIDError: "Uh oh, there's no section that matches the id “[ID]”! Watch out for typos & regional spelling differences.",
            // embed options, warning about mirroring...
        }
    };

    Nutshell.getLocalizedText = (textID)=>{
        let currentLanguage = Nutshell.options.lang,
            dictionary = Nutshell.language[currentLanguage];
        return dictionary[textID];
    }

    ///////////////////////////////////////////////////////////
    // Convert links to expandable buttons in a DOM element
    ///////////////////////////////////////////////////////////

    Nutshell.convertLinksToExpandables = (dom)=>{

        // Get an array of all links, filtered by if the text starts with a :colon
        let links = [...dom.querySelectorAll('a')].filter(
            link => (link.innerText.trim().indexOf(':')==0)
        );

        // Turn each one into an expandable!
        links.forEach((link)=>{

            // Style
            link.classList.add('nutshell-expandable');

            // Remove colon, add in those arrows
            let linkText = document.createElement('span');
            linkText.innerHTML = link.innerText.slice(link.innerText.indexOf(':')+1);
            linkText.className = 'nutshell-link-text';
            let ballUp = document.createElement('span');
            ballUp.className = 'nutshell-ball-up';
            let ballDown = document.createElement('span');
            ballDown.className = 'nutshell-ball-down';
            link.innerHTML = '';
            link.appendChild(linkText);
            link.appendChild(ballUp);
            link.appendChild(ballDown);

            // Start closed
            link.setAttribute("mode", "closed");

            // Show on hover, or on click?
            let thisExpandablesBubble = null; // extremely hacky way to reference it
            if(Nutshell.options.showOnHover){

                // ON MOUSEOVER, show
                /*link.addEventListener('mouseover',(e)=>{
                    if(!link.bubble) link.bubble = Nutshell.createBubble(link); // super hacky
                });*/

                // ON MOUSEOUT, bye

            }else{

                // ON CLICK: toggle
                link.addEventListener('click',(e)=>{

                    // No don't actually go to that link.
                    e.preventDefault();

                    // Toggle create/close
                    if(!thisExpandablesBubble){
                        // Is closed, make OPEN
                        thisExpandablesBubble = Nutshell.createBubble(link, e.offsetX);
                        link.setAttribute("mode", "open");
                    }else{
                        // Is open, make CLOSED
                        thisExpandablesBubble.close();
                        thisExpandablesBubble = null;
                        link.setAttribute("mode", "closed");
                    }

                });

            }

        });

    };

    ///////////////////////////////////////////////////////////
    // RETURNS PROMISE...
    // to get processed HTML of source page.
    ///////////////////////////////////////////////////////////

    // Not very picky about what's in the cache
    // Could be just <p>'s, or the entire <body> with nav & comments
    Nutshell.htmlCache = {};

    // Cache this page's HTML first!
    Nutshell.thisPageURL = location.protocol + '//' + location.host + location.pathname;

    Nutshell.promiseHTMLFromURL = (url)=>{

        // A promise...
        return new Promise((resolve,reject)=>{

            // If in cache, return that.
            if(Nutshell.htmlCache[url]){
                resolve(Nutshell.htmlCache[url]);
                return; // STOP.
            }

            // If not in cache, is it Wikipedia, or otherwise?
            if(_isWikipedia(url)){

                // IT'S WIKIPEDIA! USE THAT API.

                // The article title is the last bit of the URL
                let splitURL = url.split("/"),
                    title = splitURL[splitURL.length-1];

                // Fetch that lede!
                let resourceParams = {
                    // Request from anywhere, in JSON
                    action: "query",
                    origin: "*",
                    format: "json",
                    // Extract just the lead paragraph
                    prop: "extracts", // Wiki extracts
                    exintro: "",
                    // THIS PAGE
                    titles: title
                }
                let resourceQueryString = _objectToURLParams(resourceParams);
                let resourceURL = `https://en.wikipedia.org/w/api.php?${resourceQueryString}`;
                fetch(resourceURL)
                    .then(response => response.json())
                    .then(data => {
                        let pageKey = Object.keys(data.query.pages)[0],
                            pageHTML = data.query.pages[pageKey].extract;

                        // CACHE IT
                        Nutshell.htmlCache[url] = pageHTML;

                        // FULFIL THE PROPHECY
                        resolve(pageHTML);

                  });

            }else{

                // Otherwise, the usual.

                // Fetch it...
                let getRawHTMLPromise = new Promise((resolveRaw,rejectRaw)=>{

                    // If it's not, fetch the HTML.
                    fetch(url)
                        .then(response => {
                            if(!response.ok) throw Error('404'); // 404's ain't ok
                            else return response.text();
                        })
                        .then(data => {
                            resolveRaw(data); // Yay, it worked.
                        })
                        .catch(err => {

                            // If it failed due to 404, say that
                            if(err.message=='404'){

                                return reject(
                                    `<p>
                                    ${Nutshell.getLocalizedText("notFoundError")}
                                    <a target='_blank' href='${url}'>${url}</a>
                                    </p>`
                                );

                            }else{

                                // Otherwise, assume it failed due to CORS.
                                // Try using iframe & postMessage to get the HTML

                                // Set up safe iframe to speak...
                                let safeIframe = document.createElement('iframe');
                                safeIframe.setAttribute('sandbox','allow-scripts');
                                safeIframe.style.display = 'none';
                                safeIframe.src = url;

                                // Set up listener...
                                let _messageListener = window.addEventListener("message", (message)=>{
                                    let data = JSON.parse(message.data);
                                    // Only accept this message if it's loading the URL we want
                                    // (Otherwise, problems when loading multiple URLs at same time)
                                    if(data.url == url){
                                        _removeBoth(); // done!
                                        resolveRaw(data.html);
                                    }
                                });

                                // Go!
                                document.body.appendChild(safeIframe);

                                // Removing both ends...
                                let _alreadyRemoved = false;
                                let _removeBoth = ()=>{
                                    if(_alreadyRemoved) return; // once-r
                                    window.removeEventListener("message", _messageListener);
                                    document.body.removeChild(safeIframe);
                                    _alreadyRemoved = true;
                                };

                                // (If that fails after some time, tell user. and _removeBoth)
                                setTimeout(()=>{
                                    _removeBoth();
                                    reject(
                                        `<p>
                                        ${Nutshell.getLocalizedText("loadingError")}
                                        <a target='_blank' href='${url}'>${url}</a>
                                        </p>`
                                    );
                                },WAIT_BEFORE_GIVING_UP);

                            }

                        });

                });

                // ...then purify, then cache.
                getRawHTMLPromise.then((rawHTML)=>{

                    // DOMPurify: no styles, no scripts, iframes allowed (but sandboxed later)
                    let cleanHTML = DOMPurify.sanitize(rawHTML,{
                        FORBID_ATTR: ['style'],
                        FORBID_TAGS: ['style'],
                        ADD_TAGS: ['iframe']
                    });

                    // A <span> for manipulating this.
                    let explore = document.createElement('div');
                    explore.innerHTML = cleanHTML;

                    // Sandbox iframes
                    [...explore.querySelectorAll('iframe')].forEach(iframe=>{
                        iframe.setAttribute('sandbox','allow-scripts');
                    });

                    // Image src's & link href's to absolute
                    _convertRelativeToAbsoluteLinks("img", "src", url, explore);
                    _convertRelativeToAbsoluteLinks("a", "href", url, explore);

                    // THEN CACHE & GIMME
                    Nutshell.htmlCache[url] = explore.innerHTML;
                    resolve(Nutshell.htmlCache[url]);

                });

            }

        });

    };

    const WAIT_BEFORE_GIVING_UP = 9999;

    // Ma, here's my HTML!
    let _sendParentMyHTML = ()=>{
        window.parent.postMessage(
            JSON.stringify({
                url: Nutshell.thisPageURL,
                html: document.body.innerHTML
            }),
        '*');
    };

    // Convert all links in a DOM to absolute links
    let _convertRelativeToAbsoluteLinks = (tag, attr, baseURL, dom)=>{
        [...dom.querySelectorAll(tag)].forEach((el)=>{
            let relative = el.getAttribute(attr),
                absolute = new URL(relative,baseURL).href;
            el[attr] = absolute;
        });
    };

    // Convert key-values to key1=value1&key2=value2 etc. Also encode URI
    let _objectToURLParams = (obj)=>{
        return Object.keys(obj)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join("&");
    };

    // Is it Wikipedia? Special edge case.
    let _isWikipedia = (url)=>{
        return url.indexOf('wikipedia.org')>=0;
    };



    ///////////////////////////////////////////////////////////
    // RETURNS PROMISE...
    // to get a Section as DOM elements, given an expandable's link,
    // given raw page HTML, #Section, options
    ///////////////////////////////////////////////////////////

    Nutshell.promiseSectionDOM = (expandableLink)=>{

        // A promise...
        return new Promise((resolve,reject)=>{

            // Where you'll be dumping the section!
            let resultsDiv = document.createElement('div');

            // Convert expandableLink to url, sectionID (MAYBE: options)
            let href = expandableLink.href,
                splitHref = href.split("#"),
                url = splitHref[0],
                sectionID = splitHref[1];

            // TODO: IF NO SECTION ID GET ENTIRE PAGE???
            // TODO: FAIL IF GIVEN SECTION ID BUT NOT FOUND

            // Okay, NOW make that section DOM...
            Nutshell.promiseHTMLFromURL(url).then((rawHTML)=>{

                // Results htmlCache
                let resultsHTML = '';

                // If it's Wikipedia, skip all that nonsense & gimme the lede!
                if(_isWikipedia(url)){
                    resultsHTML = rawHTML;
                }else{

                    // Otherwise, biz as usual.

                    // Safe-explore DOM
                    let explore = document.createElement('div');
                    explore.innerHTML = rawHTML;

                    // Forgiving-search the <tags> for #sectionID
                    let foundHeader = null;
                    let headerTags = ['h1','h2','h3','h4','h5','h6'];
                    // For each header tag...
                    for(let i=0; i<headerTags.length; i++){
                        let tag = headerTags[i],
                            headers = [...explore.querySelectorAll(tag)];
                        // ...and for each header of that tag...
                        for(let j=0; j<headers.length; j++){
                            let header = headers[j];
                            // Go thru with _forgivingMatchTest, return FIRST ONE, THEN BREAK.
                            if(_forgivingMatchTest(header.innerText,sectionID)){
                                foundHeader = header;
                            }
                            if(foundHeader) break;
                        }
                        if(foundHeader) break;
                    }
                    // If found the section header...
                    if(foundHeader){
                        // Give everything up until the end of section.
                        let currentNode = foundHeader,
                            foundEndOfSection = false;
                        while(!foundEndOfSection){
                            // Try to find next sibling...
                            currentNode = currentNode.nextSibling;
                            if(currentNode){

                                // What's this thing's tag?
                                if(currentNode.tagName){
                                    // If it's a header or <hr>, done.
                                    let currentTag = currentNode.tagName.toLowerCase();
                                    if(headerTags.indexOf(currentTag)>=0 || currentTag=='hr'){
                                        foundEndOfSection = true;
                                    }else{
                                        // Otherwise, add it to the resultsHTML!
                                        resultsHTML += currentNode.outerHTML;
                                    }
                                }else{
                                    // If no tag at all, it's probably text. Add it.
                                    resultsHTML += currentNode.textContent;
                                }

                            }else{
                                // ...If not, done.
                                foundEndOfSection = true;
                            }
                        }
                    }else{
                        // HELPFUL(?) ERROR MESSAGE
                        resultsHTML = `<p>${Nutshell.getLocalizedText("sectionIDError").replace('[ID]',sectionID)}</p>`;
                    }

                    // If none, try forgiving-matching with emphasis tags.
                    // let emphasisTags = ['i','b','em','strong'];
                    // If still none, try first paragraph with the text *at all*

                    // If STILL none, error.

                }

                // Give results!
                resultsDiv.innerHTML = resultsHTML;
                resolve(resultsDiv);

            }).catch((message)=>{

                // AND IF SOMETHING GOES WRONG ANYWAY, TELL USER.
                resultsDiv.innerHTML = message;
                resolve(resultsDiv);

            });

        });

    };

    // Do a forgiving match between two strings: src, test
    // Capitalization & punctuation insensitive, and src at least CONTAINS test
    let _forgivingMatchTest = (src, test)=>{

        // Lowercase & strip everything but letters
        src = src.toLowerCase().replace(/[^a-z]/g,'');
        test = test.toLowerCase().replace(/[^a-z]/g,'');

        // Src at least CONTAINS test?
        let srcContainsTest = (src.indexOf(test)>=0);
        return srcContainsTest;

    };

    ///////////////////////////////////////////////////////////
    // Create bubble below (MAYBE: above on hover?) an expandable,
    // using expandable's data (pageURL#section)
    ///////////////////////////////////////////////////////////

    Nutshell.createBubble = (expandableDOM, arrowX)=>{

        // The bubble DOM
        let bubble = document.createElement('div');
        bubble.className = 'nutshell-bubble';

        // A speech-bubble arrow, positioned at X of *where you clicked*???
        let arrow = document.createElement("div");
        arrow.className = "nutshell-arrow-up";
        bubble.appendChild(arrow);

        // Arrow should be 20px left of the click point
        // but ALSO if the bubble's inside a bubble, move 1 padding to the right.
        let paragraphWidth = expandableDOM.parentNode.getBoundingClientRect().width;
        if(expandableDOM.parentNode.parentNode.className=="nutshell-section"){
            let sectionWidth = expandableDOM.parentNode.parentNode.getBoundingClientRect().width,
                padding = (sectionWidth-paragraphWidth)/2;
            arrowX += padding;
        }
        // also, don't go past bubble's rounded corners
        if(arrowX < 33) arrowX = 33;
        if(arrowX > paragraphWidth-33) arrowX = paragraphWidth-33;
        arrow.style.left = (arrowX-20)+"px";

        // The overflow container
        let overflow = document.createElement('div');
        overflow.className = 'nutshell-overflow';
        overflow.setAttribute("mode","opening");
        overflow.style.height = "0px"; // start closed
        bubble.appendChild(overflow);

        // Head

        // Section
        let section = document.createElement('div');
        section.className = "nutshell-section";
        overflow.appendChild(section);

        // Foot

        // Close

        // Close Function
        bubble.close = ()=>{

            // Can't start with "auto", so set to current height
            overflow.style.height = overflow.getBoundingClientRect().height + "px";

            // NOW close.
            setTimeout(()=>{
                overflow.setAttribute("mode","closing");
                overflow.style.height = "0px"; // go closed
            },1);

            // Afterwards, delete.
            setTimeout(()=>{
                bubble.parentNode.removeChild(bubble);
                expandableDOM.setAttribute("mode", "closed");
            },BUBBLE_ANIM_TIME+1);

        };
        // TODO: button

        // Place it TODO: AFTER PUNCTUATION
        expandableDOM.parentNode.insertBefore(bubble, expandableDOM.nextSibling);

        // Load Section, given expandableDOM's data.
        let _resolved = false;
        Nutshell.promiseSectionDOM(expandableDOM).then((sectionContent)=>{

            // Links to Nutshell Expandables (yay recursion!)
            Nutshell.convertLinksToExpandables(sectionContent);

            // Open all other links in new tab, don't ruin reading flow.
            [...sectionContent.querySelectorAll('a')].forEach((a)=>{
                a.target = "_blank";
            });

            // Put in section's content
            section.innerHTML = '';
            section.appendChild(sectionContent);

            // ...and animate!
            overflow.style.height = section.getBoundingClientRect().height+"px";
            setTimeout(()=>{
                overflow.style.height = "auto";
            }, BUBBLE_ANIM_TIME);

            // Nice.
            _resolved = true;

        });

        // If doesn't resolve instantly, show "..." loading.
        setTimeout(()=>{
            if(!_resolved){

                // dots, with another dot per second...
                let dots = document.createElement("p");
                // not doing "setInterval" coz I don't want to deal with clearInterval
                // and possible intervals accumulating & making things awful
                let _addDot = ()=>{
                    if(!_resolved){
                        dots.innerHTML += '.';
                        setTimeout(_addDot,1000);
                    }
                };
                _addDot();

                // anim to height
                section.innerHTML = '';
                section.appendChild(dots);
                overflow.style.height = section.getBoundingClientRect().height+"px";

            }
        },10);

        // Gimme!
        return bubble;

    };

    const BUBBLE_ANIM_TIME = 300;

    ///////////////////////////////////////////////////////////
    // Convert headers to give link/embed options, or hide
    ///////////////////////////////////////////////////////////

    Nutshell.convertHeaders = (dom=document.body)=>{ // by default, *this* page
        // TODO: later.
    };

    /////////////////////
    // Nutshell Styling
    /////////////////////

    Nutshell.defaultStyle = `

    .nutshell-expandable{

        /* Plain jane styling */
        color: inherit;
        text-decoration: none;
        border-bottom: dotted 1.5px;

        /* So those balls work */
        position:relative;

        /* anim */
        transition: opacity 0.1s ease-in-out;
        opacity: 1;

    }
    .nutshell-expandable:hover{
        opacity: 0.8;
    }
    .nutshell-expandable .nutshell-link-text{
        padding-left: 0.35em;
    }
    .nutshell-ball-up, .nutshell-ball-down{

        /* TODO: try ·? so same color */

        position: absolute;
        display: inline-block;
        left: 1px;

        width: 0.15em;
        height: 0.15em;
        background: #000;
        border-radius: 1em;
        /*border-style: solid;
        border-width: 1px 1px 0 0;
        transform: rotate(-45deg);*/

        transition: top 0.1s ease-in-out;

    }
    .nutshell-expandable[mode=closed] .nutshell-ball-up{
        top: 0.4em;
    }
    .nutshell-expandable[mode=closed] .nutshell-ball-down{
        top: 0.7em;
    }
    .nutshell-expandable[mode=closed]:hover .nutshell-ball-up{
        top: 0.2em;
    }
    .nutshell-expandable[mode=closed]:hover .nutshell-ball-down{
        top: 0.9em;
    }
    .nutshell-expandable[mode=open] .nutshell-ball-up{
        top: 0.4em;
    }
    .nutshell-expandable[mode=open] .nutshell-ball-down{
        top: 0.7em;
    }
    .nutshell-expandable[mode=open]:hover .nutshell-ball-up{
        top: 0.55em;
    }
    .nutshell-expandable[mode=open]:hover .nutshell-ball-down{
        top: 0.55em;
    }

    /*****

    BUBBLE STRUCTURE:

    Bubble:
    - arrow (sticks out)
    - overflow container
      - head: from & embed
      - section (left & right padded)
        - bubbles stick out
      - foot: close
    When open:
      - calc section height
      - animate overflow from 0 to that + head/foot
      - then go to being auto-height (for recursive expand inside)
    When close:
      - overflow go to 0
      - then delete

    ******/

    .nutshell-bubble{

        display: inline-block;
        width: 100%;

        /* It's nice & speech-bubble-lookin' */
        border: 1px solid black;
        border-radius: 20px;

        /* For the speech-bubble arrow */
        position: relative;
        margin-top: 22px;

    }

    .nutshell-arrow-up{
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-bottom: 20px solid #000;
        position: absolute;
        top: -20px;
        pointer-events: none; /* don't block clicking */
    }
    .nutshell-arrow-up::after{
        content: "";
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-bottom: 20px solid #fff;
        position: relative;
        top: -25px;
        left: -20px;
        pointer-events: none; /* don't block clicking */
    }

    .nutshell-overflow{
        overflow: hidden;
    }
    .nutshell-overflow[mode=opening]{
        transition: height 0.3s ease-out;
    }
    .nutshell-overflow[mode=closing]{
        transition: height 0.3s ease-in;
    }

    .nutshell-bubble-head{
    }

    .nutshell-section{
        padding: 0 20px;
        overflow: hidden; /* to capture full height, including <p>'s margins */
    }
    .nutshell-section .nutshell-bubble{
        /* So that recursive bubbles don't get squashed too quickly */
        width: calc(100% + 40px - 6px); /* undo section's padding, minus a gap */
        position: relative;
        right: calc(20px - 2px);
    }
    .nutshell-section img{
        max-width:100%; /* so it fits */
    }
    .nutshell-section iframe{
        max-width:100%;
        border: 1px solid rgba(0,0,0,0.2);
    }

    .nutshell-bubble-foot{
    }

    `;
    Nutshell.addStyles = ()=>{
        let styleDOM = document.createElement("style");
        styleDOM.innerHTML = Nutshell.defaultStyle + Nutshell.options.customCSS;
        document.head.appendChild(styleDOM);
    };

}

/*************************************************************************

OPEN SOURCE LIBRARIES I'M PUTTING DIRECTLY INTO THIS JAVASCRIPT FILE
COZ AIN'T NOBODY WANT A REPEAT OF THE LEFT-PAD FIASCO

*************************************************************************/

/*! @license DOMPurify 2.3.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.3.6/LICENSE */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).DOMPurify=t()}(this,(function(){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,n){return(t=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,n)}function n(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function r(e,o,a){return(r=n()?Reflect.construct:function(e,n,r){var o=[null];o.push.apply(o,n);var a=new(Function.bind.apply(e,o));return r&&t(a,r.prototype),a}).apply(null,arguments)}function o(e){return function(e){if(Array.isArray(e))return a(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return a(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return a(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var i=Object.hasOwnProperty,l=Object.setPrototypeOf,c=Object.isFrozen,u=Object.getPrototypeOf,s=Object.getOwnPropertyDescriptor,m=Object.freeze,f=Object.seal,p=Object.create,d="undefined"!=typeof Reflect&&Reflect,h=d.apply,g=d.construct;h||(h=function(e,t,n){return e.apply(t,n)}),m||(m=function(e){return e}),f||(f=function(e){return e}),g||(g=function(e,t){return r(e,o(t))});var y,b=_(Array.prototype.forEach),v=_(Array.prototype.pop),T=_(Array.prototype.push),N=_(String.prototype.toLowerCase),E=_(String.prototype.match),A=_(String.prototype.replace),w=_(String.prototype.indexOf),x=_(String.prototype.trim),S=_(RegExp.prototype.test),k=(y=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return g(y,t)});function _(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return h(e,t,r)}}function O(e,t){l&&l(e,null);for(var n=t.length;n--;){var r=t[n];if("string"==typeof r){var o=N(r);o!==r&&(c(t)||(t[n]=o),r=o)}e[r]=!0}return e}function D(e){var t,n=p(null);for(t in e)h(i,e,[t])&&(n[t]=e[t]);return n}function C(e,t){for(;null!==e;){var n=s(e,t);if(n){if(n.get)return _(n.get);if("function"==typeof n.value)return _(n.value)}e=u(e)}return function(e){return console.warn("fallback value for",e),null}}var M=m(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),R=m(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),L=m(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),I=m(["animate","color-profile","cursor","discard","fedropshadow","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),F=m(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]),H=m(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),U=m(["#text"]),z=m(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),B=m(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),j=m(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),P=m(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),G=f(/\{\{[\s\S]*|[\s\S]*\}\}/gm),W=f(/<%[\s\S]*|[\s\S]*%>/gm),q=f(/^data-[\-\w.\u00B7-\uFFFF]/),Y=f(/^aria-[\-\w]+$/),K=f(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),V=f(/^(?:\w+script|data):/i),$=f(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),X=f(/^html$/i),Z=function(){return"undefined"==typeof window?null:window},J=function(t,n){if("object"!==e(t)||"function"!=typeof t.createPolicy)return null;var r=null,o="data-tt-policy-suffix";n.currentScript&&n.currentScript.hasAttribute(o)&&(r=n.currentScript.getAttribute(o));var a="dompurify"+(r?"#"+r:"");try{return t.createPolicy(a,{createHTML:function(e){return e}})}catch(e){return console.warn("TrustedTypes policy "+a+" could not be created."),null}};return function t(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:Z(),r=function(e){return t(e)};if(r.version="2.3.6",r.removed=[],!n||!n.document||9!==n.document.nodeType)return r.isSupported=!1,r;var a=n.document,i=n.document,l=n.DocumentFragment,c=n.HTMLTemplateElement,u=n.Node,s=n.Element,f=n.NodeFilter,p=n.NamedNodeMap,d=void 0===p?n.NamedNodeMap||n.MozNamedAttrMap:p,h=n.HTMLFormElement,g=n.DOMParser,y=n.trustedTypes,_=s.prototype,Q=C(_,"cloneNode"),ee=C(_,"nextSibling"),te=C(_,"childNodes"),ne=C(_,"parentNode");if("function"==typeof c){var re=i.createElement("template");re.content&&re.content.ownerDocument&&(i=re.content.ownerDocument)}var oe=J(y,a),ae=oe?oe.createHTML(""):"",ie=i,le=ie.implementation,ce=ie.createNodeIterator,ue=ie.createDocumentFragment,se=ie.getElementsByTagName,me=a.importNode,fe={};try{fe=D(i).documentMode?i.documentMode:{}}catch(e){}var pe={};r.isSupported="function"==typeof ne&&le&&void 0!==le.createHTMLDocument&&9!==fe;var de,he,ge=G,ye=W,be=q,ve=Y,Te=V,Ne=$,Ee=K,Ae=null,we=O({},[].concat(o(M),o(R),o(L),o(F),o(U))),xe=null,Se=O({},[].concat(o(z),o(B),o(j),o(P))),ke=Object.seal(Object.create(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),_e=null,Oe=null,De=!0,Ce=!0,Me=!1,Re=!1,Le=!1,Ie=!1,Fe=!1,He=!1,Ue=!1,ze=!1,Be=!0,je=!0,Pe=!1,Ge={},We=null,qe=O({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Ye=null,Ke=O({},["audio","video","img","source","image","track"]),Ve=null,$e=O({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Xe="http://www.w3.org/1998/Math/MathML",Ze="http://www.w3.org/2000/svg",Je="http://www.w3.org/1999/xhtml",Qe=Je,et=!1,tt=["application/xhtml+xml","text/html"],nt="text/html",rt=null,ot=i.createElement("form"),at=function(e){return e instanceof RegExp||e instanceof Function},it=function(t){rt&&rt===t||(t&&"object"===e(t)||(t={}),t=D(t),Ae="ALLOWED_TAGS"in t?O({},t.ALLOWED_TAGS):we,xe="ALLOWED_ATTR"in t?O({},t.ALLOWED_ATTR):Se,Ve="ADD_URI_SAFE_ATTR"in t?O(D($e),t.ADD_URI_SAFE_ATTR):$e,Ye="ADD_DATA_URI_TAGS"in t?O(D(Ke),t.ADD_DATA_URI_TAGS):Ke,We="FORBID_CONTENTS"in t?O({},t.FORBID_CONTENTS):qe,_e="FORBID_TAGS"in t?O({},t.FORBID_TAGS):{},Oe="FORBID_ATTR"in t?O({},t.FORBID_ATTR):{},Ge="USE_PROFILES"in t&&t.USE_PROFILES,De=!1!==t.ALLOW_ARIA_ATTR,Ce=!1!==t.ALLOW_DATA_ATTR,Me=t.ALLOW_UNKNOWN_PROTOCOLS||!1,Re=t.SAFE_FOR_TEMPLATES||!1,Le=t.WHOLE_DOCUMENT||!1,He=t.RETURN_DOM||!1,Ue=t.RETURN_DOM_FRAGMENT||!1,ze=t.RETURN_TRUSTED_TYPE||!1,Fe=t.FORCE_BODY||!1,Be=!1!==t.SANITIZE_DOM,je=!1!==t.KEEP_CONTENT,Pe=t.IN_PLACE||!1,Ee=t.ALLOWED_URI_REGEXP||Ee,Qe=t.NAMESPACE||Je,t.CUSTOM_ELEMENT_HANDLING&&at(t.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(ke.tagNameCheck=t.CUSTOM_ELEMENT_HANDLING.tagNameCheck),t.CUSTOM_ELEMENT_HANDLING&&at(t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(ke.attributeNameCheck=t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),t.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(ke.allowCustomizedBuiltInElements=t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),de=de=-1===tt.indexOf(t.PARSER_MEDIA_TYPE)?nt:t.PARSER_MEDIA_TYPE,he="application/xhtml+xml"===de?function(e){return e}:N,Re&&(Ce=!1),Ue&&(He=!0),Ge&&(Ae=O({},o(U)),xe=[],!0===Ge.html&&(O(Ae,M),O(xe,z)),!0===Ge.svg&&(O(Ae,R),O(xe,B),O(xe,P)),!0===Ge.svgFilters&&(O(Ae,L),O(xe,B),O(xe,P)),!0===Ge.mathMl&&(O(Ae,F),O(xe,j),O(xe,P))),t.ADD_TAGS&&(Ae===we&&(Ae=D(Ae)),O(Ae,t.ADD_TAGS)),t.ADD_ATTR&&(xe===Se&&(xe=D(xe)),O(xe,t.ADD_ATTR)),t.ADD_URI_SAFE_ATTR&&O(Ve,t.ADD_URI_SAFE_ATTR),t.FORBID_CONTENTS&&(We===qe&&(We=D(We)),O(We,t.FORBID_CONTENTS)),je&&(Ae["#text"]=!0),Le&&O(Ae,["html","head","body"]),Ae.table&&(O(Ae,["tbody"]),delete _e.tbody),m&&m(t),rt=t)},lt=O({},["mi","mo","mn","ms","mtext"]),ct=O({},["foreignobject","desc","title","annotation-xml"]),ut=O({},R);O(ut,L),O(ut,I);var st=O({},F);O(st,H);var mt=function(e){var t=ne(e);t&&t.tagName||(t={namespaceURI:Je,tagName:"template"});var n=N(e.tagName),r=N(t.tagName);if(e.namespaceURI===Ze)return t.namespaceURI===Je?"svg"===n:t.namespaceURI===Xe?"svg"===n&&("annotation-xml"===r||lt[r]):Boolean(ut[n]);if(e.namespaceURI===Xe)return t.namespaceURI===Je?"math"===n:t.namespaceURI===Ze?"math"===n&&ct[r]:Boolean(st[n]);if(e.namespaceURI===Je){if(t.namespaceURI===Ze&&!ct[r])return!1;if(t.namespaceURI===Xe&&!lt[r])return!1;var o=O({},["title","style","font","a","script"]);return!st[n]&&(o[n]||!ut[n])}return!1},ft=function(e){T(r.removed,{element:e});try{e.parentNode.removeChild(e)}catch(t){try{e.outerHTML=ae}catch(t){e.remove()}}},pt=function(e,t){try{T(r.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){T(r.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e&&!xe[e])if(He||Ue)try{ft(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},dt=function(e){var t,n;if(Fe)e="<remove></remove>"+e;else{var r=E(e,/^[\r\n\t ]+/);n=r&&r[0]}"application/xhtml+xml"===de&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");var o=oe?oe.createHTML(e):e;if(Qe===Je)try{t=(new g).parseFromString(o,de)}catch(e){}if(!t||!t.documentElement){t=le.createDocument(Qe,"template",null);try{t.documentElement.innerHTML=et?"":o}catch(e){}}var a=t.body||t.documentElement;return e&&n&&a.insertBefore(i.createTextNode(n),a.childNodes[0]||null),Qe===Je?se.call(t,Le?"html":"body")[0]:Le?t.documentElement:a},ht=function(e){return ce.call(e.ownerDocument||e,e,f.SHOW_ELEMENT|f.SHOW_COMMENT|f.SHOW_TEXT,null,!1)},gt=function(e){return e instanceof h&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof d)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore)},yt=function(t){return"object"===e(u)?t instanceof u:t&&"object"===e(t)&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName},bt=function(e,t,n){pe[e]&&b(pe[e],(function(e){e.call(r,t,n,rt)}))},vt=function(e){var t;if(bt("beforeSanitizeElements",e,null),gt(e))return ft(e),!0;if(E(e.nodeName,/[\u0080-\uFFFF]/))return ft(e),!0;var n=he(e.nodeName);if(bt("uponSanitizeElement",e,{tagName:n,allowedTags:Ae}),!yt(e.firstElementChild)&&(!yt(e.content)||!yt(e.content.firstElementChild))&&S(/<[/\w]/g,e.innerHTML)&&S(/<[/\w]/g,e.textContent))return ft(e),!0;if("select"===n&&S(/<template/i,e.innerHTML))return ft(e),!0;if(!Ae[n]||_e[n]){if(!_e[n]&&Nt(n)){if(ke.tagNameCheck instanceof RegExp&&S(ke.tagNameCheck,n))return!1;if(ke.tagNameCheck instanceof Function&&ke.tagNameCheck(n))return!1}if(je&&!We[n]){var o=ne(e)||e.parentNode,a=te(e)||e.childNodes;if(a&&o)for(var i=a.length-1;i>=0;--i)o.insertBefore(Q(a[i],!0),ee(e))}return ft(e),!0}return e instanceof s&&!mt(e)?(ft(e),!0):"noscript"!==n&&"noembed"!==n||!S(/<\/no(script|embed)/i,e.innerHTML)?(Re&&3===e.nodeType&&(t=e.textContent,t=A(t,ge," "),t=A(t,ye," "),e.textContent!==t&&(T(r.removed,{element:e.cloneNode()}),e.textContent=t)),bt("afterSanitizeElements",e,null),!1):(ft(e),!0)},Tt=function(e,t,n){if(Be&&("id"===t||"name"===t)&&(n in i||n in ot))return!1;if(Ce&&!Oe[t]&&S(be,t));else if(De&&S(ve,t));else if(!xe[t]||Oe[t]){if(!(Nt(e)&&(ke.tagNameCheck instanceof RegExp&&S(ke.tagNameCheck,e)||ke.tagNameCheck instanceof Function&&ke.tagNameCheck(e))&&(ke.attributeNameCheck instanceof RegExp&&S(ke.attributeNameCheck,t)||ke.attributeNameCheck instanceof Function&&ke.attributeNameCheck(t))||"is"===t&&ke.allowCustomizedBuiltInElements&&(ke.tagNameCheck instanceof RegExp&&S(ke.tagNameCheck,n)||ke.tagNameCheck instanceof Function&&ke.tagNameCheck(n))))return!1}else if(Ve[t]);else if(S(Ee,A(n,Ne,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==w(n,"data:")||!Ye[e]){if(Me&&!S(Te,A(n,Ne,"")));else if(n)return!1}else;return!0},Nt=function(e){return e.indexOf("-")>0},Et=function(e){var t,n,o,a;bt("beforeSanitizeAttributes",e,null);var i=e.attributes;if(i){var l={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:xe};for(a=i.length;a--;){var c=t=i[a],u=c.name,s=c.namespaceURI;if(n="value"===u?t.value:x(t.value),o=he(u),l.attrName=o,l.attrValue=n,l.keepAttr=!0,l.forceKeepAttr=void 0,bt("uponSanitizeAttribute",e,l),n=l.attrValue,!l.forceKeepAttr&&(pt(u,e),l.keepAttr))if(S(/\/>/i,n))pt(u,e);else{Re&&(n=A(n,ge," "),n=A(n,ye," "));var m=he(e.nodeName);if(Tt(m,o,n))try{s?e.setAttributeNS(s,u,n):e.setAttribute(u,n),v(r.removed)}catch(e){}}}bt("afterSanitizeAttributes",e,null)}},At=function e(t){var n,r=ht(t);for(bt("beforeSanitizeShadowDOM",t,null);n=r.nextNode();)bt("uponSanitizeShadowNode",n,null),vt(n)||(n.content instanceof l&&e(n.content),Et(n));bt("afterSanitizeShadowDOM",t,null)};return r.sanitize=function(t,o){var i,c,s,m,f;if((et=!t)&&(t="\x3c!--\x3e"),"string"!=typeof t&&!yt(t)){if("function"!=typeof t.toString)throw k("toString is not a function");if("string"!=typeof(t=t.toString()))throw k("dirty is not a string, aborting")}if(!r.isSupported){if("object"===e(n.toStaticHTML)||"function"==typeof n.toStaticHTML){if("string"==typeof t)return n.toStaticHTML(t);if(yt(t))return n.toStaticHTML(t.outerHTML)}return t}if(Ie||it(o),r.removed=[],"string"==typeof t&&(Pe=!1),Pe){if(t.nodeName){var p=he(t.nodeName);if(!Ae[p]||_e[p])throw k("root node is forbidden and cannot be sanitized in-place")}}else if(t instanceof u)1===(c=(i=dt("\x3c!----\x3e")).ownerDocument.importNode(t,!0)).nodeType&&"BODY"===c.nodeName||"HTML"===c.nodeName?i=c:i.appendChild(c);else{if(!He&&!Re&&!Le&&-1===t.indexOf("<"))return oe&&ze?oe.createHTML(t):t;if(!(i=dt(t)))return He?null:ze?ae:""}i&&Fe&&ft(i.firstChild);for(var d=ht(Pe?t:i);s=d.nextNode();)3===s.nodeType&&s===m||vt(s)||(s.content instanceof l&&At(s.content),Et(s),m=s);if(m=null,Pe)return t;if(He){if(Ue)for(f=ue.call(i.ownerDocument);i.firstChild;)f.appendChild(i.firstChild);else f=i;return xe.shadowroot&&(f=me.call(a,f,!0)),f}var h=Le?i.outerHTML:i.innerHTML;return Le&&Ae["!doctype"]&&i.ownerDocument&&i.ownerDocument.doctype&&i.ownerDocument.doctype.name&&S(X,i.ownerDocument.doctype.name)&&(h="<!DOCTYPE "+i.ownerDocument.doctype.name+">\n"+h),Re&&(h=A(h,ge," "),h=A(h,ye," ")),oe&&ze?oe.createHTML(h):h},r.setConfig=function(e){it(e),Ie=!0},r.clearConfig=function(){rt=null,Ie=!1},r.isValidAttribute=function(e,t,n){rt||it({});var r=he(e),o=he(t);return Tt(r,o,n)},r.addHook=function(e,t){"function"==typeof t&&(pe[e]=pe[e]||[],T(pe[e],t))},r.removeHook=function(e){if(pe[e])return v(pe[e])},r.removeHooks=function(e){pe[e]&&(pe[e]=[])},r.removeAllHooks=function(){pe={}},r}()}));
//# sourceMappingURL=purify.min.js.map
