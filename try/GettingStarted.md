# Getting Started

## To Install Nutshell

Just copy this code onto your site. This includes the Nutshell script, hosted somewhere else:

`<script src=""></script>`

Or, download the script here (TODO) & host it yourself!

(Note: most blogging platforms – Wordpress, Tumblr, Ghost, Github Pages, etc – let you add your own custom code. Sadly, some – like Medium – don't. Check your platform to see if you can add code!)

## To write a section

Just use headers & paragraphs! You can also embed images:

// TODO

(Bonus: when Nutshell "converts" a page – which you can see on the right-hand side of this demo – you can hover over headers, to see an "embed this section" button. Try it out!)


## To embed a section

Just use a link, with :colon at the front! (the :colon is so Nutshell "knows" to convert that link) [:Like this!](#ToWriteASection)

If the link is to a section on...

* the same page, link to `#SectionHeaderText`
* a different page on the same site, link to `/other-page/#SectionHeaderText`
* a different site, link to `https://other-site.com/other-page/#SectionHeaderText`

Note: for the section header text, capitalization/spaces/punctuation doesn't matter, and you don't even need the whole text. For example, if the header's text is "To Embed A Section", you can use `#ToEmbedASection`, `#tO-eMBeD_a-SECtioN`, or even just `#embed`.


## P.S: Two caveats on embedding from other pages

First, if you're embedding from another page, the page must either:

* also have Nutshell installed on *at least* that page,
* have [:CORS](../#cors) enabled // TODO

Not sure if a page has Nutshell/CORS? Try making a :link to it in this demo, to test it! Here's the fail-message you'll get if a page doesn't have Nutshell or CORS. :Fail Message // TODO

Second, like linking to or embedding from *any* external source, *make sure you trust that source.* The external source can change its content at any time, or go offline. You can mitigate these problems by mirroring the site's content.