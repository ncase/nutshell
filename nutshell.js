/*************************************************************************

NUTSHELL.JS

You know how in Memento, the amnesia guy tattoos reminders on his body?
That is how I document my code. The following "documentation"
is for future Nicky to remember what the heck they were doing.
If you find it helpful, that is a side effect.


== Design Principles ==

Dead Simple:
Just put a <script> in the header and that's it.
That's why this file even contains the CSS & others' minified libraries

Decentralized:
Nutshell Sections can be re-used across websites & authors!

Backwards Compatible:
Should work with blogs & writings that *already* exist.
Uses the standard markup to find sections: <h*>, <b>, etc
And heck, why not, Wikipedia API integration.

Minimalist:
don't send me any issues or pull requests for more features
thx


== Terminology ==

Nutshell: name of this library

Nutshell Section: a piece of text/html that can be embedded elsewhere.
  (sometimes just called "Section", or, confusingly, "Nutshell".)

Expandable: a button you can click to get an "expandable explanation"
  (also called just "Button" or "link". Look, I'm not consistent.)

Bubble: the box that expands below an expandable, containing a Nutshell Section


== What Nutshell Needs To Do (Spec) ==

1) Convert the top page (or a given element):

  a. Turn :links into expandable buttons
    <a href="pageURL#Section">:link text</a>
    should be converted to an expandable labeled "link text", that when clicked,
    expands a bubble with the section #Section (case-insensitive) from pageURL.

  b. Give <h*> headers two reveal-on-hover buttons:
    one for permalink, one to embed that Nutshell

  c. A modal dialogue to let readers embed Nutshells

  By default, do all this on DOMContentLoaded (no need for images loaded first)

2) When an Expandable is opened, it should...

  a. Get HTML of the source page
    If already cached, use that.
    If not,
      Get raw HTML:
        - If *this* page, easy peasy.
        - If remote page, try fetch.
          If CORS fails, use iframe & postMessage to get the HTML
        - If it's Wikipedia, use their API.
      Process it:
        - DOMPurify it: no styles, no scripts, iframes allowed but sandboxed
        - Convert all links to absolute, and open in new tab
      Cache it!

  b. Make an element to contain the Section
    Get the Section's HTML from id "#Section":
      - Very forgiving search: find the first <h*> that even *contains*
        the id "#Section", case-insensitive, don't care about punctuation.
        Get all <p> after that up until the next <h>, <hr>, or end of post
    Process it:
      - Convert :links to Nutshell Expandables (yay, recursion!)

  c. Put Section element below "expandable" (after punctuation) in a Bubble:
    - bubble head: link to source (if remote), embed button
    - bubble foot: close button

======================

SERIOUSLY, BIG STONES. WHAT'S IMPORTANT NEXT?

HIDE :HEADERS

VISUAL FIXES
- The arrow is screwed @done
- Close button at bottom @done
- Embed button for bubbles only on hover & doesn't look like trash @done
- (and not inside embed) @done
- ScrollTo when close wih bottom X. @done
- A better on-hover header to show embedding @done
- Style reset if link was in bold @done
- MAKE THE BUBBLE SUBTLY MOVE UP & DOWN TOO, ON TOP OF OPEN/CLOSE (to show zipping for long bubbles) @done
- After punctuation @done
- Continue text faded @done
- TODO: Better Embed Modal structure - Bubble, scroller-container, close button @done
- And hack: bold the nutshell via js... @done
- Trim embedded sections. (empty/whitespace paragraphs) // nah just fix Quill.
- test malicious: <a href="javascript:alert('xss')">some text</a> @done

=====================

BIGGEST STONES NEXT

Favicon & Meta unicode & title, w/e

MAIN PAGE LOOKS GOOD
- :headers auto-hide
- Big-ass styled buttons to start
- Animated header
- Fix text

TRY PAGE LOOKS GOOD
- Bigger text editor
- CodeMirror isn't screwed.

=====================

? non-english wiki, simple wiki?
- Style code, strike, underline, blockquote...
- TODO: Error Get it but section is blank (header after header)
- Don't scrollTo if parent is inside embedModal

TRY NUTSHELL

DOCUMENTATION PAGE

Lower crit mass by making it niche

yada ydad yadad

OTHER FEATURES:
- KaTEX
- YouTube / img
- Search bold, p
- If no SectionID, get whole thing
- hover preview

*************************************************************************/

{

    window.Nutshell = {};

    /////////////////////
    // Start Nutshell!
    /////////////////////

    // By default, start Nutshell on DOMContentLoaded
    // (you may want to delay this e.g. if your blog's content is AJAX'd in)
    window.addEventListener('DOMContentLoaded', ()=>{
        if(Nutshell.options.startOnLoad) Nutshell.start();
    });

    // NUTSHELL START
    Nutshell.start = (el=document.body)=>{

        // Restart!
        Nutshell.htmlCache = {};

        // IF TOP PAGE: Convert this page!
        // (By default, the whole document. But you can specify element, i.e. leaving out comments)
        // IF NOT: I must have been created for postMessage, give parent my HTML.
        if(window == window.top){

            // Add self's HTML to my own cached
            Nutshell.htmlCache[Nutshell.thisPageURL] = el.innerHTML;

            // Add styles & convert page
            Nutshell.addStyles();
            Nutshell.hideHeaders();
            Nutshell.convertLinksToExpandables(el);
            Nutshell.convertHeaders();

            // Fill out embed modal with localized text
            Nutshell.fillEmbedModalText();

        }else{

            // Tell my parent (from any origin) my HTML!
            _sendParentMyHTML();

        }
    };

    /////////////////////
    // Constants & Options
    /////////////////////

    const ANIM_TIME = 300;
    const CORS_WAIT_TIME = 9999;
    const HEADER_TAGS = ['h1','h2','h3','h4','h5','h6'];
    const END_PUNCTUATION = `.,?!)_~'"’”`;

    Nutshell.options = {
        startOnLoad: true, // Start Nutshell on load? (default: yes)
        //showOnHover: false, // Should bubbles be expanded on hover, instead of click? (default: no) click only on mobile?
        customCSS: '', // Add your own style
        lang: 'en' // Language
    };

    // A semantic sugar function to override options
    Nutshell.setOptions = (newOptions)=>{
        Object.keys(newOptions).forEach((key)=>{
            Nutshell.options[key] = newOptions[key];
        });
    };

    /////////////////////
    // Localizeable text
    /////////////////////

    Nutshell.language = {
        en: {

            // Nutshell errors...
            notFoundError: `Uh oh, the page was not found! Double check the link:`,
            loadingError: `Uh oh, the page was found but didn't hand over its content! Check that the other site has Nutshell installed or CORS enabled:`,
            sectionIDError: `Uh oh, there's no section that matches the ID #[ID]! Watch out for typos & regional spelling differences.`,

            // Embed modal!
            embedStep0: `You can embed this as an "expandable explanation" in your own blog/site!
                         Click to preview → [EXAMPLE]`,
            embedStep1: `Step 1) Copy this code into the [HEAD] of your site: [CODE]`,
            embedStep2: `Step 2) In your article, create a link to [LINK]
                         and make sure the link text starts with a
                         <a href="javascript:alert('like that link')">:colon</a>,
                         so Nutshell knows to make it expandable.`,
            embedStep3: `Step 3) That's all, folks! 🎉`,

        }
    };

    Nutshell.getLocalizedText = (textID)=>{
        let currentLanguage = Nutshell.options.lang,
            dictionary = Nutshell.language[currentLanguage];
        return dictionary[textID];
    }

    ///////////////////////////////////////////////////////////
    // Convert links to Expandable buttons
    ///////////////////////////////////////////////////////////

    Nutshell.convertLinksToExpandables = (dom)=>{

        // Get an array of all links, filtered by if the text starts with a :colon
        let expandables = [...dom.querySelectorAll('a')].filter(
            link => (link.innerText.trim().indexOf(':')==0)
        );

        // Turn each one into an Expandable!
        expandables.forEach((ex)=>{

            // Style: closed Expandable
            ex.classList.add('nutshell-expandable');
            ex.setAttribute("mode", "closed");

            // Remove colon, replace with animated balls
            let linkText = document.createElement('span');
            linkText.innerHTML = ex.innerText.slice(ex.innerText.indexOf(':')+1);
            linkText.className = 'nutshell-expandable-text';
            let ballUp = document.createElement('span');
            ballUp.className = 'nutshell-ball-up';
            let ballDown = document.createElement('span');
            ballDown.className = 'nutshell-ball-down';
            ex.innerHTML = '';
            ex.appendChild(linkText);
            ex.appendChild(ballUp);
            ex.appendChild(ballDown);

            // Save the punctuation!
            // Extremely inefficient: plop each character one-by-one into the span
            let punctuation = document.createElement('span');
            if(ex.nextSibling && ex.nextSibling.nodeValue){
                let nextChar;
                // get next char, is it punctuation?
                while( END_PUNCTUATION.indexOf(nextChar=ex.nextSibling.nodeValue[0]) >= 0 ){
                    ex.nextSibling.nodeValue = ex.nextSibling.nodeValue.slice(1); // slice off the rest
                    punctuation.innerHTML += nextChar; // slap it on
                }
            }
            ex.parentNode.insertBefore(punctuation, ex.nextSibling); // add right after expandable

            // Follow up by repeating last sentence, UNLESS IT'S THE START/END OF PARAGRAPH ALREADY.
            let hasWordsAfterExpandable = punctuation.nextSibling
                                          && punctuation.nextSibling.nodeValue
                                          && punctuation.nextSibling.nodeValue.trim().length>3;
            let followupSpan = document.createElement('span');
            followupSpan.style.display = 'none';
            followupSpan.className = 'nutshell-followup';
            ex.parentNode.insertBefore(followupSpan, punctuation.nextSibling); // add right after punctuation

            // Short or long followup TEXT?
            let shortFollowupHTML = '...', // just dots
                longFollowupHTML = '';
            if(hasWordsAfterExpandable){

                // Get last sentence *including html markup*...
                let htmlBeforeThisLink = ex.parentNode.innerHTML.split( ex.outerHTML )[0],
                    sentencesBeforeThisLink = htmlBeforeThisLink.split(/[.?!]\s/g),
                    lastSentenceHTML = sentencesBeforeThisLink[sentencesBeforeThisLink.length-1];

                // Hack: convert to TEXT not html. Strip out <a>, <i>, <b>, etc
                followupSpan.innerHTML = lastSentenceHTML;
                longFollowupHTML = followupSpan.innerText;

                // ...then the expandable text in bold, then punctuation
                longFollowupHTML += '<b>' + ex.innerHTML + '</b>' + punctuation.innerHTML;

            }

            // Show on hover, or on click?
            let _bubble = null;
            ex.close = ()=>{ // close() but not open() needs to be publicly accessible,
                               // because there's 2 ways to close but only 1 to open.
                _bubble.close();
                _bubble = null;
                ex.setAttribute("mode", "closed");
                setTimeout(ex.updateFollowup, ANIM_TIME);
            };
            ex.updateFollowup = ()=>{ // accessible so bubble can update it when content loads
                if(!_bubble || !hasWordsAfterExpandable){
                    // if closed (or no words after), hide
                    followupSpan.style.display = 'none';
                }else{
                    // if open, show only if bubble's textContent is above 50 words
                    let longEnough = (_bubble.textContent.trim().split(" ").length>=50);
                    followupSpan.style.display = 'inline';
                    followupSpan.innerHTML = longEnough ? longFollowupHTML : shortFollowupHTML;
                }
            };
            if(Nutshell.options.showOnHover){
                // ON MOUSEOVER, show
                /*link.addEventListener('mouseover',(e)=>{
                    if(!link.bubble) link.bubble = Nutshell.createBubble(link); // super hacky
                });*/
            }else{
                // ON CLICK: toggle open/closed
                ex.addEventListener('click',(e)=>{

                    // Don't actually go to that link.
                    e.preventDefault();

                    // Toggle create/close
                    if(!_bubble){
                        // Is closed, make OPEN
                        _bubble = Nutshell.createBubble(ex, e.offsetX);
                        ex.parentNode.insertBefore(_bubble, punctuation.nextSibling); // place the bubble AFTER PUNCTUATION
                        ex.setAttribute("mode", "open");
                        ex.updateFollowup();
                    }else{
                        // Is open, make CLOSED
                        ex.close();
                    }

                });
            }
        });
    };

    ///////////////////////////////////////////////////////////
    // Get processed HTML of a given source page.
    ///////////////////////////////////////////////////////////

    // What's THIS page's URL?
    Nutshell.thisPageURL = location.protocol + '//' + location.host + location.pathname;

    // Not very picky about what's in the cache
    // Could be just <p>'s, or the entire <body> with nav & comments
    Nutshell.htmlCache = {};

    // Promise PROCESSED html!
    Nutshell.promiseProcessedHTMLFromURL = (url)=>{

        // A promise...
        return new Promise((resolveProcessedHTML, rejectProcessedHTML)=>{

            // If already in cache, return that.
            if(Nutshell.htmlCache[url]){
                resolveProcessedHTML(Nutshell.htmlCache[url]);
                return; // STOP.
            }

            // If not, what kind of link is it?
            if(_isWikipedia(url)){

                // IT'S WIKIPEDIA! USE THAT API.
                // The article title is the last bit of the URL
                let splitURL = url.split("/"),
                    articleTitle = splitURL[splitURL.length-1];

                // Fetch lede
                let resourceParams = {
                    // Request from anywhere, in JSON
                    action: "query", origin: "*", format: "json",
                    // Extract just the lead paragraph
                    prop: "extracts", exintro: "",
                    // THIS PAGE
                    titles: articleTitle
                }
                let resourceQueryString = _objectToURLParams(resourceParams);
                let resourceURL = `https://simple.wikipedia.org/w/api.php?${resourceQueryString}`;
                fetch(resourceURL)
                    .then(response => response.json())
                    .then(data => {
                        // TODO: Handle Wikipedia link fail
                        let pageKey = Object.keys(data.query.pages)[0],
                            pageHTML = data.query.pages[pageKey].extract;
                        // Cache it
                        Nutshell.htmlCache[url] = pageHTML;
                        // FULFIL THE PROPHECY
                        resolveProcessedHTML(pageHTML);
                    });

            }else{

                // OTHERWISE, the usual: fetch remote

                // FIRST, get RAW HTML.
                let getRawHTMLPromise = new Promise((resolveRawHTML, rejectRawHTML)=>{
                    fetch(url)
                        .then(response => {
                            if(!response.ok) throw Error('404'); // 404's ain't ok
                            else return response.text();
                        })
                        .then(data => {
                            // No, I don't know why I can't just do data=>resolveRawHTML
                            resolveRawHTML(data); // anyway, yay it worked.
                        })
                        .catch(err => {

                            // If it failed due to 404, tell user
                            if(err.message=='404'){
                                return rejectProcessedHTML(
                                    `<p>
                                    ${Nutshell.getLocalizedText("notFoundError")}
                                    <a target='_blank' href='${url}'>${url}</a>
                                    </p>`
                                );
                            }else{

                                // Otherwise, *assume* it failed due to CORS.
                                // (browser can't tell me directly for security reasons)
                                // Try using iframe & postMessage to get the HTML:

                                // Set up safe iframe to speak to...
                                let safeIframe = document.createElement('iframe');
                                safeIframe.setAttribute('sandbox','allow-scripts');
                                safeIframe.style.display = 'none';
                                safeIframe.src = url;

                                // Set up listener...
                                let _messageListener = window.addEventListener("message", (message)=>{
                                    let data = JSON.parse(message.data);
                                    // Only accept this message if it's loading the URL we want:
                                    // (Otherwise, problems when loading multiple URLs at same time)
                                    if(data.url == url){
                                        _removeIframeAndListener(); // done!
                                        resolveRawHTML(data.html);
                                    }
                                });

                                // Callback to remove both...
                                let _alreadyRemoved = false;
                                let _removeIframeAndListener = ()=>{
                                    if(_alreadyRemoved) return; // once-r
                                    window.removeEventListener("message", _messageListener);
                                    document.body.removeChild(safeIframe);
                                    _alreadyRemoved = true;
                                };

                                // Go!
                                document.body.appendChild(safeIframe);

                                // (Wait some time before giving up, and telling user)
                                setTimeout(()=>{
                                    _removeIframeAndListener();
                                    rejectProcessedHTML(
                                        `<p>
                                        ${Nutshell.getLocalizedText("loadingError")}
                                        <a target='_blank' href='${url}'>${url}</a>
                                        </p>`
                                    );
                                },CORS_WAIT_TIME);

                            }
                        });
                });

                // SECOND, make PROCESSED HTML
                getRawHTMLPromise.then((rawHTML)=>{

                    // DOMPurify: no styles, no scripts, iframes allowed (but sandboxed later)
                    let cleanHTML = DOMPurify.sanitize(rawHTML,{
                        FORBID_ATTR: ['style'],
                        FORBID_TAGS: ['style'],
                        ADD_TAGS: ['iframe']
                    });

                    // A <span> for further editing the clean HTML.
                    let cleanSpan = document.createElement('div');
                    cleanSpan.innerHTML = cleanHTML;

                    // Sandbox all iframes
                    [...cleanSpan.querySelectorAll('iframe')].forEach(iframe=>{
                        iframe.setAttribute('sandbox','allow-scripts');
                    });

                    // Image src's + link href's to absolute
                    _convertRelativeToAbsoluteLinks("img", "src", url, cleanSpan);
                    _convertRelativeToAbsoluteLinks("a", "href", url, cleanSpan);

                    // Make all links open in new tab, don't ruin reading flow.
                    [...cleanSpan.querySelectorAll('a')].forEach((a)=>{
                        a.target = "_blank";
                    });

                    // THEN CACHE & GIMME
                    Nutshell.htmlCache[url] = cleanSpan.innerHTML;
                    resolveProcessedHTML( Nutshell.htmlCache[url] );

                });
            }
        });
    };

    // Is it Wikipedia? Special edge case.
    let _isWikipedia = (url)=>{
        return url.indexOf('wikipedia.org')>=0;
    };

    // Convert key-values to key1=value1&key2=value2 etc. Also encode URI
    let _objectToURLParams = (obj)=>{
        return Object.keys(obj)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
            .join("&");
    };

    // Convert all links in a element to absolute links
    let _convertRelativeToAbsoluteLinks = (tag, attr, baseURL, el)=>{
        [...el.querySelectorAll(tag)].forEach((el)=>{
            let relative = el.getAttribute(attr),
                absolute = new URL(relative,baseURL).href;
            el[attr] = absolute;
        });
    };

    // Ma, here's my HTML!
    let _sendParentMyHTML = ()=>{
        window.parent.postMessage(
            JSON.stringify({
                url: Nutshell.thisPageURL, // the url I'm repping
                html: document.body.innerHTML
            }),
        '*');
    };


    ///////////////////////////////////////////////////////////
    // Get a Section from processed HTML
    // & put it in a container, given an Expandable's data
    ///////////////////////////////////////////////////////////

    // Promise!
    Nutshell.promiseSectionContainer = (expandable)=>{

        // A promise...
        return new Promise((resolve,reject)=>{

            // Get expandable's url & #SectionID
            let href = expandable.href,
                splitHref = href.split("#"),
                url = splitHref[0],
                sectionID = splitHref[1];

            // The container for the Section
            let container = document.createElement('div'),
                containerHTML = '';

            // After getting the processed HTML,
            // find the section using #SectionID,
            // then put it in a container, and resolve with that.
            Nutshell.promiseProcessedHTMLFromURL(url).then((processedHTML)=>{

                if(_isWikipedia(url)){
                    // If it's Wikipedia, no need for #SectionID search! Just give it:
                    containerHTML = processedHTML;
                }else{

                    // Otherwise, search for the #SectionID

                    // An element to safely search
                    let safeEl = document.createElement('div');
                    safeEl.innerHTML = processedHTML;

                    // Forgiving-search the <tags> for #sectionID
                    let foundHeader = null;

                    // FIRST, try <h*> header tags...
                    for(let i=0; i<HEADER_TAGS.length; i++){
                        let tag = HEADER_TAGS[i],
                            headers = [...safeEl.querySelectorAll(tag)];
                        // ...and for each header of that <h*> tag...
                        for(let j=0; j<headers.length; j++){
                            let header = headers[j];
                            // Do _forgivingMatchTest, return THE FIRST ONE THAT WORKS, BREAK.
                            if(_forgivingMatchTest(header.innerText,sectionID)){
                                foundHeader = header;
                            }
                            if(foundHeader) break;
                        }
                        if(foundHeader) break;
                    }

                    // TODO: Still not found? Try <b>, <i>, and so on...
                    if(!foundHeader){
                    }

                    // If after all that, STILL none, tell user the error.
                    if(!foundHeader){
                        containerHTML = `<p>${Nutshell.getLocalizedText("sectionIDError").replace('[ID]',sectionID)}</p>`;
                    }

                    // Otherwise, now get everything from the start of the section
                    // (right after header) to end of section (next header, <hr>, or end-of-post)
                    if(foundHeader){

                        // Iterate node by node...
                        let currentNode = foundHeader,
                            foundEndOfSection = false;
                        while(!foundEndOfSection){

                            // Do I even have a next sibling?
                            currentNode = currentNode.nextSibling;
                            if(currentNode){

                                // If yes, what's its tag?
                                if(currentNode.tagName){
                                    // If it's a header or <hr>, FOUND END.
                                    let currentTag = currentNode.tagName.toLowerCase();
                                    if(HEADER_TAGS.indexOf(currentTag)>=0 || currentTag=='hr'){
                                        foundEndOfSection = true;
                                    }else{
                                        // If not, add it to the container and move on.
                                        containerHTML += currentNode.outerHTML;
                                    }
                                }else{
                                    // If no tag at all, it's probably text? Add it. TODO: check
                                    containerHTML += currentNode.textContent;
                                }

                            }else{
                                // ...If no next sibling, FOUND END.
                                foundEndOfSection = true;
                            }

                        }
                    }
                }

                // Now deliver the promised container, containing the section!
                container.innerHTML = containerHTML;
                resolve(container);

            }).catch((message)=>{

                // IF SOMETHING ALONG THIS ENTIRE PROCESS WENT WRONG, TELL USER.
                container.innerHTML = message;
                resolve(container);

            });

        });

    };

    // Do a forgiving match between two strings: src, test
    // Capitalization & punctuation insensitive + src at least CONTAINS test
    let _forgivingMatchTest = (src, test)=>{

        // Lowercase & strip everything but letters
        src = src.toLowerCase().replace(/[^a-z]/g,'');
        test = test.toLowerCase().replace(/[^a-z]/g,'');

        // Src at least CONTAINS test?
        let srcContainsTest = (src.indexOf(test)>=0);
        return srcContainsTest;

    };

    ///////////////////////////////////////////////////////////
    // Create bubble, using an expandable's data
    // RETURNS: that bubble's element
    ///////////////////////////////////////////////////////////

    Nutshell.createBubble = (expandable, clickX)=>{

        /**************************

        BUBBLE ELEMENT & ANIMATION STRUCTURE

        Bubble:
        - Arrow (sticks out of bubble)
        - Overflow container
          - Embed button, reveal on hover
          - Section (left & right padded)
            - "from URL..."
            - Recursive bubbles (sticks out of padding)
          - Close button

        Animation:
          Opening:
            - calculate Section height
            - animate Overflow's height from 0px to (section height + head/foot)px
            - then make Overflow's height auto again (so can stretch when recursive bubbles appear)
          Closing:
            - animate Overflow's height going to 0
            - then delete bubble element

        **************************/

        // Make a bubble container!
        let bubble = document.createElement('div');
        bubble.className = 'nutshell-bubble';
        // Subtly move down
        bubble.style.top = '-5px';
        setTimeout(()=>{ bubble.style.top = '0px'; },1);
        // RESET FONT STYLE to that of first parent <p>. Or document.body.
        let p = _findFirstParentWithFilter(bubble,(p)=>{
            return p.tagName=="P";
        }) || document.body;
        let topPageStyle = window.getComputedStyle(p);
        bubble.style.color = topPageStyle.color;
        bubble.style.fontSize = topPageStyle.fontSize;
        bubble.style.fontStyle = topPageStyle.fontStyle;
        bubble.style.fontWeight = topPageStyle.fontWeight;
        bubble.style.lineHeight = topPageStyle.lineHeight;
        bubble.style.textDecoration = topPageStyle.textDecoration;

        // A speech-bubble arrow, positioned at X of *where you clicked*???
        let arrow = document.createElement("div");
        arrow.className = "nutshell-bubble-arrow";
        bubble.appendChild(arrow);

        // Position the arrow, starting at 20px left of the click...
        // SO HACKY.
        {
            // (since 20px is half the arrow's width)
            let arrowX = clickX-20;

            // What's width of the paragraph the expandable is in?
            let p = _findFirstParentWithFilter(expandable,(p)=>{
                return p.tagName=="P";
            });
            p = p ? p : document.body; // oh whatever, by default.
            let paragraphWidth = p.getBoundingClientRect().width;

            // What's the width of the container the expandable is in?
            let cont = _findFirstParentWithFilter(p,(cont)=>{
                return cont.className=='nutshell-bubble-overflow-section';
            });
            if(cont){
                let sectionWidth = cont.getBoundingClientRect().width,
                    padding = (sectionWidth-paragraphWidth)/2;
                arrowX += padding-3; // iunno, border & padding
            }

            // Don't let the arrow go past bubble's rounded corners (33px)
            if(arrowX < 33) arrowX = 33; // left
            if(arrowX > paragraphWidth-33) arrowX = paragraphWidth-33; // right

            // Finally, place that arrow.
            arrow.style.left = arrowX+"px";
        }

        // The Overflow container
        let overflow = document.createElement('div');
        overflow.className = 'nutshell-bubble-overflow';
        overflow.setAttribute("mode","opening");
        overflow.style.height = "0px"; // start closed
        bubble.appendChild(overflow);

        // Embed Button
        let embed = document.createElement('div');
        embed.className = 'nutshell-bubble-overflow-embed-button';
        embed.innerHTML = `<img src='${Nutshell._dataURIImage}'/>`;
        embed.onclick = ()=>{
            Nutshell.showEmbedModal(expandable.href, expandable.textContent);
        };
        overflow.appendChild(embed);

        // Section
        let section = document.createElement('div');
        section.className = "nutshell-bubble-overflow-section";
        overflow.appendChild(section);

        // Close Button
        let close = document.createElement('div');
        close.className = 'nutshell-bubble-overflow-close';
        close.innerHTML = '&times;';
        close.onclick = ()=>{

            // Close my parent, which'll also close me
            expandable.close();

            // Then scroll to that parent expandable *if it's offscreen*
            let parentTop = expandable.getBoundingClientRect().top;
            if(parentTop<0){
                window.scrollTo({
                    top: parentTop + window.pageYOffset,
                    behavior: 'smooth'
                });
            }

        };
        overflow.appendChild(close);

        /////////////////////////
        // OPENING //////////////
        /////////////////////////

        // For "..." loading anim
        let _isSectionLoadedYet = false;

        // Get the section (using expandable's data),
        // and put it in bubble's Section Container when it loads!
        Nutshell.promiseSectionContainer(expandable).then((content)=>{

            // Links to Nutshell Expandables (yay recursion!)
            Nutshell.convertLinksToExpandables(content);

            // Put in section's content
            section.innerHTML = '';
            section.appendChild(content);

            // TODO: ONLY SHOW EMBED & FROM IF *SUCCESSFUL* LOAD

            // And animate! Go to full height, then auto.
            overflow.style.height = section.getBoundingClientRect().height+"px";
            setTimeout(()=>{ overflow.style.height="auto"; }, ANIM_TIME);

            // Oh, and update expandable's followup
            expandable.updateFollowup();

            // Yes.
            _isSectionLoadedYet = true;

        });

        // While waiting to load, show "..." anim
        setTimeout(()=>{
            if(!_isSectionLoadedYet){

                // Dots: add a dot per second...
                let dots = document.createElement("p");
                // Doing recursive setTimeout instead of "setInterval"
                // so I don't deal with figuring out how to clear an interval
                // from the above Promise with a totally different scope:
                let _addDot = ()=>{
                    if(!_isSectionLoadedYet){
                        dots.innerHTML += '.';
                        setTimeout(_addDot,1000);
                    }
                };
                _addDot();

                // Animate to height of the dots
                section.innerHTML = '';
                section.appendChild(dots);
                overflow.style.height = section.getBoundingClientRect().height+"px";

            }
        },10);

        /////////////////////////
        // CLOSING //////////////
        /////////////////////////

        // Close Animation
        bubble.close = ()=>{

            // Subtly move up
            bubble.style.top = '-5px';

            // Can't start an animation from "auto", so set height to current height
            overflow.style.height = overflow.getBoundingClientRect().height + "px";

            // NOW close it.
            setTimeout(()=>{
                overflow.setAttribute("mode","closing");
                overflow.style.height = "0px";
            },1);

            // Afterwards, delete node.
            setTimeout(()=>{
                bubble.parentNode.removeChild(bubble);
                expandable.setAttribute("mode", "closed"); // and tell Expandable to show it, too
            }, ANIM_TIME+1);

        };

        // Finally, return this magnificent created Bubble!
        return bubble;

    };

    let _findFirstParentWithFilter = (el,filter)=>{
        let original = el;
        while( el && !filter(el) ){ // first parent who passes
            el = el.parentNode;
        }
        return el; // if any
    }

    ///////////////////////////////////////////////////////////
    // Convert <h*> headers: On hover, show embed option
    ///////////////////////////////////////////////////////////

    Nutshell.convertHeaders = ()=>{

        // For each header, a container that only shows on hover!
        _getAllHeaders().forEach((header)=>{

            // So it can show stuff on hover
            header.classList.add('nutshell-header');

            // Info needed for embed & permalink
            let headerText = header.innerText,
                sectionID = headerText.replace(/[^A-Za-z]/g,''), // bye punctuation
                permalink = Nutshell.thisPageURL+"#"+sectionID;

            // Embed button
            let embedButton = document.createElement('div');
            embedButton.className = 'nutshell-header-embed';
            embedButton.innerHTML = `<img src='${Nutshell._dataURIImage}'/>`;
            embedButton.onclick = ()=>{
                Nutshell.showEmbedModal(permalink, headerText);
            };
            header.appendChild(embedButton);

        });

    };

    let _getAllHeaders = ()=>{
        let allHeaders = [];
        for(let i=0; i<HEADER_TAGS.length; i++){
            let tag = HEADER_TAGS[i];
            allHeaders = allHeaders.concat( [...document.body.querySelectorAll(tag)] ); // big ol' array
        }
        return allHeaders;
    }

    ///////////////////////////////////////////////////////////
    // If header begins with colon, replace it and following section with just a link!
    ///////////////////////////////////////////////////////////

    Nutshell.hideHeaders = ()=>{

        // Temporary dividers to remove later...
        let tmpDividers = [];

        // For each found header with :colon...
        _getAllHeaders().filter((header)=>{
            return header.innerText.trim()[0]==":";
        }).forEach((header)=>{

            // Put a link before the header
            let link = document.createElement("a");
            link.href = "#" + header.innerText.replace(/[^A-Za-z]/g,''), // A section ID
            link.innerText = ":" + header.innerText.trim().slice(1).trim(); // remove first char
            header.parentNode.insertBefore(link, header);

            // And insert a <br> after the link
            let br = document.createElement("br");
            link.parentNode.insertBefore(br, link.nextSibling);

            // Put a <hr> before the link,
            // so it won't be confused with a previous section.
            let hr = document.createElement("hr");
            link.parentNode.insertBefore(hr, link);
            tmpDividers.push(hr);

            // Then delete every node following until next header, hr, or end of post.
            let currentNode = header,
                foundEndOfSection = false;
            while(!foundEndOfSection){

                // Move on to next, then destroy this one.
                // ("then", coz can't get next sibling in DOM if already dead
                let nextNode = currentNode.nextSibling;
                currentNode.parentNode.removeChild(currentNode);
                currentNode = nextNode;

                // Is there a next node at all?
                if(!nextNode){
                    // If not, FOUND END.
                    foundEndOfSection = true;
                }else{
                    // If yes, what's its tag? (if any?)
                    if(nextNode.tagName){
                        // If it's a header or <hr>, FOUND END.
                        let currentTag = nextNode.tagName.toLowerCase();
                        if(HEADER_TAGS.indexOf(currentTag)>=0 || currentTag=='hr'){
                            foundEndOfSection = true;
                        }
                    }
                }

            }

        });

        // NOW remove all those temporary dividers
        tmpDividers.forEach((hr)=>{
            hr.parentNode.removeChild(hr);
        });

    };

    ///////////////////////////////////////////////////////////
    // THE EMBED MODAL (IT'S A BIG 'UN)
    ///////////////////////////////////////////////////////////

    // Create that big ol' element. Start hidden
    Nutshell.embedModal = document.createElement("div");
    let _e = Nutshell.embedModal;
    _e.className = 'nutshell-embed-modal';
    _e.setAttribute("mode","hidden");
    _e.style.display = 'none';

    // Will fill out HTML later with localized text
    _e.innerHTML = `
        <div id="nutshell-embed-modal-bg" onclick="Nutshell.closeEmbedModal();"></div>
        <div id="nutshell-embed-modal-bubble">
            <div id="nutshell-embed-modal-close" onclick="Nutshell.closeEmbedModal();">&times;</div>
            <div id="nutshell-embed-modal-overflow">
                <p id="nutshell-embed-p0"></p>
                <p id="nutshell-embed-p1"></p>
                <p id="nutshell-embed-p2"></p>
                <p id="nutshell-embed-p3"></p>
            </div>
        </div>
    `;

    // Shortcut variables because ugh this is messy code
    let _p0 = _e.querySelector("#nutshell-embed-p0"),
        _p1 = _e.querySelector("#nutshell-embed-p1"),
        _p2 = _e.querySelector("#nutshell-embed-p2"),
        _p3 = _e.querySelector("#nutshell-embed-p3");

    // When Nutshell starts, populate with text localization
    Nutshell.fillEmbedModalText = ()=>{

        // Step 0: Intro, and example Expandable
        // [DO THIS WHEN SHOW MODAL, because example needs to change each time]

        // Step 1: Code for head
        _p1.innerHTML = Nutshell.getLocalizedText("embedStep1")
            .replace(`[HEAD]`, `<span style="font-family:monospace">&lt;head&gt;</span>`)
            .replace(`[CODE]`, `<input style="width:100%" value="code code code" onclick="select()"/>`);

        // Step 2: Link
        _p2.innerHTML = Nutshell.getLocalizedText("embedStep2")
            .replace(`[LINK]`,`
                <input id="nutshell-embed-modal-link" onclick="select()"/>`);

        // Step 3: That's all, folks!
        _p3.innerHTML = Nutshell.getLocalizedText("embedStep3");

        // Also, now that document.body exists, put it in
        document.body.appendChild(_e);

    };

    // Show Embed Modal (with what URL & linktext?)
    Nutshell.showEmbedModal = (url, linkText)=>{

        // Animate: show, then fade in.
        _e.style.display = 'block';
        setTimeout(()=>{ _e.setAttribute("mode","shown"); },1);

        // Reset Step 0's Example
        _p0.innerHTML = Nutshell.getLocalizedText("embedStep0")
            .replace(`[EXAMPLE]`,`<a href='${url}' style='font-weight:bold'>:${linkText}</a>`);
        Nutshell.convertLinksToExpandables(_p0);

        // Update Step 2's link URL
        _e.querySelector("#nutshell-embed-modal-link").value = url;

    };

    // Hide Embed Modal
    Nutshell.closeEmbedModal = ()=>{
        // Animate: fade away, then hide
        _e.setAttribute("mode","hidden");
        setTimeout(()=>{ _e.style.display='none'; },ANIM_TIME);
    };

    /////////////////////
    // Nutshell Styling
    /////////////////////

    Nutshell._dataURIImage = "data:image/png;base64,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";

    Nutshell.defaultStyle = `

    /***************************************************
    HEADERS with link / embed options
    ***************************************************/

    .nutshell-header{
        position:relative;
    }
    .nutshell-header-embed{

        /* Position at end of header text */
        width: 0; /* don't force newline */
        display: inline-block;
        position: relative;
        top:0.14em; left:0;

        /* Button, reveal on hover */
        opacity:0;
        cursor: pointer;
        transition: all 0.1s ease-in-out;

    }
    .nutshell-header-embed img{
        width:1em; height:1em;
    }
    .nutshell-header:hover .nutshell-header-embed{
        left:0.25em;
        opacity:0.33;
    }
    .nutshell-header:hover .nutshell-header-embed:hover{
        opacity:1;
    }

    /***************************************************
    EXPANDABLE LINKS
    ***************************************************/

    .nutshell-expandable{

        /* Boring style to fit parent */
        color: inherit;
        text-decoration: none;
        border-bottom: dotted 1.5px;

        /* So those balls work */
        position:relative;

        /* Animate opacity on hover */
        transition: opacity 0.1s ease-in-out;
        opacity: 1;

    }
    .nutshell-expandable:hover{
        opacity: 0.8;
    }
    .nutshell-expandable .nutshell-expandable-text{
        padding-left: 0.35em; /* Give balls space */
    }
    /* The balls! */
    .nutshell-ball-up, .nutshell-ball-down{

        /* Placed to the left */
        position: absolute;
        display: inline-block;
        left: 1px;

        /* They're balls */
        width: 0.15em;
        height: 0.15em;
        background: #000;
        border-radius: 1em;

        /* Animate moving up & down */
        transition: top 0.1s ease-in-out;

    }
    /* Ball animation! Depends on open/closed, hover */
    .nutshell-expandable[mode=closed] .nutshell-ball-up{            top:0.4em;  }
    .nutshell-expandable[mode=closed] .nutshell-ball-down{          top:0.7em;  }
    .nutshell-expandable[mode=closed]:hover .nutshell-ball-up{      top:0.2em;  }
    .nutshell-expandable[mode=closed]:hover .nutshell-ball-down{    top:0.9em;  }
    .nutshell-expandable[mode=open] .nutshell-ball-up{              top:0.4em;  }
    .nutshell-expandable[mode=open] .nutshell-ball-down{            top:0.7em;  }
    .nutshell-expandable[mode=open]:hover .nutshell-ball-up{        top:0.55em; }
    .nutshell-expandable[mode=open]:hover .nutshell-ball-down{      top:0.55em; }

    /* Followup! */
    .nutshell-followup{
        opacity:0.33;
    }

    /***************************************************
    BUBBLES:
    ***************************************************/

    .nutshell-bubble{

        /* Gon' stretch out */
        display: inline-block;
        width: 100%;

        /* It's nice & speech-bubble-lookin' */
        border: 1px solid black;
        border-radius: 20px;

        /* For the speech-bubble arrow */
        position: relative;
        margin-top: 22px;

        /* For subtle move up & down */
        position: relative;
        top: 0;
        transition: top 0.3s linear;

    }

    /* Arrow outline */
    .nutshell-bubble-arrow{
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-bottom: 20px solid #000;
        position: absolute;
        top: -20px;
        pointer-events: none; /* don't block clicking */
    }

    /* Arrow white */
    .nutshell-bubble-arrow::after{
        content: "";
        width: 0;
        height: 0;
        border-left: 20px solid transparent;
        border-right: 20px solid transparent;
        border-bottom: 20px solid #fff;
        position: absolute;
        top: 1.5px;
        left: -20px;
        pointer-events: none; /* don't block clicking */
    }

    /* Overflow: contains the head/section/food */
    .nutshell-bubble-overflow{
        overflow: hidden;
    }
    .nutshell-bubble-overflow[mode=opening]{
        transition: height 0.3s ease-out; /* Snap to open */
    }
    .nutshell-bubble-overflow[mode=closing]{
        transition: height 0.3s ease-in; /* Snap to close */
    }

    /* Head: Embed Button, show on hover */
    .nutshell-bubble-overflow-embed-button{
        position: absolute;
        top:5px; right:10px;
        width:1em; height:1em;
        opacity:0;
        transition: all 0.1s ease-in-out;
        cursor:pointer;
    }
    .nutshell-bubble-overflow-embed-button img{
        width:1em; height:1em;
    }
    .nutshell-bubble-overflow:hover > .nutshell-bubble-overflow-embed-button{
        right: 5px;
        opacity: 0.33;
    }
    .nutshell-bubble-overflow:hover > .nutshell-bubble-overflow-embed-button:hover{
        opacity: 1.0;
    }
    /* NO EMBEDDING IF IT'S A PREVIEW INSIDE EMBED MODAL */
    .nutshell-embed-modal .nutshell-bubble-overflow-embed-button{
        display:none;
    }

    /* Section */
    .nutshell-bubble-overflow-section{
        padding: 0 1em;
        padding-bottom: 0.5em;
        overflow: hidden; /* to capture full height, including <p>'s margins */
    }
    .nutshell-bubble-overflow-section > div{
        margin: 1em 0; /* if you people forgot to put your text in <p>'s -_- */
    }
    .nutshell-bubble-overflow-section img{
        max-width:100%; /* so it fits */
    }
    .nutshell-bubble-overflow-section iframe{
        max-width:100%; /* so it fits */
        border: 1px solid rgba(0,0,0,0.2);
    }
    .nutshell-bubble-overflow-section .nutshell-bubble{
        /* So that recursive bubbles don't get squashed too quickly */
        width: calc(100% + 40px - 6px); /* undo section's padding, minus a gap */
        position: relative;
        right: calc(1em - 2px);
    }

    /* Foot: is a close button, too. */
    .nutshell-bubble-overflow-close{

        /* A lightweight &times; sign */
        font-weight: 100;
        text-align: center;

        /* Whole-width bottom */
        position:absolute;
        width:100%;
        bottom:0;

        /* A button that gets darker. */
        cursor:pointer;
        opacity: 0.33;
        transition: opacity 0.1s ease-in-out;

    }
    .nutshell-bubble-overflow-close:hover{
        opacity:1;
    }

    /***************************************************
    EMBED MODAL
    ***************************************************/

    .nutshell-embed-modal{

        /* TAKE UP WHOLE SCREEN */
        position: fixed;
        z-index: 99999;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;

        /* Animate by fade in */
        transition: opacity 0.3s ease-in-out;
        opacity: 1;
    }
    .nutshell-embed-modal[mode=shown]{  opacity:1; }
    .nutshell-embed-modal[mode=hidden]{ opacity:0; }

    /* Background is a big transparent black */
    #nutshell-embed-modal-bg{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
    }

    /* Bubble is a big white rounded rect */
    #nutshell-embed-modal-bubble{

        /* In the middle */
        position: absolute;
        margin: auto;
        top: 0; left: 0; right: 0; bottom: 0;
        width: 600px;
        height: 450px;

        /* Color & font */
        background: #fff;
        border-radius: 30px;
        font-size: 20px;
        line-height: 1.5em;

        /* Animate by slide up */
        transition: top 0.3s ease-in-out;
    }
    .nutshell-embed-modal[mode=shown] #nutshell-embed-modal-bubble{  top:0;     }
    .nutshell-embed-modal[mode=hidden] #nutshell-embed-modal-bubble{ top:100px; }

    /* Close button */
    #nutshell-embed-modal-close{

        /* Top right button */
        position: absolute;
        top: 5px; right: 10px;
        cursor: pointer;

        /* Just a times sign */
        font-size: 40px;
        font-weight: 100;
        height: 40px;

        /* Anim */
        opacity: 0.25;
        transition: opacity 0.1s ease-in-out;

    }
    #nutshell-embed-modal-close:hover{
        opacity:1;
    }

    /* Can scroll inside! */
    #nutshell-embed-modal-overflow{
        overflow-x: visible;
        overflow-y: scroll;
        padding: 15px 30px;
        width: calc(100% - 60px);
        height: calc(100% - 30px);
    }

    /* The "inputs" in the modal should look code-like */
    #nutshell-embed-modal-bubble input{
        width: 100%;
        font-size: 14px;
        font-family: monospace;
    }

    `;

    // Add the above styles, and any custom the user may have added!
    Nutshell.addStyles = ()=>{
        let styleEl = document.createElement("style");
        styleEl.innerHTML = Nutshell.defaultStyle + Nutshell.options.customCSS;
        document.head.appendChild(styleEl);
    };

}

/*************************************************************************

OPEN SOURCE LIBRARIES I'M PUTTING DIRECTLY INTO THIS JAVASCRIPT FILE
COZ AIN'T NOBODY WANT A REPEAT OF THE LEFT-PAD FIASCO

*************************************************************************/

/*! @license DOMPurify 2.3.6 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/2.3.6/LICENSE */
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).DOMPurify=t()}(this,(function(){"use strict";function e(t){return(e="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(t)}function t(e,n){return(t=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,n)}function n(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}function r(e,o,a){return(r=n()?Reflect.construct:function(e,n,r){var o=[null];o.push.apply(o,n);var a=new(Function.bind.apply(e,o));return r&&t(a,r.prototype),a}).apply(null,arguments)}function o(e){return function(e){if(Array.isArray(e))return a(e)}(e)||function(e){if("undefined"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e["@@iterator"])return Array.from(e)}(e)||function(e,t){if(!e)return;if("string"==typeof e)return a(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);"Object"===n&&e.constructor&&(n=e.constructor.name);if("Map"===n||"Set"===n)return Array.from(e);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return a(e,t)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function a(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var i=Object.hasOwnProperty,l=Object.setPrototypeOf,c=Object.isFrozen,u=Object.getPrototypeOf,s=Object.getOwnPropertyDescriptor,m=Object.freeze,f=Object.seal,p=Object.create,d="undefined"!=typeof Reflect&&Reflect,h=d.apply,g=d.construct;h||(h=function(e,t,n){return e.apply(t,n)}),m||(m=function(e){return e}),f||(f=function(e){return e}),g||(g=function(e,t){return r(e,o(t))});var y,b=_(Array.prototype.forEach),v=_(Array.prototype.pop),T=_(Array.prototype.push),N=_(String.prototype.toLowerCase),E=_(String.prototype.match),A=_(String.prototype.replace),w=_(String.prototype.indexOf),x=_(String.prototype.trim),S=_(RegExp.prototype.test),k=(y=TypeError,function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return g(y,t)});function _(e){return function(t){for(var n=arguments.length,r=new Array(n>1?n-1:0),o=1;o<n;o++)r[o-1]=arguments[o];return h(e,t,r)}}function O(e,t){l&&l(e,null);for(var n=t.length;n--;){var r=t[n];if("string"==typeof r){var o=N(r);o!==r&&(c(t)||(t[n]=o),r=o)}e[r]=!0}return e}function D(e){var t,n=p(null);for(t in e)h(i,e,[t])&&(n[t]=e[t]);return n}function C(e,t){for(;null!==e;){var n=s(e,t);if(n){if(n.get)return _(n.get);if("function"==typeof n.value)return _(n.value)}e=u(e)}return function(e){return console.warn("fallback value for",e),null}}var M=m(["a","abbr","acronym","address","area","article","aside","audio","b","bdi","bdo","big","blink","blockquote","body","br","button","canvas","caption","center","cite","code","col","colgroup","content","data","datalist","dd","decorator","del","details","dfn","dialog","dir","div","dl","dt","element","em","fieldset","figcaption","figure","font","footer","form","h1","h2","h3","h4","h5","h6","head","header","hgroup","hr","html","i","img","input","ins","kbd","label","legend","li","main","map","mark","marquee","menu","menuitem","meter","nav","nobr","ol","optgroup","option","output","p","picture","pre","progress","q","rp","rt","ruby","s","samp","section","select","shadow","small","source","spacer","span","strike","strong","style","sub","summary","sup","table","tbody","td","template","textarea","tfoot","th","thead","time","tr","track","tt","u","ul","var","video","wbr"]),R=m(["svg","a","altglyph","altglyphdef","altglyphitem","animatecolor","animatemotion","animatetransform","circle","clippath","defs","desc","ellipse","filter","font","g","glyph","glyphref","hkern","image","line","lineargradient","marker","mask","metadata","mpath","path","pattern","polygon","polyline","radialgradient","rect","stop","style","switch","symbol","text","textpath","title","tref","tspan","view","vkern"]),L=m(["feBlend","feColorMatrix","feComponentTransfer","feComposite","feConvolveMatrix","feDiffuseLighting","feDisplacementMap","feDistantLight","feFlood","feFuncA","feFuncB","feFuncG","feFuncR","feGaussianBlur","feImage","feMerge","feMergeNode","feMorphology","feOffset","fePointLight","feSpecularLighting","feSpotLight","feTile","feTurbulence"]),I=m(["animate","color-profile","cursor","discard","fedropshadow","font-face","font-face-format","font-face-name","font-face-src","font-face-uri","foreignobject","hatch","hatchpath","mesh","meshgradient","meshpatch","meshrow","missing-glyph","script","set","solidcolor","unknown","use"]),F=m(["math","menclose","merror","mfenced","mfrac","mglyph","mi","mlabeledtr","mmultiscripts","mn","mo","mover","mpadded","mphantom","mroot","mrow","ms","mspace","msqrt","mstyle","msub","msup","msubsup","mtable","mtd","mtext","mtr","munder","munderover"]),H=m(["maction","maligngroup","malignmark","mlongdiv","mscarries","mscarry","msgroup","mstack","msline","msrow","semantics","annotation","annotation-xml","mprescripts","none"]),U=m(["#text"]),z=m(["accept","action","align","alt","autocapitalize","autocomplete","autopictureinpicture","autoplay","background","bgcolor","border","capture","cellpadding","cellspacing","checked","cite","class","clear","color","cols","colspan","controls","controlslist","coords","crossorigin","datetime","decoding","default","dir","disabled","disablepictureinpicture","disableremoteplayback","download","draggable","enctype","enterkeyhint","face","for","headers","height","hidden","high","href","hreflang","id","inputmode","integrity","ismap","kind","label","lang","list","loading","loop","low","max","maxlength","media","method","min","minlength","multiple","muted","name","nonce","noshade","novalidate","nowrap","open","optimum","pattern","placeholder","playsinline","poster","preload","pubdate","radiogroup","readonly","rel","required","rev","reversed","role","rows","rowspan","spellcheck","scope","selected","shape","size","sizes","span","srclang","start","src","srcset","step","style","summary","tabindex","title","translate","type","usemap","valign","value","width","xmlns","slot"]),B=m(["accent-height","accumulate","additive","alignment-baseline","ascent","attributename","attributetype","azimuth","basefrequency","baseline-shift","begin","bias","by","class","clip","clippathunits","clip-path","clip-rule","color","color-interpolation","color-interpolation-filters","color-profile","color-rendering","cx","cy","d","dx","dy","diffuseconstant","direction","display","divisor","dur","edgemode","elevation","end","fill","fill-opacity","fill-rule","filter","filterunits","flood-color","flood-opacity","font-family","font-size","font-size-adjust","font-stretch","font-style","font-variant","font-weight","fx","fy","g1","g2","glyph-name","glyphref","gradientunits","gradienttransform","height","href","id","image-rendering","in","in2","k","k1","k2","k3","k4","kerning","keypoints","keysplines","keytimes","lang","lengthadjust","letter-spacing","kernelmatrix","kernelunitlength","lighting-color","local","marker-end","marker-mid","marker-start","markerheight","markerunits","markerwidth","maskcontentunits","maskunits","max","mask","media","method","mode","min","name","numoctaves","offset","operator","opacity","order","orient","orientation","origin","overflow","paint-order","path","pathlength","patterncontentunits","patterntransform","patternunits","points","preservealpha","preserveaspectratio","primitiveunits","r","rx","ry","radius","refx","refy","repeatcount","repeatdur","restart","result","rotate","scale","seed","shape-rendering","specularconstant","specularexponent","spreadmethod","startoffset","stddeviation","stitchtiles","stop-color","stop-opacity","stroke-dasharray","stroke-dashoffset","stroke-linecap","stroke-linejoin","stroke-miterlimit","stroke-opacity","stroke","stroke-width","style","surfacescale","systemlanguage","tabindex","targetx","targety","transform","transform-origin","text-anchor","text-decoration","text-rendering","textlength","type","u1","u2","unicode","values","viewbox","visibility","version","vert-adv-y","vert-origin-x","vert-origin-y","width","word-spacing","wrap","writing-mode","xchannelselector","ychannelselector","x","x1","x2","xmlns","y","y1","y2","z","zoomandpan"]),j=m(["accent","accentunder","align","bevelled","close","columnsalign","columnlines","columnspan","denomalign","depth","dir","display","displaystyle","encoding","fence","frame","height","href","id","largeop","length","linethickness","lspace","lquote","mathbackground","mathcolor","mathsize","mathvariant","maxsize","minsize","movablelimits","notation","numalign","open","rowalign","rowlines","rowspacing","rowspan","rspace","rquote","scriptlevel","scriptminsize","scriptsizemultiplier","selection","separator","separators","stretchy","subscriptshift","supscriptshift","symmetric","voffset","width","xmlns"]),P=m(["xlink:href","xml:id","xlink:title","xml:space","xmlns:xlink"]),G=f(/\{\{[\s\S]*|[\s\S]*\}\}/gm),W=f(/<%[\s\S]*|[\s\S]*%>/gm),q=f(/^data-[\-\w.\u00B7-\uFFFF]/),Y=f(/^aria-[\-\w]+$/),K=f(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),V=f(/^(?:\w+script|data):/i),$=f(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),X=f(/^html$/i),Z=function(){return"undefined"==typeof window?null:window},J=function(t,n){if("object"!==e(t)||"function"!=typeof t.createPolicy)return null;var r=null,o="data-tt-policy-suffix";n.currentScript&&n.currentScript.hasAttribute(o)&&(r=n.currentScript.getAttribute(o));var a="dompurify"+(r?"#"+r:"");try{return t.createPolicy(a,{createHTML:function(e){return e}})}catch(e){return console.warn("TrustedTypes policy "+a+" could not be created."),null}};return function t(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:Z(),r=function(e){return t(e)};if(r.version="2.3.6",r.removed=[],!n||!n.document||9!==n.document.nodeType)return r.isSupported=!1,r;var a=n.document,i=n.document,l=n.DocumentFragment,c=n.HTMLTemplateElement,u=n.Node,s=n.Element,f=n.NodeFilter,p=n.NamedNodeMap,d=void 0===p?n.NamedNodeMap||n.MozNamedAttrMap:p,h=n.HTMLFormElement,g=n.DOMParser,y=n.trustedTypes,_=s.prototype,Q=C(_,"cloneNode"),ee=C(_,"nextSibling"),te=C(_,"childNodes"),ne=C(_,"parentNode");if("function"==typeof c){var re=i.createElement("template");re.content&&re.content.ownerDocument&&(i=re.content.ownerDocument)}var oe=J(y,a),ae=oe?oe.createHTML(""):"",ie=i,le=ie.implementation,ce=ie.createNodeIterator,ue=ie.createDocumentFragment,se=ie.getElementsByTagName,me=a.importNode,fe={};try{fe=D(i).documentMode?i.documentMode:{}}catch(e){}var pe={};r.isSupported="function"==typeof ne&&le&&void 0!==le.createHTMLDocument&&9!==fe;var de,he,ge=G,ye=W,be=q,ve=Y,Te=V,Ne=$,Ee=K,Ae=null,we=O({},[].concat(o(M),o(R),o(L),o(F),o(U))),xe=null,Se=O({},[].concat(o(z),o(B),o(j),o(P))),ke=Object.seal(Object.create(null,{tagNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},attributeNameCheck:{writable:!0,configurable:!1,enumerable:!0,value:null},allowCustomizedBuiltInElements:{writable:!0,configurable:!1,enumerable:!0,value:!1}})),_e=null,Oe=null,De=!0,Ce=!0,Me=!1,Re=!1,Le=!1,Ie=!1,Fe=!1,He=!1,Ue=!1,ze=!1,Be=!0,je=!0,Pe=!1,Ge={},We=null,qe=O({},["annotation-xml","audio","colgroup","desc","foreignobject","head","iframe","math","mi","mn","mo","ms","mtext","noembed","noframes","noscript","plaintext","script","style","svg","template","thead","title","video","xmp"]),Ye=null,Ke=O({},["audio","video","img","source","image","track"]),Ve=null,$e=O({},["alt","class","for","id","label","name","pattern","placeholder","role","summary","title","value","style","xmlns"]),Xe="http://www.w3.org/1998/Math/MathML",Ze="http://www.w3.org/2000/svg",Je="http://www.w3.org/1999/xhtml",Qe=Je,et=!1,tt=["application/xhtml+xml","text/html"],nt="text/html",rt=null,ot=i.createElement("form"),at=function(e){return e instanceof RegExp||e instanceof Function},it=function(t){rt&&rt===t||(t&&"object"===e(t)||(t={}),t=D(t),Ae="ALLOWED_TAGS"in t?O({},t.ALLOWED_TAGS):we,xe="ALLOWED_ATTR"in t?O({},t.ALLOWED_ATTR):Se,Ve="ADD_URI_SAFE_ATTR"in t?O(D($e),t.ADD_URI_SAFE_ATTR):$e,Ye="ADD_DATA_URI_TAGS"in t?O(D(Ke),t.ADD_DATA_URI_TAGS):Ke,We="FORBID_CONTENTS"in t?O({},t.FORBID_CONTENTS):qe,_e="FORBID_TAGS"in t?O({},t.FORBID_TAGS):{},Oe="FORBID_ATTR"in t?O({},t.FORBID_ATTR):{},Ge="USE_PROFILES"in t&&t.USE_PROFILES,De=!1!==t.ALLOW_ARIA_ATTR,Ce=!1!==t.ALLOW_DATA_ATTR,Me=t.ALLOW_UNKNOWN_PROTOCOLS||!1,Re=t.SAFE_FOR_TEMPLATES||!1,Le=t.WHOLE_DOCUMENT||!1,He=t.RETURN_DOM||!1,Ue=t.RETURN_DOM_FRAGMENT||!1,ze=t.RETURN_TRUSTED_TYPE||!1,Fe=t.FORCE_BODY||!1,Be=!1!==t.SANITIZE_DOM,je=!1!==t.KEEP_CONTENT,Pe=t.IN_PLACE||!1,Ee=t.ALLOWED_URI_REGEXP||Ee,Qe=t.NAMESPACE||Je,t.CUSTOM_ELEMENT_HANDLING&&at(t.CUSTOM_ELEMENT_HANDLING.tagNameCheck)&&(ke.tagNameCheck=t.CUSTOM_ELEMENT_HANDLING.tagNameCheck),t.CUSTOM_ELEMENT_HANDLING&&at(t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck)&&(ke.attributeNameCheck=t.CUSTOM_ELEMENT_HANDLING.attributeNameCheck),t.CUSTOM_ELEMENT_HANDLING&&"boolean"==typeof t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements&&(ke.allowCustomizedBuiltInElements=t.CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements),de=de=-1===tt.indexOf(t.PARSER_MEDIA_TYPE)?nt:t.PARSER_MEDIA_TYPE,he="application/xhtml+xml"===de?function(e){return e}:N,Re&&(Ce=!1),Ue&&(He=!0),Ge&&(Ae=O({},o(U)),xe=[],!0===Ge.html&&(O(Ae,M),O(xe,z)),!0===Ge.svg&&(O(Ae,R),O(xe,B),O(xe,P)),!0===Ge.svgFilters&&(O(Ae,L),O(xe,B),O(xe,P)),!0===Ge.mathMl&&(O(Ae,F),O(xe,j),O(xe,P))),t.ADD_TAGS&&(Ae===we&&(Ae=D(Ae)),O(Ae,t.ADD_TAGS)),t.ADD_ATTR&&(xe===Se&&(xe=D(xe)),O(xe,t.ADD_ATTR)),t.ADD_URI_SAFE_ATTR&&O(Ve,t.ADD_URI_SAFE_ATTR),t.FORBID_CONTENTS&&(We===qe&&(We=D(We)),O(We,t.FORBID_CONTENTS)),je&&(Ae["#text"]=!0),Le&&O(Ae,["html","head","body"]),Ae.table&&(O(Ae,["tbody"]),delete _e.tbody),m&&m(t),rt=t)},lt=O({},["mi","mo","mn","ms","mtext"]),ct=O({},["foreignobject","desc","title","annotation-xml"]),ut=O({},R);O(ut,L),O(ut,I);var st=O({},F);O(st,H);var mt=function(e){var t=ne(e);t&&t.tagName||(t={namespaceURI:Je,tagName:"template"});var n=N(e.tagName),r=N(t.tagName);if(e.namespaceURI===Ze)return t.namespaceURI===Je?"svg"===n:t.namespaceURI===Xe?"svg"===n&&("annotation-xml"===r||lt[r]):Boolean(ut[n]);if(e.namespaceURI===Xe)return t.namespaceURI===Je?"math"===n:t.namespaceURI===Ze?"math"===n&&ct[r]:Boolean(st[n]);if(e.namespaceURI===Je){if(t.namespaceURI===Ze&&!ct[r])return!1;if(t.namespaceURI===Xe&&!lt[r])return!1;var o=O({},["title","style","font","a","script"]);return!st[n]&&(o[n]||!ut[n])}return!1},ft=function(e){T(r.removed,{element:e});try{e.parentNode.removeChild(e)}catch(t){try{e.outerHTML=ae}catch(t){e.remove()}}},pt=function(e,t){try{T(r.removed,{attribute:t.getAttributeNode(e),from:t})}catch(e){T(r.removed,{attribute:null,from:t})}if(t.removeAttribute(e),"is"===e&&!xe[e])if(He||Ue)try{ft(t)}catch(e){}else try{t.setAttribute(e,"")}catch(e){}},dt=function(e){var t,n;if(Fe)e="<remove></remove>"+e;else{var r=E(e,/^[\r\n\t ]+/);n=r&&r[0]}"application/xhtml+xml"===de&&(e='<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>'+e+"</body></html>");var o=oe?oe.createHTML(e):e;if(Qe===Je)try{t=(new g).parseFromString(o,de)}catch(e){}if(!t||!t.documentElement){t=le.createDocument(Qe,"template",null);try{t.documentElement.innerHTML=et?"":o}catch(e){}}var a=t.body||t.documentElement;return e&&n&&a.insertBefore(i.createTextNode(n),a.childNodes[0]||null),Qe===Je?se.call(t,Le?"html":"body")[0]:Le?t.documentElement:a},ht=function(e){return ce.call(e.ownerDocument||e,e,f.SHOW_ELEMENT|f.SHOW_COMMENT|f.SHOW_TEXT,null,!1)},gt=function(e){return e instanceof h&&("string"!=typeof e.nodeName||"string"!=typeof e.textContent||"function"!=typeof e.removeChild||!(e.attributes instanceof d)||"function"!=typeof e.removeAttribute||"function"!=typeof e.setAttribute||"string"!=typeof e.namespaceURI||"function"!=typeof e.insertBefore)},yt=function(t){return"object"===e(u)?t instanceof u:t&&"object"===e(t)&&"number"==typeof t.nodeType&&"string"==typeof t.nodeName},bt=function(e,t,n){pe[e]&&b(pe[e],(function(e){e.call(r,t,n,rt)}))},vt=function(e){var t;if(bt("beforeSanitizeElements",e,null),gt(e))return ft(e),!0;if(E(e.nodeName,/[\u0080-\uFFFF]/))return ft(e),!0;var n=he(e.nodeName);if(bt("uponSanitizeElement",e,{tagName:n,allowedTags:Ae}),!yt(e.firstElementChild)&&(!yt(e.content)||!yt(e.content.firstElementChild))&&S(/<[/\w]/g,e.innerHTML)&&S(/<[/\w]/g,e.textContent))return ft(e),!0;if("select"===n&&S(/<template/i,e.innerHTML))return ft(e),!0;if(!Ae[n]||_e[n]){if(!_e[n]&&Nt(n)){if(ke.tagNameCheck instanceof RegExp&&S(ke.tagNameCheck,n))return!1;if(ke.tagNameCheck instanceof Function&&ke.tagNameCheck(n))return!1}if(je&&!We[n]){var o=ne(e)||e.parentNode,a=te(e)||e.childNodes;if(a&&o)for(var i=a.length-1;i>=0;--i)o.insertBefore(Q(a[i],!0),ee(e))}return ft(e),!0}return e instanceof s&&!mt(e)?(ft(e),!0):"noscript"!==n&&"noembed"!==n||!S(/<\/no(script|embed)/i,e.innerHTML)?(Re&&3===e.nodeType&&(t=e.textContent,t=A(t,ge," "),t=A(t,ye," "),e.textContent!==t&&(T(r.removed,{element:e.cloneNode()}),e.textContent=t)),bt("afterSanitizeElements",e,null),!1):(ft(e),!0)},Tt=function(e,t,n){if(Be&&("id"===t||"name"===t)&&(n in i||n in ot))return!1;if(Ce&&!Oe[t]&&S(be,t));else if(De&&S(ve,t));else if(!xe[t]||Oe[t]){if(!(Nt(e)&&(ke.tagNameCheck instanceof RegExp&&S(ke.tagNameCheck,e)||ke.tagNameCheck instanceof Function&&ke.tagNameCheck(e))&&(ke.attributeNameCheck instanceof RegExp&&S(ke.attributeNameCheck,t)||ke.attributeNameCheck instanceof Function&&ke.attributeNameCheck(t))||"is"===t&&ke.allowCustomizedBuiltInElements&&(ke.tagNameCheck instanceof RegExp&&S(ke.tagNameCheck,n)||ke.tagNameCheck instanceof Function&&ke.tagNameCheck(n))))return!1}else if(Ve[t]);else if(S(Ee,A(n,Ne,"")));else if("src"!==t&&"xlink:href"!==t&&"href"!==t||"script"===e||0!==w(n,"data:")||!Ye[e]){if(Me&&!S(Te,A(n,Ne,"")));else if(n)return!1}else;return!0},Nt=function(e){return e.indexOf("-")>0},Et=function(e){var t,n,o,a;bt("beforeSanitizeAttributes",e,null);var i=e.attributes;if(i){var l={attrName:"",attrValue:"",keepAttr:!0,allowedAttributes:xe};for(a=i.length;a--;){var c=t=i[a],u=c.name,s=c.namespaceURI;if(n="value"===u?t.value:x(t.value),o=he(u),l.attrName=o,l.attrValue=n,l.keepAttr=!0,l.forceKeepAttr=void 0,bt("uponSanitizeAttribute",e,l),n=l.attrValue,!l.forceKeepAttr&&(pt(u,e),l.keepAttr))if(S(/\/>/i,n))pt(u,e);else{Re&&(n=A(n,ge," "),n=A(n,ye," "));var m=he(e.nodeName);if(Tt(m,o,n))try{s?e.setAttributeNS(s,u,n):e.setAttribute(u,n),v(r.removed)}catch(e){}}}bt("afterSanitizeAttributes",e,null)}},At=function e(t){var n,r=ht(t);for(bt("beforeSanitizeShadowDOM",t,null);n=r.nextNode();)bt("uponSanitizeShadowNode",n,null),vt(n)||(n.content instanceof l&&e(n.content),Et(n));bt("afterSanitizeShadowDOM",t,null)};return r.sanitize=function(t,o){var i,c,s,m,f;if((et=!t)&&(t="\x3c!--\x3e"),"string"!=typeof t&&!yt(t)){if("function"!=typeof t.toString)throw k("toString is not a function");if("string"!=typeof(t=t.toString()))throw k("dirty is not a string, aborting")}if(!r.isSupported){if("object"===e(n.toStaticHTML)||"function"==typeof n.toStaticHTML){if("string"==typeof t)return n.toStaticHTML(t);if(yt(t))return n.toStaticHTML(t.outerHTML)}return t}if(Ie||it(o),r.removed=[],"string"==typeof t&&(Pe=!1),Pe){if(t.nodeName){var p=he(t.nodeName);if(!Ae[p]||_e[p])throw k("root node is forbidden and cannot be sanitized in-place")}}else if(t instanceof u)1===(c=(i=dt("\x3c!----\x3e")).ownerDocument.importNode(t,!0)).nodeType&&"BODY"===c.nodeName||"HTML"===c.nodeName?i=c:i.appendChild(c);else{if(!He&&!Re&&!Le&&-1===t.indexOf("<"))return oe&&ze?oe.createHTML(t):t;if(!(i=dt(t)))return He?null:ze?ae:""}i&&Fe&&ft(i.firstChild);for(var d=ht(Pe?t:i);s=d.nextNode();)3===s.nodeType&&s===m||vt(s)||(s.content instanceof l&&At(s.content),Et(s),m=s);if(m=null,Pe)return t;if(He){if(Ue)for(f=ue.call(i.ownerDocument);i.firstChild;)f.appendChild(i.firstChild);else f=i;return xe.shadowroot&&(f=me.call(a,f,!0)),f}var h=Le?i.outerHTML:i.innerHTML;return Le&&Ae["!doctype"]&&i.ownerDocument&&i.ownerDocument.doctype&&i.ownerDocument.doctype.name&&S(X,i.ownerDocument.doctype.name)&&(h="<!DOCTYPE "+i.ownerDocument.doctype.name+">\n"+h),Re&&(h=A(h,ge," "),h=A(h,ye," ")),oe&&ze?oe.createHTML(h):h},r.setConfig=function(e){it(e),Ie=!0},r.clearConfig=function(){rt=null,Ie=!1},r.isValidAttribute=function(e,t,n){rt||it({});var r=he(e),o=he(t);return Tt(r,o,n)},r.addHook=function(e,t){"function"==typeof t&&(pe[e]=pe[e]||[],T(pe[e],t))},r.removeHook=function(e){if(pe[e])return v(pe[e])},r.removeHooks=function(e){pe[e]&&(pe[e]=[])},r.removeAllHooks=function(){pe={}},r}()}));
//# sourceMappingURL=purify.min.js.map
