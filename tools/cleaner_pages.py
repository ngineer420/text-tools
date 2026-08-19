"""Data and page copy for the generated "remove X from text" family.

One entry per cleaner in the registry at the top of `assets/js/app.js`. The
`id` here is the value of the `data-cleaner` attribute the builder stamps on
`<main>`, the key in a `cleanText()` selection and the key in `CLEANERS` — one
string, three places, so a typo shows up as a dead page rather than as a page
that quietly cleans nothing.

This file is read only at build time. It stays out of app.js for the reason
fontloom keeps `style_page_copy.py` out of its engine: seven intros and
twenty-one FAQ answers inside the script every page loads would cost every
visitor the prose of six pages they are not on.

Fields per page:

    id            registry key, also the data-cleaner value
    slug          the URL, without the leading slash or the .html
    h1            the page heading
    nav           short label used in the "also clean up" stack elsewhere
    title         <title>, before the " | TextKit Pro" suffix
    description   meta description
    tagline       the line under the h1
    controls      the tool's own options — see the schema note below
    sample        what the input textarea is seeded with; per-topic, because a
                  lorem-ipsum seed on the emoji page demonstrates nothing
    about_heading the h2 over the prose; different on every page on purpose
    about         paragraphs, specific to this transform
    example       (label, before, after) shown as a worked example
    faq           three (question, answer) pairs, rendered as h3/p and as
                  FAQPage JSON-LD
    also_on       ids pre-ticked in the "also clean up" stack (usually none —
                  a page should demonstrate its own transform first)
    related       (href, text) rows for the "More text tools" block

Control schema. `kind` is "select" or "check"; `opt` is the option name read
straight back by `readCleanerOptions` in app.js, so adding an option here is
the whole change — no JavaScript edit is needed to expose it.

    {"kind": "select", "opt": "mode", "label": "...",
     "options": [(value, label), ...]}
    {"kind": "check", "opt": "tabsToSpaces", "label": "...", "checked": True}
"""

# The combined tool. Hand-written (text-cleaner.html), not generated, but the
# builder needs to know it exists for the sitemap and the cross-links.
HUB = {
    "slug": "text-cleaner",
    "h1": "Text Cleaner",
}

PAGES = [
    # ----------------------------------------------------------------- spaces
    {
        "id": "extra-spaces",
        "slug": "remove-extra-spaces",
        "h1": "Remove Extra Spaces",
        "nav": "Extra spaces",
        "title": "Remove Extra Spaces from Text Online — Free Tool",
        "description": "Collapse runs of spaces down to one, strip trailing whitespace off every line and clear out the non-breaking spaces a web copy leaves behind. Free, instant, nothing uploaded.",
        "tagline": "Collapse double spaces, trim the ends of every line, and clear out the invisible spaces that came along with a copy from a web page.",
        "controls": [
            {"kind": "select", "opt": "mode", "label": "Spaces inside a line", "options": [
                ("collapse", "Collapse runs to one space, trim both ends"),
                ("indent", "Collapse runs but keep the leading indentation"),
                ("trim", "Only trim the start and end of each line"),
                ("all", "Delete every space and tab"),
            ]},
            {"kind": "select", "opt": "blankLines", "label": "Blank lines", "options": [
                ("collapse", "Collapse runs of blank lines to one"),
                ("remove", "Remove every blank line"),
                ("keep", "Leave blank lines alone"),
            ]},
            {"kind": "check", "opt": "tabsToSpaces", "label": "Tabs to spaces", "checked": True},
            {"kind": "check", "opt": "unifySpaces", "label": "Convert non-breaking and zero-width spaces", "checked": True},
        ],
        "sample": (
            "The  quick   brown fox    jumps over the lazy dog.  \n"
            "\tThis line arrived with a tab in front of it.\n"
            "\n"
            "\n"
            "This paragraph was copied out of a web page, so the gaps you can see\n"
            "here are non-breaking spaces rather than ordinary ones.   \n"
        ),
        "about_heading": "Why pasted text ends up full of spaces you did not type",
        "about": [
            "Most double spaces are not typed on purpose. They arrive: a sentence written on a typewriter-era keyboard keeps the two spaces after the full stop, a table copied out of a PDF lands as columns padded out with runs of spaces, and a paragraph pulled off a web page brings the indentation of the HTML source with it. This tool <strong>collapses each run down to a single space</strong> and trims the leading and trailing whitespace off every line, which is the shape almost every destination actually wants.",
            "The mode select is the whole decision. <strong>Collapse and trim</strong> is the default and the right answer for prose. <strong>Keep the leading indentation</strong> matters when you are cleaning code or a YAML block, where the indentation is meaning rather than noise and only the runs inside a line are the problem. <strong>Trim only</strong> leaves interior spacing intact and just deals with the invisible whitespace hanging off the ends of lines — the kind that shows up as a red block in a diff and adds a stray line break to Markdown. <strong>Delete every space</strong> is for the case where the spacing itself is the corruption, such as a card number or a hash that got wrapped and padded in transit.",
            "The two checkboxes deal with the whitespace you cannot see. <strong>Tabs to spaces</strong> converts tab characters that would otherwise survive a collapse pass untouched, because a tab is not a space and a naive space-squeezing regex walks straight past it. <strong>Non-breaking and zero-width spaces</strong> is the one that solves the mystery case: text copied out of a web page routinely carries U+00A0 (a non-breaking space), U+2009 (a thin space) or U+200B (a zero-width space). They look exactly like ordinary spaces on screen, so a find-and-replace of “two spaces” never matches them, and they break a sort, a lookup or a comparison later on for no visible reason.",
            "Blank lines get their own control because they are a different question from spaces. Collapsing runs down to one keeps paragraph structure while removing the double-spaced gaps a copy from an email client leaves behind. Removing them all is for a list. Leaving them alone is for anything where the blank lines are deliberate.",
        ],
        "example": (
            "A paragraph copied out of a PDF",
            "The  report   was  published  in  March .  \nIt  covered   three   regions .   ",
            "The quick fix is the default mode:\nThe report was published in March .\nIt covered three regions .",
        ),
        "faq": [
            ("Why does my text have two spaces after every full stop?",
             "Because someone was taught to type that way. The two-space convention comes from monospaced typewriters, where every character was the same width and the extra space was the only way to make a sentence break visible. Proportional fonts have handled that spacing themselves for decades, so the second space now shows up as a visible gap, especially in justified text. Collapsing runs to one fixes the whole document in a single pass."),
            ("What is a non-breaking space, and why does find-and-replace miss it?",
             "It is U+00A0, a different character from the ordinary space at U+0020 that renders identically but tells the layout engine never to break the line at that point. Web pages are full of them, so they come along with any copy. Because it is a separate character, searching for a space does not match it, which is why text that plainly has a gap in it refuses to be cleaned by hand. The “convert non-breaking and zero-width spaces” option rewrites them as normal spaces first, and drops the zero-width ones entirely."),
            ("Will this destroy the indentation in code I pasted?",
             "Not if you choose “collapse runs but keep the leading indentation”. That mode leaves everything before the first non-space character on each line exactly as it was and only squeezes the runs that appear inside the line, so a Python block or a YAML file keeps its structure. The default mode does trim the front of each line, which is correct for prose and wrong for code."),
        ],
        "also_on": [],
        "related": [
            ("/remove-line-breaks", "Remove Line Breaks", "join wrapped lines or unwrap paragraphs out of a PDF."),
            ("/sort-and-dedupe-lines", "Sort &amp; Dedupe", "sort lines and drop duplicates after the whitespace is even."),
            ("/find-and-replace", "Find &amp; Replace", "for the cases that need a regular expression rather than a preset."),
        ],
    },
    # ------------------------------------------------------------ punctuation
    {
        "id": "punctuation",
        "slug": "remove-punctuation",
        "h1": "Remove Punctuation",
        "nav": "Punctuation",
        "title": "Remove Punctuation from Text Online — Free Tool",
        "description": "Strip commas, full stops, quotes, brackets and dashes out of text, with the option to keep sentence endings or the apostrophes and hyphens inside words. Free and instant.",
        "tagline": "Strip out commas, full stops, quotes, brackets and dashes — while keeping the apostrophes and hyphens that live inside words, if you want them.",
        "controls": [
            {"kind": "select", "opt": "keep", "label": "Keep", "options": [
                ("none", "Nothing — remove every punctuation mark"),
                ("words", "Apostrophes and hyphens inside words"),
                ("sentence", "Sentence endings: . ! ? , ; :"),
                ("both", "Sentence endings, apostrophes and hyphens"),
            ]},
            {"kind": "select", "opt": "replaceWith", "label": "Replace each mark with", "options": [
                ("nothing", "Nothing"),
                ("space", "A space"),
            ]},
            {"kind": "check", "opt": "foldQuotes", "label": "Fold curly quotes and apostrophes to their straight forms", "checked": True},
        ],
        "sample": (
            "“It’s not that simple,” she said — and, frankly, she was right.\n"
            "The report (published 12 March) covered three regions: north, south and west.\n"
            "Well-known brands — Nike, Adidas, Puma — all reported the same thing…\n"
        ),
        "about_heading": "What counts as punctuation, and what does not",
        "about": [
            "This tool removes the characters Unicode classifies as <strong>punctuation</strong>: full stops, commas, colons, semicolons, question and exclamation marks, apostrophes, quotation marks of every shape, brackets of every shape, hyphens, en and em dashes, slashes, ellipses and the rest. It does not touch <strong>symbols</strong> — the plus sign, equals, less-than, greater-than, the pipe, the tilde, the caret, the backtick and every currency sign are Unicode symbols rather than punctuation, and a tool that silently ate the plus in a phone number would be the wrong tool. If symbols are what you are after, <a href=\"/remove-special-characters\">remove special characters</a> handles those. The split surprises people in the other direction too: <code>% # @ &amp; * /</code> are all punctuation in Unicode's classification, so they do go.",
            "The keep setting is what makes this usable on real text. Removing <em>everything</em> turns “It’s a well-known problem” into “Its a wellknown problem”, which is fine if you are building a bag of words for a frequency count and wrong if a human has to read the result. <strong>Keep apostrophes and hyphens</strong> preserves contractions and compound words while still clearing out the sentence furniture. <strong>Keep sentence endings</strong> does the opposite: it drops the brackets, quotes and dashes but leaves the text still punctuated into sentences.",
            "Curly punctuation is the part people get wrong by hand. Real text is full of ‘ ’ “ ” rather than their ASCII lookalikes, so a keep list written as <code>'</code> misses every curly apostrophe in the document and “don’t” silently loses the very mark you asked to keep. With <strong>fold curly quotes and apostrophes</strong> switched on, the typographic forms are mapped to the straight ones first, so a kept apostrophe is kept whichever version was typed. The en dash and the em dash are deliberately not folded onto the hyphen: “well-known” is one word and “a — b” is a sentence break, so keeping hyphens should not quietly keep every dash as well.",
            "Replacing each mark with a space rather than nothing matters for anything that will be split into words afterwards: <code>north,south,west</code> becomes three words rather than one. It does leave runs of spaces behind where several marks sat together, which is what the “extra spaces” box under the tool is there to tidy up.",
        ],
        "example": (
            "Preparing a line for a word-frequency count",
            "“It’s not that simple,” she said — and, frankly, she was right.",
            "Keeping apostrophes, replacing the rest with a space:\nIt's not that simple  she said   and  frankly  she was right",
        ),
        "faq": [
            ("Does this remove the plus sign, the equals sign and currency symbols?",
             "No. Unicode splits these characters into two categories, and + = < > | ~ ^ ` $ € £ are all classed as symbols rather than punctuation. Removing them from a phone number, an equation or a price is a different job with different consequences, so it lives on the remove special characters page where the choice of what survives is the first control."),
            ("How do I keep the apostrophe in “don’t” but lose the quotation marks?",
             "Choose “apostrophes and hyphens inside words”. Straight and curly apostrophes are both kept, and with the folding option on the curly one is handed back as a straight ' so the whole document is consistent. Quotation marks, brackets, dashes and everything else still go. That combination is the usual one for cleaning text before a word count, because it keeps contractions and hyphenated compounds as single words."),
            ("Why did my curly apostrophe come back as a straight one?",
             "Because you asked to keep that mark and the fold option is on. ‘ ’ “ ” are separate characters from ' and \", so a keep list has to cover both forms or half of them slip through, and folding to the straight form is what makes the output consistent. Switch the folding option off if you would rather the original character came back untouched. Note that the en and em dash are not folded onto the hyphen — they are a different mark, and keeping hyphens for “well-known” should not also keep every dash."),
        ],
        "also_on": [],
        "related": [
            ("/remove-special-characters", "Remove Special Characters", "for symbols, currency signs and anything outside letters and digits."),
            ("/word-counter", "Word Counter", "run the frequency count once the punctuation is out of the way."),
            ("/slugify", "Slugify", "if the destination is a URL rather than a word list."),
        ],
    },
    # ------------------------------------------------------- special chars
    {
        "id": "special-chars",
        "slug": "remove-special-characters",
        "h1": "Remove Special Characters",
        "nav": "Special characters",
        "title": "Remove Special Characters from Text Online — Free Tool",
        "description": "Strip symbols, control characters and anything outside letters and digits, with a choice of how much survives: letters only, letters plus basic punctuation, or plain ASCII.",
        "tagline": "Cut everything back to letters and digits, to letters plus basic punctuation, or to plain ASCII — and say which, because “special character” means something different every time.",
        "controls": [
            {"kind": "select", "opt": "keep", "label": "Keep", "options": [
                ("alnum", "Letters, digits and spaces only"),
                ("basic", "Also basic punctuation . , ! ? ' \" ( ) - : ; / @ # &amp; %"),
                ("ascii", "Plain ASCII — fold accents, drop everything else"),
            ]},
            {"kind": "select", "opt": "replaceWith", "label": "Replace each removed character with", "options": [
                ("nothing", "Nothing"),
                ("space", "A space"),
            ]},
            {"kind": "check", "opt": "transliterate", "label": "Fold accented letters to ASCII rather than deleting them", "checked": True},
        ],
        "sample": (
            "Invoice #4471 — Café Müller (Berlin) ✓ paid €1,240.00\n"
            "File: Q3_report~final*v2.csv | owner: a.schmidt@example.com\n"
            "╔═════╗ box-drawing characters from a terminal paste ╔══╗\n"
        ),
        "about_heading": "“Special character” depends entirely on where the text is going",
        "about": [
            "There is no single set of special characters, which is why this page makes you choose one rather than guessing. A filename cannot contain <code>/ \\ : * ? \" &lt; &gt; |</code>. A CSV field breaks on the delimiter and the quote character. A legacy database column that is still Latin-1 chokes on anything above U+00FF. A form validator might accept nothing but letters, digits and spaces. Those are four different answers, so the keep setting is the first control on the page.",
            "<strong>Letters, digits and spaces</strong> is the strictest option and the one most people mean. It keeps letters in every script — é, ü, α, 你 all survive, because they are letters — and removes every symbol, bracket, mark and separator. <strong>Also basic punctuation</strong> adds back the handful of marks that make text readable rather than decorative, which is usually the right choice for a title or a description field. <strong>Plain ASCII</strong> is the option for a system that cannot cope with anything else: accented letters are folded to their unaccented forms first so café becomes cafe rather than caf, and whatever is left outside the printable ASCII range is dropped.",
            "Control characters go in every mode, without asking. They are invisible, they are almost never intentional in pasted text, and they are the usual cause of a file that imports two rows short or a string that compares unequal to an identical-looking one. Vertical tabs, form feeds, the delete character and the C0 range all come out; the newline is the one exception, because line structure is not a special character.",
            "The folding checkbox only changes the ASCII mode, and it is the difference between a useful result and a mangled one. With it on, “Café Müller” becomes “Cafe Muller”. With it off, the accented letters are simply outside ASCII and get deleted, leaving “Caf Mller”. If accents are all you want gone and the rest of the text should stay, <a href=\"/remove-accents\">remove accents</a> does that on its own.",
        ],
        "example": (
            "A filename copied out of a spreadsheet",
            "Q3_report~final*v2 — Café Müller.csv",
            "Plain ASCII, folding accents:\nQ3_reportfinalv2  Cafe Muller.csv\n(underscores and dots are ASCII, so they survive; the tilde, asterisk and em dash do not)",
        ),
        "faq": [
            ("What actually counts as a special character here?",
             "Whatever falls outside the set you pick. In the strictest mode the survivors are Unicode letters, Unicode digits and whitespace; everything else — symbols, currency signs, brackets, quotation marks, box-drawing characters, arrows, dingbats and control characters — is removed. That is a deliberately mechanical definition, because every informal one turns out to mean something different depending on where the text is going."),
            ("Will this make my text safe to use as a filename?",
             "It will remove the characters that break filenames, but it is not the tool built for that job. A filename also wants a length limit, a separator instead of runs of spaces, and consistent lower case, which is what the slugify tool does in one pass. Use this page when you need the text itself cleaned rather than converted into an identifier."),
            ("Why are my accented letters still there?",
             "Because é and ü are letters, and the first two modes keep letters. Only the plain ASCII mode touches them, and even then it folds rather than deletes when the folding option is on, so café comes back as cafe. If accents are the only thing you want gone, the remove accents page does exactly that and leaves the rest of the punctuation alone."),
        ],
        "also_on": [],
        "related": [
            ("/remove-accents", "Remove Accents", "fold é ü ñ to plain letters without touching anything else."),
            ("/slugify", "Slugify", "turn a title into a URL-safe identifier in one step."),
            ("/remove-punctuation", "Remove Punctuation", "for commas, quotes and brackets rather than symbols."),
        ],
    },
    # ---------------------------------------------------------------- numbers
    {
        "id": "numbers",
        "slug": "remove-numbers",
        "h1": "Remove Numbers",
        "nav": "Numbers",
        "title": "Remove Numbers from Text Online — Free Tool",
        "description": "Strip digits out of text: every digit, only whole standalone numbers so mp3 and H2O survive, or just the 1. 2. 3. list markers off a pasted list.",
        "tagline": "Take out every digit, only the whole numbers so mp3 and H2O keep theirs, or just the “1.” that opens each line of a pasted list.",
        "controls": [
            {"kind": "select", "opt": "mode", "label": "What to remove", "options": [
                ("all", "Every digit, wherever it appears"),
                ("standalone", "Whole numbers only — keep mp3, H2O, A4"),
                ("listmarkers", "Only the numbering at the start of a line"),
            ]},
            {"kind": "select", "opt": "replaceWith", "label": "Replace each removed number with", "options": [
                ("nothing", "Nothing"),
                ("space", "A space"),
            ]},
            {"kind": "check", "opt": "currency", "label": "Also remove currency symbols and percent signs", "checked": False},
        ],
        "sample": (
            "1. Export the mp3 files from the 2024 archive.\n"
            "2. Check the H2O readings against the 3.5 litre baseline.\n"
            "3. Invoice 4471 came to €1,240.00, up 12% on Q3.\n"
            "\n"
            "Contact: +44 20 7946 0958, ref A4-77.\n"
        ),
        "about_heading": "Three different things people mean by “remove numbers”",
        "about": [
            "The mode select is here because the request is ambiguous and getting it wrong is destructive. <strong>Every digit</strong> is the literal reading: every 0–9 in the text goes, wherever it sits. That is what you want for a raw frequency count or when the digits are noise from an OCR pass, and it is also what turns mp3 into mp and H2O into HO, so it is not the default reading for prose.",
            "<strong>Whole numbers only</strong> is the mode to switch to the moment the text is prose rather than data. It removes a run of digits when the run stands on its own as a token — a year, a quantity, a price, an invoice number — and leaves alone any digit that is welded into a word. mp3, H2O, A4, MP4, IPv6 and Windows 11 all come through intact. The boundary test looks at the character on each side, so <code>3.5kg</code> is treated as a word rather than as the number 3.5, and a trailing full stop is handed back to the sentence rather than swallowed with the number.",
            "<strong>Only the numbering at the start of a line</strong> is the narrow one, and it solves a specific annoyance: a numbered list copied out of a PDF, a Word document or a web page arrives as literal text, so every line starts with <code>1.</code>, <code>2)</code> or <code>(3)</code> and pasting it into an editor that does its own numbering gives you two sets. This mode strips exactly that prefix and touches nothing else on the line — the dates, prices and quantities in the body of the list survive.",
            "The currency checkbox is off by default because £, €, $ and % are not digits and this page is about digits, but removing 1,240 from “€1,240.00” already leaves a bare € behind. Ticking it clears those up too. Numbers written as words — “twenty”, “third”, “half” — are not touched by any mode; recognising those is a language problem rather than a character problem, and pretending otherwise would quietly delete the wrong words.",
        ],
        "example": (
            "A numbered list pasted out of a PDF",
            "1. Export the mp3 files from the 2024 archive.\n2. Check the H2O readings.",
            "Whole numbers only:\n. Export the mp3 files from the  archive.\n. Check the H2O readings.\n\nOnly the line numbering:\nExport the mp3 files from the 2024 archive.\nCheck the H2O readings.",
        ),
        "faq": [
            ("How do I strip years and prices but keep mp3 and H2O?",
             "Use “whole numbers only”. A run of digits is removed when nothing but a letter-free boundary sits on either side of it, so a year, a quantity and an invoice number all go while any digit attached to letters stays put. That covers mp3, H2O, A4, MP4, Windows 11 and IPv6 without a list of exceptions, and it also leaves 3.5kg alone because the letters immediately after it make it a word rather than a number."),
            ("Can I remove the 1. 2. 3. from a list without touching the rest?",
             "Yes, that is the third mode. It matches only a leading number with its dot, bracket or colon and the whitespace after it, once per line, at the start of the line. Everything else on the line is untouched, so a list of dated entries keeps its dates. It handles “1.”, “2)”, “(3)” and “4:”, with or without leading indentation."),
            ("Does it remove numbers written as words?",
             "No. “Twenty”, “third” and “dozen” are ordinary words and stay exactly where they are. Detecting them reliably needs language rules rather than character rules — “one” is a number in “one box” and a pronoun in “the blue one” — and a tool that guessed would silently delete words you meant to keep."),
        ],
        "also_on": [],
        "related": [
            ("/find-and-replace", "Find &amp; Replace", "for a numeric pattern this page does not cover, with a live match count."),
            ("/sort-and-dedupe-lines", "Sort &amp; Dedupe", "tidy the list once the numbering is off it."),
            ("/text-statistics", "Text Statistics", "check what the text looks like after the digits are gone."),
        ],
    },
    # ------------------------------------------------------------------ emoji
    {
        "id": "emoji",
        "slug": "remove-emojis",
        "h1": "Remove Emojis",
        "nav": "Emoji",
        "title": "Remove Emojis from Text Online — Free Tool",
        "description": "Strip emoji out of pasted text, including skin tones, flags, keycaps and the multi-person sequences that a naive filter leaves broken. Free, instant, nothing uploaded.",
        "tagline": "Strip emoji out of a chat log or a caption — whole, including the flags, keycaps, skin tones and family sequences that a naive filter tears in half.",
        "controls": [
            {"kind": "select", "opt": "replaceWith", "label": "Replace each emoji with", "options": [
                ("nothing", "Nothing"),
                ("space", "A space"),
            ]},
            {"kind": "check", "opt": "keepTextSymbols", "label": "Keep © ® ™ ❤ and other text-style symbols", "checked": True},
            {"kind": "check", "opt": "symbols", "label": "Also remove dingbats and other symbols (✓ ➜ ⚑)", "checked": False},
        ],
        "sample": (
            "Thanks so much \U0001f64f\U0001f3fd the launch went great \U0001f680\U0001f389\n"
            "Team photo from Friday \U0001f468‍\U0001f469‍\U0001f467 — we shipped in \U0001f1ec\U0001f1e7 and \U0001f1ef\U0001f1f5 \U0001f30d\n"
            "Rank 1️⃣ two weeks running \U0001f4c8✅ © 2024 Acme\n"
        ),
        "about_heading": "An emoji is a cluster, not a character",
        "about": [
            "This is why the regex you found on Stack Overflow leaves a mess behind. A single emoji on screen is very often several codepoints glued together. \U0001f44d\U0001f3fd is a thumbs-up followed by a skin-tone modifier. \U0001f468‍\U0001f469‍\U0001f467 is three people joined by two zero-width joiners. \U0001f1ec\U0001f1e7 is a pair of regional indicator letters, G and B, that a font draws as one flag. 1️⃣ is the digit one, a variation selector and a combining keycap. Delete these one codepoint at a time and you get orphaned joiners, a lone skin tone, half a flag rendering as two letters, and a stray digit where a keycap used to be.",
            "The matcher on this page removes the whole cluster in one go. It is built around Unicode's <strong>Extended_Pictographic</strong> property — the property that actually means “this is an emoji-ish character”, rather than a hand-maintained list of ranges that goes out of date every September — plus the grammar around it: optional variation selector, optional skin tone, any number of joined sequences, regional indicator pairs, and keycaps. Anything left over, such as a joiner or a variation selector stranded by an earlier edit, is swept up too, because those render as nothing at all and still break string comparison.",
            "The first checkbox exists because Extended_Pictographic is broader than the emoji keyboard. ©, ®, ™, ❗, ℹ and a stack of arrows and shapes are in it, but in running prose they are ordinary typography, and deleting the © off a footer line is not what anyone asked for. With <strong>keep text-style symbols</strong> on, those characters survive when they appear on their own, and are still removed when they carry the emoji presentation selector that turns them into a coloured glyph.",
            "The second checkbox goes the other way. ✓, ➜, ⚑ and the rest of the dingbats are Unicode symbols rather than pictographs, so they are left alone by default. Tick it when you are cleaning a document where the check marks and arrows are decoration rather than content. Everything runs in your browser — a chat export or a customer message is not uploaded anywhere.",
        ],
        "example": (
            "A message copied out of a chat app",
            "Team photo from Friday \U0001f468‍\U0001f469‍\U0001f467 — we shipped in \U0001f1ec\U0001f1e7 © 2024",
            "Default settings:\nTeam photo from Friday  — we shipped in  © 2024\n(the family goes as one unit, the flag as one unit, the © stays)",
        ),
        "faq": [
            ("Why did the whole flag disappear rather than half of it?",
             "Because a flag is two regional indicator characters and the matcher takes them as a pair. \U0001f1ec\U0001f1e7 is the letters G and B in a special alphabet that fonts draw as a single flag glyph. A filter working one codepoint at a time removes one of them and leaves the other, which then renders as a lone boxed letter. The same reasoning covers family and profession emoji, which are several people joined by zero-width joiners."),
            ("Does it remove ©, ® and ™?",
             "Not by default. Those characters carry Unicode's Extended_Pictographic property, so a strict emoji filter does take them, but in ordinary text they are typography rather than emoji and removing them from a copyright line is almost never the intent. The “keep text-style symbols” checkbox protects them when they stand alone, while still removing the emoji-presentation versions. Untick it if you want a strictly pictograph-free result."),
            ("What about check marks and arrows like ✓ and ➜?",
             "They stay unless you tick “also remove dingbats and other symbols”. Those characters are Unicode symbols, not pictographs — they predate emoji, they are usually monochrome, and they turn up in bullet lists and documentation as content rather than decoration. Keeping them separate means you can strip a chat log of emoji without flattening a spec document's checklists."),
        ],
        "also_on": [],
        "related": [
            ("/remove-special-characters", "Remove Special Characters", "for symbols and box drawing rather than emoji."),
            ("/word-counter", "Word Counter", "count the message once the emoji are out."),
            ("/text-statistics", "Text Statistics", "readability scores on the plain-text version."),
        ],
    },
    # -------------------------------------------------------------- html tags
    {
        "id": "html-tags",
        "slug": "remove-html-tags",
        "h1": "Remove HTML Tags",
        "nav": "HTML tags",
        "title": "Remove HTML Tags from Text Online — Free HTML to Text",
        "description": "Strip HTML tags and get the plain text back, with script and style bodies dropped, entities decoded and the line structure of the page preserved. Nothing uploaded.",
        "tagline": "Strip the markup and keep the words — script and style bodies dropped, entities decoded, and the paragraph structure of the page still readable.",
        "controls": [
            {"kind": "check", "opt": "blockBreaks", "label": "Keep line structure (paragraphs, list items, headings)", "checked": True},
            {"kind": "check", "opt": "dropScripts", "label": "Drop the contents of &lt;script&gt;, &lt;style&gt; and &lt;template&gt;", "checked": True},
            {"kind": "check", "opt": "dropComments", "label": "Drop HTML comments", "checked": True},
            {"kind": "check", "opt": "decodeEntities", "label": "Decode entities (&amp;amp; &amp;nbsp; &amp;#8217;)", "checked": True},
            {"kind": "check", "opt": "tidy", "label": "Tidy the whitespace afterwards", "checked": True},
        ],
        "sample": (
            "<!-- hero -->\n"
            "<div class=\"card\">\n"
            "  <h2 id=\"title\">Q3 results &amp; outlook</h2>\n"
            "  <p>Revenue rose <strong>12%</strong> year&nbsp;on&nbsp;year, driven by the\n"
            "     <a href=\"/emea\" title=\"EMEA\">EMEA</a> region.</p>\n"
            "  <ul><li>North &ndash; steady</li><li>South &ndash; up 4%</li></ul>\n"
            "</div>\n"
            "<script>window.dataLayer.push({event:'view'});</script>\n"
        ),
        "about_heading": "Stripping the markup without stripping the meaning",
        "about": [
            "Pasting HTML into a plain-text field and deleting everything between angle brackets by hand produces something readable about half the time. The failures are consistent: the body of a <code>&lt;script&gt;</code> block is not markup, so removing the tags around it leaves a line of JavaScript sitting in the middle of the prose. Entities like <code>&amp;amp;</code>, <code>&amp;nbsp;</code> and <code>&amp;#8217;</code> are not tags, so they survive the pass and show up literally. And every paragraph, heading and list item runs into the next one, because the line breaks in an HTML document live in the tags rather than in the text.",
            "Each of those is a checkbox here. <strong>Keep line structure</strong> turns the closing edge of a block element — <code>&lt;/p&gt;</code>, <code>&lt;/li&gt;</code>, <code>&lt;/h2&gt;</code>, <code>&lt;/tr&gt;</code> — and the two self-contained breaks, <code>&lt;br&gt;</code> and <code>&lt;hr&gt;</code>, into a newline, while inline elements like <code>&lt;strong&gt;</code> and <code>&lt;a&gt;</code> vanish without leaving a seam. That is the difference between a readable list and one long run-on line. <strong>Drop script and style</strong> removes those elements including their contents. <strong>Decode entities</strong> converts the named, decimal and hexadecimal forms back to the characters they stand for.",
            "The tidy pass at the end collapses the runs of spaces and blank lines that the source indentation leaves behind, which is almost always what you want, since HTML source is indented for the developer rather than for the reader. Switch it off if you are extracting from a <code>&lt;pre&gt;</code> block where the spacing is content.",
            "Nothing here renders the HTML. The text you paste is treated as a string and processed with pattern matching, never inserted into the page, so pasting markup from an untrusted source cannot execute anything — and, like every tool on this site, it never leaves your browser.",
        ],
        "example": (
            "A card copied out of page source",
            "<p>Revenue rose <strong>12%</strong> year&nbsp;on&nbsp;year.</p>\n<ul><li>North &ndash; steady</li></ul>",
            "Default settings:\nRevenue rose 12% year on year.\nNorth – steady",
        ),
        "faq": [
            ("Will pasting a page with JavaScript in it run anything?",
             "No. What you paste is handled as text from the first character to the last — it is matched against patterns and never written into the document, so there is no point at which a browser could parse it as markup or execute it. The contents of script, style, noscript and template elements are removed outright by default, so they do not end up in the output either."),
            ("What happens to &amp;amp;, &amp;nbsp; and &amp;#8217;?",
             "With the decode option on they become &, a space and ’ respectively. Entities are not tags, so a strip-the-angle-brackets pass leaves them behind as literal text, which is the most common reason a stripped page still looks wrong. Named entities, decimal references and hexadecimal references are all handled. Turn the option off if you are working on the markup itself and want the source form preserved."),
            ("Why is my list all on one line?",
             "Because the line-structure option is off. HTML has no line breaks of its own — the visual layout comes from the block elements — so removing the tags without translating them collapses everything into a single paragraph. With the option on, the closing tag of each block element becomes a newline, so paragraphs, headings, list items and table rows each land on their own line."),
        ],
        "also_on": [],
        "related": [
            ("/markdown-to-html", "Markdown ↔ HTML", "convert between the two rather than flattening one of them."),
            ("/remove-extra-spaces", "Remove Extra Spaces", "if you turned the tidy pass off and want it separately."),
            ("/find-and-replace", "Find &amp; Replace", "for surgical edits to the markup with a regular expression."),
        ],
    },
    # ---------------------------------------------------------------- accents
    {
        "id": "accents",
        "slug": "remove-accents",
        "h1": "Remove Accents",
        "nav": "Accents",
        "title": "Remove Accents and Diacritics from Text — Free Tool",
        "description": "Turn é ü ñ å č into plain letters, with ß æ ø ł đ handled by name rather than deleted. Keeps other scripts, or folds everything to ASCII — your choice.",
        "tagline": "Turn café into cafe and Björk into Bjork — including the letters that Unicode refuses to decompose, like ß, ø and ł.",
        "controls": [
            {"kind": "select", "opt": "mode", "label": "How far to go", "options": [
                ("fold", "Fold accented Latin letters, leave other scripts alone"),
                ("marks", "Drop the accent marks only, keep every script"),
                ("ascii", "Fold, then delete anything still outside ASCII"),
            ]},
            {"kind": "check", "opt": "transliterate", "label": "Spell out ß æ œ ø đ þ ł by name", "checked": True},
            {"kind": "select", "opt": "replaceWith", "label": "In ASCII mode, replace what is left with", "options": [
                ("nothing", "Nothing"),
                ("space", "A space"),
            ]},
        ],
        "sample": (
            "Résumé for Björk Guðmundsdóttir, naïve about coöperation.\n"
            "Señor Álvarez met François at the Straße café in Kraków.\n"
            "Đặng Thị Hương — Łódź — Živko Čermák — 你好\n"
        ),
        "about_heading": "Why NFKD alone is not enough",
        "about": [
            "The standard trick for this is one line long: normalise to NFD or NFKD, then delete every combining mark. Unicode stores é as either a single precomposed character or as an <code>e</code> followed by a combining acute accent, and normalising picks the second form so the accent can be deleted separately. That handles é, ü, ñ, å, č, ệ and the great majority of accented Latin letters, including the stacked diacritics in Vietnamese.",
            "It also silently destroys a specific set of letters, which is the part the one-liner never mentions. <strong>ß, æ, œ, ø, đ, ð, þ, ł, ħ, ŋ</strong> and ı are not a base letter plus a mark — they are letters in their own right, with no decomposition at all. NFKD leaves them exactly as they were, and the ASCII pass that follows then deletes them, so Straße becomes Strae, Łódź becomes ódź and Guðmundsdóttir loses a consonant. With the spell-out option on, this page maps each of them to the letters they are conventionally written as — ß to ss, æ to ae, ø to o, ł to l — which is the same map the site's slugify tool uses.",
            "The mode select decides how far the pass reaches. <strong>Fold accented Latin letters</strong> is the default: accents come off, and anything that is not a Latin letter — Greek, Cyrillic, Arabic, Chinese — is left exactly as it was. <strong>Drop the accent marks only</strong> is the gentler version, useful for Greek or Cyrillic text where you want the diacritics gone but the script kept; it uses NFD rather than NFKD so ½ stays ½ and the ﬁ ligature stays a ligature instead of being taken apart. <strong>Fold then delete everything outside ASCII</strong> is the strict one, for a system that genuinely cannot store anything else.",
            "This is the right tool when a name has to match across two systems, when a URL or a filename needs to be portable, or when a search index does not fold accents itself and “señor” and “senor” have to find each other. It is the wrong tool for changing how a name is displayed to the person it belongs to.",
        ],
        "example": (
            "A name list going into a legacy system",
            "Björk Guðmundsdóttir, François, Straße, Łódź, 你好",
            "Fold, spelling out the undecomposable letters:\nBjork Gudmundsdottir, Francois, Strasse, Lodz, 你好\n\nThe same line in ASCII mode drops 你好 as well.",
        ),
        "faq": [
            ("Why does ß become “ss” rather than “s”?",
             "Because that is how German writes it when the character is not available — Straße has always been Strasse in ASCII, and the capital form has historically been SS. ß has no Unicode decomposition, so a normalise-and-strip pass cannot produce anything sensible from it and an ASCII filter simply deletes it. Spelling it out by name is the only answer that keeps the word recognisable, and the same applies to æ → ae, œ → oe, ø → o, đ → d, þ → th and ł → l."),
            ("Does it handle Vietnamese, Polish and Czech?",
             "Yes, and they exercise different parts of it. Vietnamese stacks two marks on one letter — ệ is e with a circumflex and a dot below — and normalisation separates both, so it folds to e. Czech č š ž and Polish ą ę ć ń ś ź ż are ordinary base-plus-mark characters and fold cleanly. Polish ł is the exception in that set, since it is a barred l with no decomposition, and it is in the spell-out map for exactly that reason."),
            ("What is the difference between the three modes?",
             "“Fold” takes the accents off Latin letters and leaves every other script untouched, which is what most people want. “Marks only” removes combining marks from any script without folding anything — useful for stripping Greek or Hebrew diacritics — and avoids compatibility decomposition, so ½ and ligatures survive. “ASCII” folds first and then deletes anything still outside the ASCII range, which is destructive for non-Latin text and is meant for systems that cannot store it at all."),
        ],
        "also_on": [],
        "related": [
            ("/slugify", "Slugify", "the same folding, plus separators and a length limit, for URLs."),
            ("/remove-special-characters", "Remove Special Characters", "when symbols rather than accents are the problem."),
            ("/case-converter", "Case Converter", "normalise the casing once the accents are gone."),
        ],
    },
]

BY_ID = {p["id"]: p for p in PAGES}
