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
* Wall of Thanks scrolling bug (just re-calculate every few frames, w/e...)
https://github.com/ncase/nutshell/issues/13
* YT links fail coz &t vs ?t
* Wiki links fail due to weird-ass characters. Not HTML-decoding correctly?

OTHER NUTSHELL WHATEVERS
* double check words.md -> words.html -> index.html still works. (AND REMOVE 1.0.2)
* no nut on blog headings in ncase, what's the deal?
* confirm... NEW url for ?=
* Remove Medium/Substack snark
---
* COPY: Promo/copy more highlight "EMBEDDABLE", too... and highlight some extra features?

------------------------

AFTERWARDS
* FEATURE: Hidden messages for lack of JS (RSS, Pocket) etc fallback
* FEATURE: Allow "before" and "after" texts for Wiki/YouTube
* FEATURE: Can write full content of a very short Nutshell right in the link. (good for "hint systems")

AFTERWARDS
* ask all of them for confirmation on "Learn More"
* Tell off that one jerk
