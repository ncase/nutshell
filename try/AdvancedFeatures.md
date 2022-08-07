# Advanced Features

## Nutshell Installation Options

(Requires that you're comfortable with JavaScript)

After including Nutshell...

`<script src="nutshell.js"><script>`

You can configure it by *immediately* calling `Nutshell.setOptions` afterwards, like so:

```
<script>
Nutshell.setOptions({
    startOnLoad: true, // Start Nutshell on load? (default: yes)
    customCSS: '', // Add your own style
    lang: 'en' // Language
});
</script>
```

There are currently 3 options:

**startOnLoad (default: true).** Set this to `false` if you *don't* want Nutshell to immediately run on page load (for example, if your article content is asynchronously loaded). Then, to *actually* start Nutshell, call:

`Nutshell.start();`

By default, Nutshell tries to convert the whole page. To limit Nutshell to converting just a container/element, pass it in the call:

`Nutshell.start(element);`

**customCSS.** Type the raw CSS you want to be included *after* Nutshell's default CSS. You can see Nutshell's default CSS in `nutshell.js`; search for `Nutshell.defaultStyle`.

**lang (default: 'en').** If Nutshell supports a language, you can make Nutshell use that language, by setting this option to your language's [two-letter code](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes). (Currently, Nutshell only supports English, but there'll be more fan-translations soon! If you're comfortable with programming/Github, see how you can help with language support here: // TODO)

****

## Cool Stuff To Embed

### Wikipedia

To embed Wikipedia article intros – (currently, it can only do the intros, not specific sections) – just link to that Wikipedia article!

[:Pet door](https://en.wikipedia.org/wiki/Pet_door)

It works for other-language Wikipedias:

[:Baguette](https://fr.wikipedia.org/wiki/Baguette_(pain))

And even Simple Wikipedia!

[:Universe](https://simple.wikipedia.org/wiki/Universe)

### Iframe, Audio, Video

If you can edit the HTML of your blog post, then good news! Nutshell lets you embed `<iframe>` (for YouTube, SoundCloud, and other playable interactives), `<audio>`, and `<video>`.

:Example

## Possible Future Nutshell Features?

For possible stuff I may or may not add, check out the Github Repo! // TODO