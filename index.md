# Nutshell Copy

## What is Nutshell?

**Nutshell** is a tool that lets you put "expandable explanations" in your blog or site, like this! You can even make these [:recursive](#recursion).

If you explain something to me *in person*, I could say: "Wait, I don't know what that word means", "Could you give me more details?", "Ooh, let's go off on that tangent!" You can adjust your explanations according to my *confusion and curiosity.* As amazing as the written word is, you can't change *mass*-published writing in response to what *individual* readers don't know, or want to know more of.

Well... unless you use Nutshell!

Unlike links, Nutshell doesn't break your flow of reading, or make you lose context, lost amidst a jungle of browser tabs. Everything is kept in one page, in the flow, in context.

Unlike Wikipedia's [:hover-to-preview](#Wikipedia'sHover), Nutshell can work *across websites*. You can embed explanations from *other authors*, and others can embed & share your explanations in return. You can even embed stuff *written before Nutshell was made*, because Nutshell doesn't require a special format – just write with headers & paragraphs as you normally do! (Example from a 2014 blog post) This way, you don't have to write all your "expandable explanations" from scratch every time: you can re-use what you wrote before, or what *others* have written before. Standing on the shoulders of giants, y'know.

But wait, there's more! It's not just text & images you can embed. You can even embed playable interactives, audio, YouTube clips, and – sure, why not – the introduction sections from Wikipedia and Simple Wikipedia. (click those for examples)

Some people just want to watch the world learn. If you're one of those – a blogger, an educator, a journalist, an activist, a technical writer, a code documenter, a math/science communicator – I hope this tool helps you help your learners.

Bite-sized, yet nutritious. Let's get cracking with Nutshell!

## How do I use Nutshell?

// video

**1) Paste this one line of code into your blog / site:**

`code`

(or: [download code directly](TODO))

**2) Write headers & paragraphs as you normally would.**

**3) Write links as you normally would, but put a :colon in front**, so Nutshell knows to convert that into an "expandable" thing.

(note, [:two important caveats](#caveats))

If you'd like to try Nutshell online before going through all the hassle of pasting one line of code, here's the ✨ **[Try Nutshell online demo](TODO)**! ✨

For advanced features, check out [the documentation](TODO).

Nutshell is forever free & [:open-source](#OpenSource). You can download & remix my code [from Github](TODO).


## Tips for writing Nutshells

Repeat after me: “Nutshell Is Not Wikipedia”.

[ALL IN UNISON]: *Nutshell Is Not Wikipedia.*

Look, I love Wikipedia, it's a fantastic reference, I give Jimmy my monies each month. But Wikipedia is optimized for "get all the info you'd ever want about this topic", *not* "learn about this topic as a total beginner".

And that's fine; no website can be everything for everyone. But Nutshell is meant for "learning stuff as you go", so, again, *Nutshell Is Not Wikipedia*. That means:

1. **You can have an actual tone of voice!** No need for the dry, professional style of Wikipedia. Nutshell, like Wikipedia, will rely on community contributions, but unlike Wikipedia, you don't have to worry about overriding someone else's work. That's why Wikipedia enforces a unified tone, but it's not a problem with Nutshell – Nutshells from different authors *on the same topic* can live side-by-side.
2. **Use [:recursive](#recursion) Nutshells sparingly.** Wikipedia, being a reference site, needs to put links for every noun. For example, the first two links on the Wikipedia page for algebra are... "Arabic", and "bone-setting". The point of Nutshell is to make published writing more like a person-to-person conversation – so, before you write a Nutshell about X, and embed a Nutshell about Y, ask yourself: *if I were to explain X to someone in-person, is it likely they'd ask me a question about Y?* So, if I were explaining algebra, it's unlikely my listener would ask about bone-setting. But they *would* ask, "wait, what's a variable?", or, "when would I need this in real life?" – so *those* might be good candidates for recursive Nutshells.
3. **Explain the "theoretical minimum" needed for a reader to move on.** Wikipedia's goal is to be comprehensive. That is not your goal. Your Nutshell may be embedded in *someone else's* essay, so your responsibility to *their* reader is to get in and get out. Explain the beautiful core idea, maybe one or two recursive Nutshells for pre-requisite ideas & follow-up details, then *leave.* (Guideline: ideally 100 words or less, at *most* 500 words. *This* Nutshell is /// words, whoof.)

Finally, because Nutshell is new, and readers worry that clicking stuff will break their flow, you may want to introduce Nutshell to your readers. Just copy-paste the following:

> By the way, if you see something [:like this](TODO), you can click it to "expand" it into an explanation, without breaking your flow of reading. Try it out, click the above thing!

Other than that, all the usual explaining-advice applies: start with concrete examples, pictures, analogies, curious problems, and familiar words... then only *after* that, introduce the abstractions, formulas, and technical jargon. (External links: advice from [Better Explained](TODO) and [3Blue1Brown](TODO))

Then again, I'm not the leather-clad Swede you hired, I can't boss you around. Do whatever you want, write an experimental non-linear hyperlinked novella, surprise me!

But if that blank canvas scares you, then my guidance is: Nutshells should be bite-sized, yet nutritious...

...and *is not Wikipedia.*


## What inspired this?

*Time for a history lesson, kiddos.*

Once upon a time, in the 1960's, when the World Wide Web didn't exist yet, and folks *actually believed* that connecting the world's people would burst forth a new wellspring of democracy, empathy, and enlightenment (ha ha ha *ha hA HA*)...

...in that era, Ted Nelson, inventor of hypertext, had a bunch of ideas, one of which was named **StretchText**. The idea was this: you write an article at a high-level narrative, and if your reader wants more detail on a particular sentence, they can "zoom in", and *stretch* that sentence into more detailed paragraphs. Then, if they still want more detail, they can stretch it *again*, for however many layers you wrote in. But *crucially*, the new text would always stay in the context of one, continuous narrative – not a bunch of disjointed asides.

(Bonus: [:picture of the original 1967 StretchText document](#StretchTextOriginalDocument)!)

When the World Wide Web was made in 1990, it *partially* implemented Nelson's ideas. You *can* give your reader links to click if they want more detail, but they will lose context.

In the decades since, the idea's been re-discovered a few times. Here's a not-comprehensive list...

* 2006: [The first tool](https://natematias.com/stretchtext/) to make StretchText-like things for the Web (as far as I know)
* 2008: A viral website named [Telescopic Text](https://www.telescopictext.org/text/KPx0nlXlKTciC) lets you stretch "I made tea" into a whole short story.
* 2018: Wikipedia adds a [:"hover to preview article"](#Wikipedia's Hover) feature.

And now, in 2022, I'm throwing my ring in the hat or whatever the phrase is, and giving you a new StretchText-like thing named Nutshell.

P.S. [:why would I bother you with yet another implementation? (or: comparing & contrasting Nutshell with previous StretchText-like tools)](#VsNutshell)


## Who made this?

Nutshell was a project started by [:Nicky Case](#NickyCase) in 2020, who then procrastinated on-and-off on it for two years, before finally rewriting all of it from scratch in two weeks in April 2022.

Special Thanks is also owed to these peeps:

* ss, ss, ss, ss for beta-testing early versions of Nutshell
* Kaira Imer for doing code on a previous version
* //// for remixing the beta version of Nutshell, and inspiring the new "dots opening & closing" animation.

Nicky <span style="text-decoration:line-through">panhandles on the internet</span> was funded by these generous folks via Patreon:

// iframe

If you'd like to help Nicky keep making free educational stuff and talk about themselves in the third person, feel free to dispose of your disposable cash at [Patreon dot com slash ncase!](https://www.patreon.com/ncase)

But seriously, thank you to everyone mentioned above. It's been a rough few years and I appreciate y'all.

💖,    
~ Nicky Case

---

### : Recursion

**Recursion** is when something contains a version of itself – for example, think of the film Inception's *dream-within-a-dream* plot device, or a Russian nesting doll's *doll-within-a-doll* design.

Recursion is most often used in math & programming, to get infinite potential out of finite stuff.

See also, [:Recursion](#Recursion) 

### : Nicky Case

Nicky Case is an internet person who explains stuff with games, "games", and pictures with words on them. You can see what they've inflicted upon humanity at their website, [ncase.me](https://ncase.me).

### : Wikipedia's Hover to Preview

On April 2018, Wikipedia got a cool new feature – if you hover over a link to another article, you see a page preview, like so:

// pic

This way you can quickly get info without losing context, and decide if you *really* want to click that link and sink into a 4-hour-long Wikipedia rabbithole.

### : StretchText Original Document

// img

Source [from Project Xanadu](http://xanadu.com/XUarchive/htn8.tif).

### : StretchText Vs Nutshell

Some features I've added that, hopefully, will make Nutshell much, *much* easier to use than past StretchText-like tools:

1. **You don't have to write in a new format.** Most StretchText-like tools usually need you to type in some new format; Nutshell just uses good ol' links, headers, and paragraphs, that you can write in whatever tool you're already used to.
2. **You don't have to write all your explanations from scratch every time.** You can embed explanations you've already written in the past, even from *before* Nutshell was made – which, again, is possible because Nutshell doesn't use a new format. What's more, you can embed explanations that *others* have written before, and vice versa: others can share the explanations *you've* written in their writing. Something something collective intelligence.
3. **You can embed more than just words & pictures.** You can also embed playable interactives, audio, video, and – eh, why not – the article introductions from Wikipedia & Simple Wikipedia. (Actually, there's a strong reason for this: the value of Nutshell depends on how many websites have Nutshell installed, but in the beginning there will be few of those. So, Nutshell has a [:network effect](#NetworkEffect) problem. So, I'm trying to solve this by making Nutshell as valuable as possible for you *even if nobody else is using Nutshell yet*. So, that's why I added the ability to re-use your own old explanations, and piggyback on Wikipedia's.)

### : Network Effect

Let's say you're making [a dating site for people named Vanessa](TODO).

Vanessas will only sign up for your site if it's valuable, but alas, your site's only valuable if lots of Vanessas have already signed up!

Most in-person and virtual communities, marketplaces offline and on, as well as some technologies like phones and the internet, are like this: *how valuable it is depends on how many people are already there.* In economics, this is called a **network effect**.

On the upside, this means you can get a virtuous cycle: more people means more valuable, more valuable means more people! But on the downside, this means it's hard to even get started: you first need some (usually high) **critical mass** to get that virtuous cycle rolling.

(And worse for users, this means that if a product starts sucking, it's hard to escape. For example: even if most people feel bleerggghrggrhghh about Facebook & Twitter, there's nowhere else to go – the only place that has the valuable network of Facebook & Twitter are Facebook & Twitter. What're ya gonna do, hang out with a buncha *nerds* on [:Mastadon](https://en.wikipedia.org/wiki/Mastodon_(software))?)

Some ways to escape the network trap:

1. To achieve critical mass as soon as possible, give your thing away at a discount, for free, or even *pay* people to sign up. (Example: sign-up referral codes & bonuses)
3. Make the thing valuable *even if nobody else uses it.* (Example: early OKCupid had silly personality tests & quizzes.)
4. Have some kind of "collective threshold pledge" where people pledge to join *if and only if* enough other people do the same. (Sort-of-example: Kickstarter does this for project funding, but I can't think of any *famous* examples of threshold-pledging for, say, activist action, or leaving Facebook & Twitter, or joining the world's first Vanessa-only dating site.)

### : Open Source

**Open source** code is – *usually\** – code that's not only free to use, but also free to build upon, remix & re-distribute, even for profit, with no or few\** requirements.

\* There are annoying debates & confusions about the words "free" and "open". *Very roughly speaking,* think "free as in freedom of the press", not "free as in free Wi-Fi at Starbucks."

\** One common requirement is "give credit". Fair enough. Some open source licenses go further: they require that your remix *also* be published under the same license. These are called **copyleft** licenses. Licenses without that requirement are called **permissive** licenses.

### : CORS

**Cross-Origin Resource Sharing (CORS)** are a bunch of rules that exist because web security programmers are paranoid, and rightfully so.

Let's say you're visiting Facebook.com. Your web browser (Firefox, Chrome, Safari, Microsoft Edge, etc...) pings Facebook, and Facebook gives you back your personal information. So far so good.

But now let's say you're visiting TotallyNotCyberCriminals.com. *If it weren't for CORS rules, this could happen:* the malicious website makes your web browser ping Facebook, Facebook sends back your personal information, and *bam* the bad actors have your personal information. (Well, different bad actors.)

Web browsers *could* just decide, "ok, a site can only get info from itself, only Facebook can get info from Facebook, etc". But then that'll make it impossible to do cool web things, like, say, make an "expandable explanations" tool that can embed [:random info from Wikipedia](https://en.wikipedia.org/wiki/Pet_door).

So the people who make web browsers chose this solution: Website X can only get information from Website Y *if Website Y says Website X is allowed to have it.* So Facebook says, nope, only me (and my advertising partners) can get your personal info, while Wikipedia says "hey yeah free (non-personal) info for everybody!"

So, it's rules for sharing resources across different websites, different origins. Hence: "Cross-Origin Resource Sharing".

P.S: [:a message for web developers](#CORS For Web Developers)

### : CORS For Web Developers

If you're a web developer, and it's safe for you to do so, I recommend enabling CORS on your website. You can do this for free by migrating to [Github Pages](https://pages.github.com/) – I promise this message was not sponsored – or, [check out Enable-CORS.org for more resources](https://enable-cors.org/).

And, look! Because Enable-CORS.org has enabled CORS, even *without* them having installed this "expandable explanations" tool, I can still embed [:info from them](https://enable-cors.org/#Why). Nice. 👌

### : Caveats For Trying To Use Nutshell

Two important caveats when trying to use Nutshell:

1. You only need to paste in *one* line of code into the site, but sadly some blogging platforms don't let you paste *any* custom code. You *can* successfully do this with Wordpress, Tumblr, Ghost, and Github Pages... but sadly, not Medium. First check if *your* blogging platform allows any custom code.

2. If you're embedding an explanation from someone else's website, the other site either needs Nutshell installed, or needs something called [:"CORS"](#CORS) enabled. But thankfully, you can use the *[Try Nutshell](TODO)* tool to test links first!
