# Nutshell: make expandable explanations

![](pics/thumbnail.png)

**[Check out the demo here!](https://ncase.me/nutshell)**

**Readme's Table of Contents:**

* There will be no version 2.0.0 (Why Nutshell is minimalist, contributions I'm accepting, _possible_ future very-minor features)
* Advanced features & options (Documentation)

## There will be no Version 2.0.0

> “Running a successful open source project is just Good Will Hunting in reverse, where you start out as a respected genius and end up being a janitor who gets into fights.”
>
> ~ [Byrne Hobart](https://www.thediff.co/p/working-in-public-and-the-economics)

*Nutshell* is open-source (Creative Commons Zero), but this is *not* a "I am going to take requests & maintain this for the rest of my pathetic Sisyphean life" kind of project. I am pre-committing, right here, to keeping Nutshell minimalist, and only publishing minor tweaks & fixes. There will be no Version 2.0.0 of Nutshell.

That said, I'm accepting two kinds of Pull Requests to this repo! **1) Bug fixes, 2) Translations**.

Bug fixes are pretty self-explanatory. Translations are a bit harder. In the `nutshell.js` file, there's a JSON object containing all of Nutshell's English text:

```
Nutshell.language = {
        en: {

            // Button text
            closeAllNutshells: `close all nutshells`,

            // Nutshell errors...
            notFoundError: `Uh oh, the page was not found! Double check the link:`,
            wikiError: `Uh oh, Wikipedia's not loading, or the link is broken. Please double check:`,

[and so on...]

```

To help translate Nutshell, copy the "en" object, add a new object to `Nutshell.language` with [the 2-letter code for your target language](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes), translate everything in backtick-quotes (but leave alone the stuff inside `[square brackets]` or `<angular brackets>`!!!), then send a Pull Request! 🎉 Then give me a week or two to slog through my Kafkaesque inbox & finally get around to merging it.

Note: I'm only accepting translations for the Nutshell *library*, not the demo website.

I'm *not* accepting Pull Requests for new features, but feel free to suggest whatever you'd like in the Issues tab! And if someone already suggested your feature, emoji-upvote them with a 👍 so I know there's demand for it! *This does not guarantee I will make the feature,* I'm just curious what people want. I am pre-committing right here: _I will only implement extra features that \*I\* personally want_. (If there's a feature you need but I don't, make a fork! And then post a link to your fork in the corresponding issue, so everyone who also wanted that feature can use it.)

That said, if you're really curious, here's some minor features I *maybe maybe MAYBE* will add one day:

* In-built support for:
	* LaTeX
	* Wiktionary
	* Vimeo
	* Direct image links (if URL ends in .png, .jpeg, etc, embed that image)
	* Embedding specific Wikipedia sections, not just the intro paragraph
	* Allowing "before" and "after" texts for Wiki/YouTube
	* Can write the full text content of a very short Nutshell right in the link. (good for "hint systems")
	* A general "plug-in" system so that 1) I don't have a giant if-else-if-else-if statement for handling Wikipedia/YouTube/Vimeo/Wiktionary/Images/etc, and 2) Other people can write their own plug-ins if they want
* Allowing _very limited_ styling of text & images in Nutshells. (the problem is to avoid cross-site vandalism that spills _outside_ of the bubble. So, maybe only `background`, `color`, `font-size`, and `float`?)
* `:o` to have an expandable link/heading expanded by default
* `:x` to have an expandable link/heading totally hidden
* An easy tool for making Nutshell links with *all* the advanced features, rather than making you go through this documentation & testing it out in the Try Nutshell demo
* [I DO NOT LIKE THIS FEATURE, BUT AM LISTING IT COZ I KNOW IT'LL BE REQUESTED A LOT] Option to show bubble-previews on hover, and hide out mouse-out? (This may suck for long, recursive nutshells. And mouse-out would be a very fragile interface.)
* Maybe putting this on npm or something, I dunno. Nutshell's dependencies are straight-up copy-pasted into the `nutshell.js` file directly.

And now, a list of all the non-core extra features that *do* exist right now:

## Advanced features & options

### Configuring Nutshell

After including Nutshell (e.g. where you put `<script src="nutshell.js"><script>`), you can configure Nutshell by then *immediately* calling `Nutshell.setOptions` afterwards, like so:

```
<script>
Nutshell.setOptions({
    startOnLoad: true, // Start Nutshell on load? (default: yes)
    customCSS: '', // Add your own style
    lang: 'en' // Language
});
</script>
```

There are currently only 3 options:

**startOnLoad (default: true).** Set this to `false` if you *don't* want Nutshell to immediately run on page load. (e.g. if your article content is asynchronously loaded). Later, to *actually* start Nutshell, call:

`Nutshell.start();`

By default, Nutshell tries to convert the whole page. To limit Nutshell to converting just a container/element, call:

`Nutshell.start(element);`

**customCSS.** Type the raw CSS you want to be included *after* Nutshell's default CSS. You can see Nutshell's default CSS in `nutshell.js`; search for `Nutshell.defaultStyle`.

**lang (default: 'en').** If Nutshell supports your language, you can make Nutshell use that language by setting `lang` to your language's [two-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes). (Currently, Nutshell only supports English, but there'll be more fan-translations soon! If you're comfortable with programming/Github, see how you can help with language support [here](todo))

### Stuff you can put in embedded sections

For security reasons, Nutshell can't allow things to be embedded willy-nilly. But Nutshell *does* allow: `iframes` (for interactive content and other fun stuff), `img`, `audio`, and `video`.

**img**: Images! The one big thing to mention here is I have a hack for allowing images to float left or right (like in Wiki articles): add the attributes `data-float="left"` or `data-float="right"` to the `<img/>`. (Direct inline styling is not currently allowed, for security/vandalism reasons. Don't want someone adding `position:fixed; z-index:9999; background:url(goatse.png);`...)

**iframe**: Scripts will be allowed, but it cannot access the top page (duh) or call `alert()` or stuff.

**audio** and **video**: just use as per normal.

### Hiding Headings

What if you want write a section for a Nutshell bubble, but *don't* want the section to appear without being manually clicked & expanded? (e.g. for hint systems)

If you put a `:` *at the start of* a heading, that entire section will be collapsed into an expandable link when Nutshell starts:

// pic

If you put `:x` at the start of a heading, that entire section will be *invisible*. (But you can still include it elsewhere!)

// pic

### Other ways to set embedded-expanded content

Remember, you can test all of these in the [Try Nutshell](https://ncase.me/nutshell/try) demo! The below examples are written in Markdown for convenience, but will work with rich text or raw HTML too.

**Section from the same page**: # followed by the text of the section's heading – capitalization, spaces, and punctuation don't matter.

`[:dont forget the colon](#SectionHeading)`

**Section from different page:** URL, followed by # and section heading:

`[:unsolicited advice](https://ncase.me/faq/#GoodMentalHealth)`

**Entire article from a page:** URL, *without* # and section heading.

`[:a whole story](https://blog.ncase.me/parable-of-the-hill-climber/)`

**Drop the last X paragraphs from a Section:** For example, if the original article has a few paragraphs segueing to the next section (which you're not including), you can drop them by adding `&cut=[integer]` to the end of the link, and it'll drop `[integer]` number of paragraphs from the end.

`[:drop the 2-paragraph segue](url#SectionHeading&cut=2)`

**Add content before/after an embedded Section:** For example, if you want to give context to a section. And yes, you can put more recursive nutshells in there! For example, put some "prerequisite knowledge Nutshells" before the snippet, and some commentary tying it to your main article after the snippet.

To do this, use `&before=[content]` and/or `&after=[content]` to the end of your link. (ANNOYING NOTE: You'll have to run `encodeURIComponent` on your content before putting it in the link – e.g. `[:nutshell](#Nutshell)` has to become `%5B%3Anutshell%5D(%23Nutshell)`. Use [this tool](https://www.onlinewebtoolkit.com/url-encode-decode).)

Example:

`[:something controversial](url#Heading&before=RETWEETS ARE NOT ENDORSEMENTS&after=AGAIN, I DO NOT NECESSARILY ENDORSE THIS)`

Example with another recursive nutshell in the 'before' content: (note that it's gone through encodeURIComponent)

`[:quantum computing](url#Section&before=First%20you%20need%20to%20know%20about%20%5B%3Aquantum%20mechanics%5D(%23qm))`

... I oughta make an easier tool for this, huh.

**Section using text-search, not heading:** The snippet you want isn't under a convenient heading? You can also get snippets by text-search!

`#start=[text]` – Gets FIRST paragraph containing that text (ignoring capitalization/spaces/punctuation)

`#start=[text]&length=[integer]` – Same, but also gets the specified number of paragraphs afterwards (including the first paragraph).

`#start=[start-text]&end=[end-text]` – Same, but also gets all paragraphs up until the first paragraph containing [end-text]. (again, ignoring capitalization/spaces/punctuation)

---

k that's all the features I have for now, thx, bye.

[Nicky's Website](https://ncase.me) · [Nicky's Patreon](https://patreon.com/ncase)

![](pics/the_end.png)
