"""textkitpro.com navigation data — the single source of truth for the toolbar.

This is the ONLY file that differs between sites. `sync_nav.py` is generic and
copies verbatim. Nothing here is computed at runtime by the browser: sync_nav
renders it into the static HTML of every page.

Tier rule (portfolio spec, ngineer420.github.io#13): a page is tier 1 only if it
answers a *different question*. All thirteen do. The seven generated
/remove-… pages are tier 2 — the same cleaner engine with one transform
preselected — so they stay out of this list entirely and reach the chrome
through the single HUBS line below.

Rail is the first eight in traffic order; the renderer's cap is eight and the
spec's errata makes that cap win over any per-site request for more, so Slugify,
Text Statistics, Remove Line Breaks and Reverse Text are sheet-only. New tools
join at the end of the list because the order is *measured* traffic, not
expected traffic — a page with no impressions yet has not earned a rail slot.
At thirteen destinations the sheet renders as named groups rather than one flat
list — also the renderer's rule, at 9+.

hrefs are the clean extensionless paths the site already publishes in its
canonicals, sitemap and in-body lists.
"""

# Noun used in the menu trigger: "All 19 tools".
NOUN = "tools"

# Tier-1 tools, in traffic order. The first eight are the rail.
#   label -> rail chip text, <= 18 chars
#   long  -> anchor text in the sheet, matching each page's own <h1>
#   group -> sheet grouping key
TOOLS = [
    # --- the rail (first eight) ---
    {"href": "/word-counter",          "label": "Word Counter",    "long": "Word Counter",              "group": "measure",  "tier": 1},
    {"href": "/case-converter",        "label": "Case Converter",  "long": "Case Converter",            "group": "cleanup",  "tier": 1},
    {"href": "/lorem-ipsum-generator", "label": "Lorem Ipsum",     "long": "Lorem Ipsum Generator",     "group": "convert",  "tier": 1},
    {"href": "/diff-checker",          "label": "Diff Checker",    "long": "Diff Checker",              "group": "measure",  "tier": 1},
    {"href": "/find-and-replace",      "label": "Find & Replace",  "long": "Find and Replace",          "group": "cleanup",  "tier": 1},
    {"href": "/sort-and-dedupe-lines", "label": "Sort & Dedupe",   "long": "Sort and Dedupe Lines",     "group": "cleanup",  "tier": 1},
    {"href": "/markdown-to-html",      "label": "Markdown ↔ HTML", "long": "Markdown ↔ HTML Converter", "group": "convert",  "tier": 1},
    {"href": "/csv-to-json",           "label": "CSV ↔ JSON",      "long": "CSV ↔ JSON Converter",      "group": "convert",  "tier": 1},
    # --- sheet only ---
    {"href": "/slugify",               "label": "Slugify",         "long": "Slugify",                   "group": "cleanup",  "tier": 1},
    {"href": "/text-statistics",       "label": "Text Statistics", "long": "Text Statistics",           "group": "measure",  "tier": 1},
    {"href": "/remove-line-breaks",     "label": "Remove Breaks",   "long": "Remove Line Breaks",        "group": "cleanup",  "tier": 1},
    {"href": "/reverse-text",           "label": "Reverse Text",    "long": "Reverse Text",              "group": "convert",  "tier": 1},
    {"href": "/text-cleaner",           "label": "Text Cleaner",    "long": "Text Cleaner",              "group": "cleanup",  "tier": 1},
    # --- the translator family, added together and therefore ranked together ---
    # Six tools, one engine in assets/js/codecs.js, six different questions:
    # nobody searching "nato phonetic alphabet" would accept a Caesar cipher.
    # All six land sheet-only, which is the rail cap doing its job rather than
    # a slight: a page published today has no measured traffic to have earned a
    # chip with, and the rail is measured traffic.
    {"href": "/morse-code-translator",  "label": "Morse Code",      "long": "Morse Code Translator",     "group": "translate", "tier": 1},
    {"href": "/text-to-binary",         "label": "Text to Binary",  "long": "Text to Binary",            "group": "translate", "tier": 1},
    {"href": "/binary-to-text",         "label": "Binary to Text",  "long": "Binary to Text",            "group": "translate", "tier": 1},
    {"href": "/caesar-cipher",          "label": "Caesar Cipher",   "long": "Caesar Cipher",             "group": "translate", "tier": 1},
    {"href": "/rot13",                  "label": "ROT13",           "long": "ROT13",                     "group": "translate", "tier": 1},
    {"href": "/nato-phonetic-alphabet", "label": "NATO Phonetic",   "long": "NATO Phonetic Alphabet",    "group": "translate", "tier": 1},
]

# Sheet groups, in order: (key, label). Named for what a visitor came to do,
# not for how the tools are built.
GROUPS = [
    ("measure", "Count & compare"),
    ("cleanup", "Clean up text"),
    ("convert", "Convert & generate"),
    ("translate", "Encode & translate"),
]

# /text-cleaner is the combined tool AND the hub for the seven generated
# single-transform pages (/remove-punctuation, /remove-emojis and the rest).
# Those are tier 2 — one parameter of the same engine — so the chrome gives the
# family exactly one link, and this is it. The anchor text is the family, not
# the tool, because the tool already has its own line in the "Clean up text"
# group above and a second identical label would be a duplicate rather than a
# second way in.
HUBS = [
    ("/text-cleaner", "Remove spaces, punctuation, emoji, HTML"),
]

# The rail plus the sheet carry all nineteen tools on every page, and each tool page
# keeps a short "More text tools" block of three related siblings, so a footer
# duplicate would be boilerplate rather than a new crawl surface.
FOOTER = []

# One-time --migrate: what the legacy markup looked like and where the marker
# pair goes. Per-site, because the legacy markup is per-site. Ops run in order.
MIGRATE = [
    # The homepage's role="tablist" strip. Its tabindex="-1" took nine of ten
    # links out of tab order and announced navigation as tabs.
    {"op": "strip", "pattern": r'\n  <nav role="tablist" class="tabbar".*?\n  </nav>\n'},
    # The same ten links again inside <main> on each standalone tool page.
    {"op": "strip", "pattern": r'\n  <nav class="tabbar" aria-label="Text tools">.*?\n  </nav>\n'},
    # The toolbar is a direct child of <body>, immediately after </header>, so
    # it lands above the hero card rather than below it.
    {"op": "insert_after", "region": "nav", "pattern": r"</header>", "indent": ""},
    # The header and the footer, last: the nav op above anchors on </header>,
    # so the header must still be markup when that op runs.
    {"op": "replace", "region": "header",
     "pattern": r'<header class="site-header">.*?</header>'},
    {"op": "replace", "region": "footer",
     "pattern": r'<footer class="site-footer">.*?</footer>'},
]

# --------------------------------------------------------------------------
# Site chrome: the header and the footer.
#
# Both were hand-copied into every page. The header drifted into three
# variants and the footer into five, and privacy.html lost the theme toggle
# that way. sync_nav now renders both from the data below, between
# `<!-- header:start -->` and `<!-- footer:start -->` marker pairs, so there is
# one definition of each in the repo.
# --------------------------------------------------------------------------

# The brand lock-up. `inner` is raw markup because a wordmark is a shape, not a
# string: the site decides what goes inside the link and sync_nav only places
# it. Lines are re-indented to match the marker.
BRAND = {
    "href": "/",
    "aria": "TextKit Pro home",
    "inner": (
        '<span class="brand-mark">\n'
        '  <img src="/assets/favicon.svg" alt="" width="24" height="24">\n'
        '  TextKit <span class="pro-badge">Pro</span>\n'
        "</span>"
    ),
}

# Controls on the right of the header. The theme toggle is the reconciled
# variant: every page gets it, which is what privacy.html and terms.html and
# the four articles were missing.
HEADER_ACTIONS = [
    '<button id="theme-toggle" class="icon-btn" type="button"'
    ' aria-label="Toggle dark/light theme" title="Toggle theme">&#9680;</button>',
]

# Footer line one: the copyright owner and the policy links.
FOOTER_OWNER = "textkitpro.com"
FOOTER_LINKS = [
    ("/", "Home"),
    ("/privacy.html", "Privacy"),
    ("/terms.html", "Terms"),
]

# Footer line two: sibling sites, for visitors who want a neighbouring tool.
# Four, not nineteen. A block of nineteen links reads as a link farm, and a
# visitor who came for a word count wants a notepad or a developer tool, not a
# controller test. The erabb.it mark keeps its own place below the footer.
PEERS_LABEL = "More tools from the same workshop"
PEERS = [
    ("https://devboxkit.com", "DevBox Kit",
     "JSON, Base64, hashes, UUIDs and WCAG contrast, for developers."),
    ("https://blanknotepad.com", "Blank Notepad",
     "A distraction-free notepad that saves in the browser as you type."),
    ("https://inascii.com", "InASCII",
     "Turn text or a picture into ASCII art."),
    ("https://qrmint.net", "QR Mint",
     "QR codes for a link, a Wi-Fi network or a contact card."),
]
