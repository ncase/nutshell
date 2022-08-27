(this is for my own personal records, plz ignore)

----------------------

* a "unit test suite" page
* test on new page urls-with-?=...
* the "sentence follow-up" feature is a bit messed
	* no need for "..." after "recursive."
   * ":YouTube videos" should have pre-sentence

* In-built support for:
	* Wiktionary
	* Vimeo
	* Direct image links (if URL ends in .png, .jpeg, etc, embed that image)
	* Embed specific Wikipedia sections, not just the intro paragraph
	* Allow "before" and "after" texts for Wiki/YouTube
	* Can write full content of a very short Nutshell right in the link. (good for "hint systems")
	* A general "plug-in" system so that 1) I don't have a giant if-elseif-elseif statement for handling Wikipedia/YouTube/Vimeo/Wiktionary/Images/etc, and 2) other folks can write their own plug-ins.

* An "advanced features" demo page???

--------------------

PR
* wrong link https://github.com/ncase/nutshell/pull/16 @done
* Chinese: https://github.com/ncase/nutshell/pull/14 @done
* Spanish: https://github.com/ncase/nutshell/pull/15 @done
* TRY adding "learn more about Nutshell" for all of them @done
* "Learn More About" button @done

BUGS FOUND BY FOLX
* Nutshell text only displays as black, even on black background
https://github.com/ncase/nutshell/issues/17
(workaround for now: `css`) @done
* Wall of Thanks scrolling bug (just re-calculate every few frames, w/e...) @done
https://github.com/ncase/nutshell/issues/13
* YT links fail coz &t vs ?t @done
* Wiki links fail due to weird-ass characters. Not HTML-decoding correctly? @done

OTHER NUTSHELL WHATEVERS
* double check words.md -> words.html -> index.html still works. (AND REMOVE 1.0.2) @done
* Remove Medium/Substack snark @done
* include is versioned, words not. @done
* iframe the new credits, ?v whatever @done
* COPY: Promo/copy more highlight "EMBEDDABLE", too... and highlight some extra features?


RESPOND TO ALL OF EM
INCLUDING TELLING THAT ONE OFF.

Thank you so much ////, for making Nutshell available to more folks! I have merged your Pull Request.

xxxx, I *would* have merged yours too – my usual strategy when two people overlap on a translation is to just mix-and-match their lines – *until* the moment you decided to be rude to them. It wasn't even constructive feedback; you gave no examples of where their translation was wrong or seemed like "machine translation". I need to emphasize: *I was 100% planning to accept your contribution UNTIL you were rude.*

And *for what?* There's no money or career involved here. It's best you learn this now on a low-stakes thing, before you mess up your own future career: **you do NOT rise in life by pulling others down.** One doesn't get smarter by making others dumber; one doesn't get healthier by poisoning others. Especially not for something as collaborative as open-source.

(And no, the above is not me pulling *you* down – just this opposite, it's constructive criticism because I'm telling you exactly what you did wrong, and exactly what you need to do next time to be accepted in open-source communities, which is *just don't be rude*.)

(And yes, you were first, by one day. But faster isn't better, maybe the other person took more care. I can't evaluate the Chinese myself, but I can evaluate both of your English skills, and the only English I can see from you is one rude 4-word sentence with no punctuation or capitalization. So, not a good sign.)

Anyway //// congrats on your GitHub points! The points don't do anything, but you were helpful and not-rude, so you get the points instead.


------------------------

AFTERWARDS
* no nut on blog headings in ncase, what's the deal? // blog's own fault: max-width: none; it works perfectly!
* confirm... NEW url for ?=
* Documentation: embed hover headers
* FEATURE: Hidden messages for lack of JS (RSS, Pocket) etc fallback
* FEATURE: Allow "before" and "after" texts for Wiki/YouTube
* FEATURE: Can write full content of a very short Nutshell right in the link. (good for "hint systems")
* Shorter than: You can embed this as an "expandable explanation" in your own blog/site! Click to preview
* Use "v". whoops.

> It’s common practice to prefix your version names with the letter v. Some good tag names might be v1.0.0 or v2.3.4.
