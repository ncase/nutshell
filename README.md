# Nutshell: make expandable explanations

Demo & documentation is all here: [https://ncase.me/nutshell](https://ncase.me/nutshell)

> “Open source is like Good Will Hunting in reverse:
> you start off as an esteemed professor
> and end up as a janitor who gets into fights.”
> ~ /// TODO

*Nutshell* is open-source, but in a bare minimum way.
Here is all the code – Creative Commons Zero "public domain" waiver! –
and I've tried to comment & document it as carefully as possible,
but I will not be "taking requests" for features, nor Pull Requests
for anything beyond bugs & translations. I want to keep Main Nutshell as minimalist as possible. *There might be a v1.1 or v1.2, but there will be no v2.0.*

Also I'm too lazy to add this to npm. All code Nutshell uses has been copy-pasted directly into Nutshell's one javascript file.

## Translating Nutshell

That said, I *am* accepting PRs for localizing Nutshell's text!
(the library, not the project page)
To help with that:

1. Go to `src/nutshell.js`
2. Scroll to whatever line defines `Nutshell.language`
3. Copy the `en` object, and paste a new object below it with your language's two-letter code // TODO - LINK
4. Translate the text values! But leave stuff in `[SQUARE BRACKETS]` or `<angular brackets>` alone.
  Depending on the language, you may also need to alter the "punctuation marks".
  For example, the Chinese period is `。`
5. Send a Pull Request and wait for up to 2 weeks for me to finally get off my lazy butt and hit
  one button to confirm it. 🎉 Look, Inbox Zero is a Sisyphean nightmare, ok?

## Possible Future Nutshell v1.1 Features

(In rough descending order of how much I personally want this feature)

* A "close all nutshells" button
* In-built support for:
	* LaTeX
	* Wiktionary?
	* YouTube/Vimeo link -> Embed that video
    * Image link (ends in .png, .jpeg, etc) -> Embed that image
    * Embedding specific Wikipedia sections, not just the intro paragraph?
* Getting sections from a page:
	* can text-search *all* text to find a section, not just `<h*>`.
	* can specify how many paragraphs to include/exclude from a section. (in case the end of a section has some "segue" text to the next section)
	* if no #SectionID defined, scrape entire main article?
* Allowing _very limited_ styling of text & images in embedded sections. (the problem is to avoid cross-site vandalism that spills _outside_ of the bubble. So, maybe only `background`, `color`, `font-size`, and `float`?)
* `:o` to have an expandable link/header expanded by default
* `:x` to have an expandable link/header totally hidden
* Option to show bubbles on hover, and hide out mouse-out? // This may suck for long, recursive nutshells. And mouse-out would be a very fragile interface.
