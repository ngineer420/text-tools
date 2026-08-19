"""Page copy for the six translator pages.

One entry per page. This lives here rather than in `assets/js/codecs.js` for
the same reason `cleaner_pages.py` exists: it is read once at build time, and
shipping six intros and eighteen FAQ answers inside the engine would put ten
kilobytes of prose on every page of the site in order to serve one of them.

Every page here is a *different tool*, not one tool with a parameter — which is
why there is no shared body template and no interpolated sentence anywhere
below. /text-to-binary and /binary-to-text run the same engine in opposite
directions and are the closest pair on the site; their copy is deliberately
about different things (what an encoding *is*, versus how to read a blob
somebody handed you) because two pages that say the same thing in two orders
are one page with a doorway attached.

Fields:

    id              key in PAGES and in BY_ID
    slug            the file name without .html; the URL is /<slug>
    engine          which control shape codec-page.js should drive:
                    "morse" | "binary" | "caesar" | "nato"
    data            seed attributes for <main>, engine-specific. They are
                    namespaced `codec-init-*` rather than `codec-*` because
                    <main> encloses every control: a selector like
                    `[data-codec-dir]` would match the container as well as
                    the buttons, and a click on any button inside it would
                    bubble up and fire the container's handler too
    h1              the page heading
    nav             rail/sheet label, must match tools/nav_data.py
    title           <title>, before the " | TextKit Pro" suffix
    description     meta description
    tagline         the line under the h1
    sample          text pre-loaded into the input, so the page is alive on
                    arrival and the crawler sees a worked example
    controls        rendered above the textareas, engine-specific (see the
                    builder's control_html)
    about_heading   the h2 above the prose; every one is different, because a
                    heading templated across six pages is the tell that the
                    six pages are templated
    about           paragraphs of real HTML
    example         (label, before, after) for the before/after figure
    reference       optional (heading, intro, [(col1, col2), ...], columns)
    faq             (question, answer) pairs -> h3/p and FAQPage JSON-LD
    related         (href, text, note) triples

`tools/build_codec_pages.py` fails rather than falling back if a page has no
entry here.
"""

PAGES = [

    # ----------------------------------------------------------------- morse
    {
        "id": "morse",
        "slug": "morse-code-translator",
        "engine": "morse",
        "data": {"codec-init-dir": "encode"},
        "h1": "Morse Code Translator",
        "nav": "Morse Code",
        "title": "Morse Code Translator with Sound — Text to Morse and Back",
        "description": "Translate text to Morse code and Morse back to text, then actually hear it: a real oscillator plays your message at any speed from 5 to 40 WPM. No audio files, no upload.",
        "tagline": "Type it, read it, and hear it played at whatever speed you can follow",
        "sample": "HELLO WORLD",
        "controls": "morse",
        "about_heading": "Morse is a rhythm, which is why reading it off a screen never works",
        "about": [
            "Every guide to learning Morse says the same thing and every beginner ignores it: do not learn the dots and dashes as shapes. A person receiving Morse is not looking at <code>.-..</code> and counting marks, they are hearing <em>di-dah-di-dit</em> as one sound with one length, the way you hear a word rather than a row of letters. Learn it visually and you build a lookup step that has to be unlearned later, at around ten words a minute, when there is no longer time to count anything.",
            "That is the whole reason this page leads with the player rather than a text box. The written line is the transcription; the sound is the code. The oscillator here runs at 600&nbsp;Hz by default, near the pitch most operators set their receivers to, and the speed slider covers 5 to 40 words per minute — 5 for picking a letter apart, 20 for the speed most amateur licence tests use, 40 for what a practised contest operator copies in their head while writing down the last callsign.",
            "The timing is the ITU's, not an approximation. A dah is exactly three dits long, the gap inside a letter is one dit, between letters three, between words seven, and words-per-minute is calibrated against <strong>PARIS</strong> — the standard fifty-dit word — so 20&nbsp;WPM really is a 60&nbsp;millisecond dit and not merely something that feels about right. Speed changes the dit length and nothing else; the ratios never move, because the ratios are what makes it Morse.",
            "The table is the ITU-R M.1677-1 alphabet, which includes punctuation most charts drop and a handful of accented letters English speakers never meet. The prosigns are listed separately because they are not letters at all: <code>&lt;AR&gt;</code> is di-dah-di-dah-dit, exactly the same marks as A followed by R, and only the missing gap between them says it means <em>end of message</em> rather than the letters. Type them in angle brackets and they encode as one unbroken symbol.",
        ],
        "example": ("SOS, the one everybody knows",
                    "SOS",
                    "... --- ..."),
        "reference": ("The ITU Morse alphabet",
                      "Letters, digits and the punctuation the recommendation actually defines. A slash between symbols is a word gap; three or more spaces means the same thing, because pasted Morse from three sites uses three conventions.",
                      "morse", 4),
        "faq": [
            ("Why does the sound matter more than the chart?",
             "Because Morse at any usable speed is received by ear as whole-letter sounds, not decoded mark by mark. Operators call the visual approach the counting habit, and it caps you at roughly ten words a minute — the point where there is no longer a gap in which to count. Learning the rhythm from the start skips that ceiling entirely, which is why the Koch and Farnsworth methods both teach at full character speed from lesson one and slow the gaps instead."),
            ("What speed should I start at?",
             "Put the slider at 5 to 8 WPM to take a letter apart, but do not stay there. The usual advice is Farnsworth timing: characters sent at 18 to 20 WPM with long gaps between them, so your ear learns each letter at the speed you will eventually need while your brain still gets time to think. This page's slider changes both together, so the nearest equivalent is to work at 10 to 12 and move up as soon as it stops feeling frantic."),
            ("Does anything still use Morse?",
             "Commercial maritime use ended in 1999 when GMDSS replaced it, and aviation now uses it only for one job — navigation beacons still identify themselves by transmitting their two or three letter code on a loop, which is why pilots learn to read it. Amateur radio is where it stayed alive by choice: CW gets through noise and weak signals that would swallow voice, using a fraction of the bandwidth and the power."),
        ],
        "related": [
            ("/nato-phonetic-alphabet", "NATO Phonetic Alphabet", "the same job for a voice channel instead of a key."),
            ("/text-to-binary", "Text to Binary", "the other way of spelling a letter out one signal at a time."),
            ("/rot13", "ROT13", "a cipher, rather than an alphabet — Morse hides nothing."),
        ],
    },

    # ------------------------------------------------------------ text->bin
    {
        "id": "text-to-binary",
        "slug": "text-to-binary",
        "engine": "binary",
        "data": {"codec-init-dir": "encode", "codec-init-base": "binary"},
        "h1": "Text to Binary",
        "nav": "Text to Binary",
        "title": "Text to Binary Converter — 8-bit, Unicode and Hex",
        "description": "Convert text to binary as UTF-8 bytes or as one group per character, with a hex output toggle and a separator you choose. Runs in your browser, nothing uploaded.",
        "tagline": "Two different meanings of “text to binary”, and a switch that says which one you got",
        "sample": "Hi",
        "controls": "binary",
        "about_heading": "“Text to binary” is two questions, and most converters silently answer one",
        "about": [
            "Ask for the binary of the letter <code>H</code> and everyone agrees: <code>01001000</code>. Ask for the binary of <code>é</code> and the answers split. One says <code>11101001</code>, a single eight-bit group, because é is code point 233 and 233 in binary is that. The other says <code>11000011 10101001</code>, two groups, because é encoded as UTF-8 <em>is</em> two bytes and always has been. Neither is wrong. They are answers to different questions, and a converter that picks one without telling you is the reason two people comparing outputs decide one of them is broken.",
            "The <strong>UTF-8 bytes</strong> mode is what a programmer means. It is what actually travels down a wire or sits in a file, it round-trips absolutely anything including emoji, and every character outside the first 128 takes more than one group. The <strong>code points</strong> mode is what a puzzle, a homework question or a binary-tattoo generator means: one group per character, width set by the character itself. Pure ASCII input is byte-for-byte identical under both, which is exactly why the difference goes unnoticed until the first accented letter or emoji shows up and the output length doubles.",
            "The separator matters more than it looks. Eight-bit groups split by spaces are how the answer is written on a worksheet and how a decoder expects to receive it. Unseparated, it becomes one long run that only decodes if the reader already knows the group width — which is fine for ASCII and quietly lossy for anything else. Commas and one-group-per-line both exist here because spreadsheets and diff tools want them.",
            "Hexadecimal is the same numbers in a shorter coat. Two hex digits carry exactly one byte, so <code>48 69</code> is the same information as <code>01001000 01101001</code> in a quarter of the width, which is why every hex editor, colour picker and MAC address in the world is written that way rather than in binary. The toggle changes the base and nothing else.",
        ],
        "example": ("Two characters, UTF-8 bytes, space separated",
                    "Hi",
                    "01001000 01101001"),
        "reference": ("ASCII in three bases",
                      "The printable range every one of these conversions agrees on. Above 127 the two modes diverge, which is what the mode switch is for.",
                      "ascii", 3),
        "faq": [
            ("Why is my accented letter two groups long?",
             "Because you are in UTF-8 bytes mode, and in UTF-8 every character above code point 127 takes two, three or four bytes. é is two, — is three, an emoji is four. If you wanted a single group per character, switch to code points mode; if you are feeding the output to anything that will actually read it as text, stay on bytes, because bytes is what UTF-8 means."),
            ("What is the binary for a space?",
             "01000000 is a common wrong answer. A space is code point 32, so it is 00100000, and it is a character like any other — it gets its own group. The other invisible ones people ask about: a newline is 00001010, a tab is 00001001, and a carriage return is 00001101. Whether your text contains carriage returns depends on which operating system typed it."),
            ("Can I convert binary back to text here?",
             "This page runs one way by design, because “text to binary” and “binary to text” are searched as separate things and each deserves a page that opens pointing the right way. Paste binary into the box and the direction flips automatically; or go to the binary to text page, which starts in that direction and explains what to do with a blob that will not decode."),
        ],
        "related": [
            ("/binary-to-text", "Binary to Text", "the same engine pointed the other way, with the troubleshooting."),
            ("/morse-code-translator", "Morse Code Translator", "another way to spell a letter out one signal at a time."),
            ("/text-statistics", "Text Statistics", "counts characters, words and bytes without converting anything."),
        ],
    },

    # ------------------------------------------------------------ bin->text
    {
        "id": "binary-to-text",
        "slug": "binary-to-text",
        "engine": "binary",
        "data": {"codec-init-dir": "decode", "codec-init-base": "binary"},
        "h1": "Binary to Text",
        "nav": "Binary to Text",
        "title": "Binary to Text Converter — Decode 1s and 0s, With or Without Spaces",
        "description": "Paste binary with spaces, without spaces, in commas or as hex, and read it back as text. Tells you which group failed instead of returning nothing.",
        "tagline": "Paste the blob somebody sent you and find out what it says — or why it will not decode",
        "sample": "01001000 01100101 01101100 01101100 01101111",
        "controls": "binary",
        "about_heading": "When a binary string refuses to decode, it is almost always one of four things",
        "about": [
            "Decoding is where binary gets interesting, because encoding cannot really fail and decoding fails constantly. The string arrives from a puzzle, a forum post, a game, a tattoo photo or a homework sheet, and the four ways it goes wrong are worth knowing by sight.",
            "<strong>The length is not a multiple of eight.</strong> Count the digits. If the total does not divide by eight, a digit was lost in the copy or the sender was using seven-bit groups, which was normal in the era when ASCII was seven bits and the eighth was a parity check. A stray leading zero disappearing from the front of a group is the single most common transcription error, because it looks like nothing.",
            "<strong>It is not actually binary.</strong> If there is a digit above 1 anywhere, the string is decimal or hex. Long runs of digits with the occasional letter a to f are hex — switch the base rather than trying to fix the string. This page names the offending group rather than returning an empty box, because “nothing happened” tells you nothing about which of eight hundred characters was wrong.",
            "<strong>The groups are the wrong width.</strong> Unseparated binary is only decodable if you know the width. Eight is the usual answer and the one assumed here. If eight produces plausible-looking gibberish — readable letters in the wrong order, or every character shifted — try reading it as code points instead, which is how binary written for a puzzle rather than for a computer is usually built.",
            "<strong>The text was never ASCII.</strong> If the decode produces the right number of characters and half of them are replacement marks, the original was UTF-8 with multi-byte characters and something truncated it, or the groups were code points and you are decoding as bytes. The mode toggle is the fix; those two readings are genuinely different for anything above 127.",
        ],
        "example": ("Five groups, one word",
                    "01001000 01100101 01101100 01101100 01101111",
                    "Hello"),
        "reference": ("ASCII in three bases",
                      "If a decode looks close but wrong, comparing a few groups against this table usually shows the offset immediately.",
                      "ascii", 3),
        "faq": [
            ("It decoded but the text is gibberish. What now?",
             "Check the group width first — the commonest cause is a string built as 7-bit ASCII being read as 8-bit, which shifts everything after the first character. Then try code points mode, which reads each group as one whole character rather than one UTF-8 byte. If the gibberish is readable letters in a scrambled order rather than symbols, the string is text but it was reversed or shifted, and it is a cipher rather than an encoding problem."),
            ("Does it handle binary with no spaces?",
             "Yes. Unseparated input is chopped into eight-digit groups, which is the right guess for the overwhelming majority of what people paste. Commas, line breaks and mixed whitespace all work as separators too. What cannot be guessed is a string of seven-bit groups run together with no separator, because nothing in the digits themselves says where one character stops."),
            ("Why does one emoji come out as four odd characters?",
             "Because you are decoding as code points and the source was UTF-8 bytes. An emoji is four bytes in UTF-8, and reading those four bytes as four separate characters gives you four meaningless ones instead of the emoji. Switch to UTF-8 bytes mode and the four groups recombine into the single character they encode."),
        ],
        "related": [
            ("/text-to-binary", "Text to Binary", "the encoding direction, and what the two modes actually mean."),
            ("/caesar-cipher", "Caesar Cipher", "for when the decode works but the words are still scrambled."),
            ("/text-cleaner", "Text Cleaner", "strip the stray characters a bad copy-paste dragged in."),
        ],
    },

    # ---------------------------------------------------------------- caesar
    {
        "id": "caesar",
        "slug": "caesar-cipher",
        "engine": "caesar",
        "data": {"codec-init-dir": "encode", "codec-init-shift": "3"},
        "h1": "Caesar Cipher",
        "nav": "Caesar Cipher",
        "title": "Caesar Cipher Encoder and Decoder — All 26 Shifts at Once",
        "description": "Shift letters by any amount, or break a Caesar cipher by reading all twenty-six shifts at once. Frequency analysis suggests the answer; your eye confirms it.",
        "tagline": "Encode with any shift, or break one by reading all twenty-six answers",
        "sample": "attack at dawn",
        "controls": "caesar",
        "about_heading": "A cipher with twenty-five wrong answers is not really a cipher",
        "about": [
            "Suetonius records that Julius Caesar wrote his confidential letters with each letter replaced by the one three places further on, so that A became D and the message meant nothing to a courier who intercepted it. It worked, and the reason it worked has nothing to do with the cipher: almost nobody in first-century Rome could read at all, and the few who could had never met the idea that writing might be deliberately scrambled. The security was in the novelty.",
            "The moment the idea is known, the whole scheme collapses, because there are only twenty-five wrong answers. That is not a large enough space to hide in — you do not need a computer, a key or any cleverness, you write out all twenty-six lines and look for the one that is English. This page shows you those twenty-six lines rather than pretending anything more sophisticated is required, and that table is the honest teaching tool: it makes the size of the key space visible in a way a paragraph about it cannot.",
            "The frequency button is the other classic method, and it is worth understanding rather than just pressing. English is lopsided — E is about 12% of letters, T about 9%, and the bottom half of the alphabet barely registers — so a shifted text has a shifted version of that same lopsided shape. Comparing the letter counts against the expected English shape at each of the twenty-six offsets and picking the closest is one line of arithmetic. It is reliable on a sentence, unreliable on three words, and useless on a single one, which is why it suggests a shift here rather than announcing an answer.",
            "One property worth noticing: shift 13 is its own inverse, because 13 is half of 26. Encoding twice returns the original, so encoder and decoder are the same operation and no direction has to travel with the message. That single convenience is why ROT13, and not shift 3 or shift 7, is the one that became a convention, and it has <a href=\"/rot13\">its own page</a>.",
        ],
        "example": ("Caesar's own shift of three",
                    "attack at dawn",
                    "dwwdfn dw gdzq"),
        "faq": [
            ("How do I break a Caesar cipher without knowing the shift?",
             "Read all twenty-six shifts and pick the English one — the table on this page updates as you type, so the answer is already on screen. That works because the key space is twenty-six, small enough to check exhaustively by eye in seconds. For a longer text the frequency button gets you there in one step by matching letter counts against English's expected distribution, but on anything shorter than a sentence you should trust your eye over the arithmetic."),
            ("Does it shift numbers and punctuation?",
             "No, and that is the standard definition rather than a shortcut. Only the twenty-six letters rotate; digits, spaces and punctuation pass through untouched. This is also the cipher's second weakness after its tiny key space: word lengths, apostrophes and sentence punctuation all survive, so the shape of the message is legible even before it is decoded."),
            ("Is a Caesar cipher the same as ROT13?",
             "ROT13 is a Caesar cipher with the shift fixed at 13. The reason it gets its own name is that 13 is exactly half of 26, so applying it twice returns the original text and one operation serves as both encoder and decoder. Caesar's own letters used a shift of three, which does not have that property."),
        ],
        "related": [
            ("/rot13", "ROT13", "the shift-13 special case, and why it needs no decode button."),
            ("/binary-to-text", "Binary to Text", "when the puzzle is an encoding rather than a cipher."),
            ("/reverse-text", "Reverse Text", "the other thing a scrambled-looking string often turns out to be."),
        ],
    },

    # ----------------------------------------------------------------- rot13
    {
        "id": "rot13",
        "slug": "rot13",
        "engine": "caesar",
        "data": {"codec-init-dir": "encode", "codec-init-shift": "13", "codec-init-locked": "1"},
        "h1": "ROT13",
        "nav": "ROT13",
        "title": "ROT13 Encoder and Decoder — One Button, Both Directions",
        "description": "Rotate letters by 13. Because 13 is half of 26, encoding and decoding are the same operation, so there is one button and no direction to get wrong.",
        "tagline": "Rotate by thirteen — run it twice and you are back where you started",
        "sample": "Spoilers ahead: the butler did it.",
        "controls": "rot13",
        "about_heading": "Not a cipher. A politeness protocol that happens to look like one",
        "about": [
            "ROT13 has never been about secrecy and nobody who used it thought it was. It appeared on Usenet in the early 1980s as a courtesy: a way to post a punchline, a spoiler or an answer so that it did not arrive in your eye before you had chosen to read it. The reader who wanted it typed a key; the reader who did not, did not. It is a curtain, not a lock, and every newsreader of the era had a single keystroke to pull it back.",
            "The mechanism is one property of the number 26. Rotating a letter thirteen places and then thirteen more moves it twenty-six places, which is all the way round the alphabet and back to where it started. So ROT13 is its own inverse: the encoder and the decoder are the same operation, there is no second function, and no direction has to travel alongside the message. That is why this page has one button rather than an encode/decode toggle — a decode toggle would be a control that does nothing.",
            "It is still in daily use for exactly the job it was invented for. Puzzle communities post hints in it, mailing lists hide answers in it, some CTF and adventure-game hint systems still serve it, and it survives in the classic <code>tr a-zA-Z n-za-mN-ZA-M</code> one-liner that half of Unix's users know by heart. It has also earned an ironic second life as the standard example in any conversation about security theatre.",
            "So: do not use it to protect anything. It has no key, its algorithm is universally known, and reversing it is a single automatic step — which is the whole point, since a reader has to be able to undo it trivially for the convention to work at all. If you need something a person cannot casually read, that is <a href=\"/caesar-cipher\">not what a rotation cipher is for</a> either; it is a job for real encryption.",
        ],
        "example": ("Run it twice and the text comes back",
                    "Spoilers ahead: the butler did it.",
                    "Fcbvyref nurnq: gur ohgyre qvq vg."),
        "faq": [
            ("Why is there no decode button?",
             "Because there is nothing for it to do. Thirteen is half of twenty-six, so rotating by thirteen twice takes every letter all the way around the alphabet and back to itself. The encoder is the decoder. Paste encoded text into the same box and the plain text comes out — a separate decode mode would be a second button running identical code."),
            ("Is ROT13 secure?",
             "Not remotely, and it was never meant to be. There is no key, the algorithm is public, and undoing it is one automatic step — which is the requirement, not the flaw, because the reader is supposed to be able to reveal a spoiler effortlessly. It is a curtain over a punchline. For anything that actually needs protecting, use encryption."),
            ("What about numbers — is there a ROT5?",
             "Yes. ROT5 does the same trick to the ten digits, since five is half of ten, and ROT18 is the two combined so that letters and numbers both rotate and both self-invert. ROT47 extends the idea across most of the printable ASCII range including punctuation. All three are the same one idea applied to a different alphabet size."),
        ],
        "related": [
            ("/caesar-cipher", "Caesar Cipher", "any shift, plus the table that breaks one."),
            ("/text-to-binary", "Text to Binary", "an encoding, where ROT13 is a substitution."),
            ("/find-and-replace", "Find and Replace", "for substitutions that are not a rotation."),
        ],
    },

    # ------------------------------------------------------------------ nato
    {
        "id": "nato",
        "slug": "nato-phonetic-alphabet",
        "engine": "nato",
        "data": {"codec-init-dir": "encode"},
        "h1": "NATO Phonetic Alphabet",
        "nav": "NATO Phonetic",
        "title": "NATO Phonetic Alphabet Translator — Spell Anything Out Loud",
        "description": "Turn a code, a postcode or a name into Alfa Bravo Charlie, with the aviation digit forms as an option. The full ICAO chart, and why Alfa and Juliett are spelt that way.",
        "tagline": "Alfa Bravo Charlie — the spelling alphabet built to survive a bad line",
        "sample": "SOS 911",
        "controls": "nato",
        "about_heading": "Every word was chosen by testing it on a bad radio, in an accent that was not yours",
        "about": [
            "The alphabet in use today is the ICAO/NATO one, adopted in 1956 after several years of genuinely painstaking work. Earlier spelling alphabets had been assembled by committees who spoke one language and checked the words on a good line; this one was tested across speakers of English, French and Spanish, over deliberately degraded audio, with the requirement that every word survive being said by someone whose first language was none of those and heard by someone in the same position.",
            "That explains the words that look wrong. <strong>Alfa</strong> is not a typo for Alpha: <em>ph</em> is not pronounced /f/ in most languages, and a French or Italian speaker reading “Alpha” from a printed chart says something else. <strong>Juliett</strong> carries the extra T because a French speaker reading “Juliet” gives the final <em>t</em> no sound at all. Both spellings are the official ones and both are routinely corrected back by people who assume the chart has a mistake in it.",
            "The digits have their own story, and it is why this page offers them as a toggle. Aviation and maritime radio say several numbers differently from ordinary English: <strong>niner</strong> so that nine cannot be heard as the German <em>nein</em>, <strong>tree</strong> because the English /θ/ sound is one of the first casualties of a noisy channel, <strong>fower</strong> and <strong>fife</strong> because a final /r/ and /v/ vanish under static too. Outside aviation nobody uses these; inside it, they are mandatory. The standard setting spells digits plainly and the radio setting uses the aviation forms.",
            "For everyday use — reading a booking reference to a call centre, giving a postcode, confirming a name — the practical point is not to be authentic but to be unambiguous. B and V, M and N, S and F are the pairs that get confused on a phone, and those are exactly the ones the alphabet separates most widely. Bravo and Victor share no sound at all.",
        ],
        "example": ("A short code spelt for the radio",
                    "SOS 911",
                    "Sierra Oscar Sierra (space) Nine One One"),
        "reference": ("The ICAO/NATO alphabet",
                      "The official spellings, plus the aviation digit forms in the last column. Both Alfa and Juliett are correct as printed.",
                      "nato", 3),
        "faq": [
            ("Is it Alfa or Alpha?",
             "Officially Alfa, with an f. The ICAO chose that spelling deliberately because the digraph ph is not read as /f/ in most languages, so a speaker of French, Spanish or Italian reading “Alpha” off a chart would say the wrong word. Juliett gets a doubled t for the same class of reason — a French speaker would leave a single final t silent. Both are constantly “corrected” by people who assume the chart is misprinted."),
            ("Why do pilots say niner and tree?",
             "To keep the digits apart from each other and from other languages on a channel with noise on it. Nine becomes niner so it cannot be heard as the German nein; three becomes tree because the th sound is fragile over radio; four and five become fower and fife to protect the final consonants. These are aviation and maritime conventions, not part of everyday use, which is why they are a toggle on this page rather than the default."),
            ("Is the NATO alphabet the same as the police one?",
             "No, and that is a common source of confusion. Many police forces use their own lists — the British APCO alphabet and various American departments each have one, with words like Edward, George and Ida that are not in the ICAO chart at all. The NATO/ICAO alphabet is the international standard for aviation, shipping and the military; a domestic police alphabet is a local convention."),
        ],
        "related": [
            ("/morse-code-translator", "Morse Code Translator", "the same job for a key rather than a microphone."),
            ("/case-converter", "Case Converter", "get a reference into one case before you read it out."),
            ("/slugify", "Slugify", "strip a string down to characters that survive anything."),
        ],
    },
]

BY_ID = {p["id"]: p for p in PAGES}
SLUGS = [p["slug"] for p in PAGES]
