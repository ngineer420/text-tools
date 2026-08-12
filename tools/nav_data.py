"""textkitpro.com navigation data — the single source of truth for the toolbar.

This is the ONLY file that differs between sites. `sync_nav.py` is generic and
copies verbatim. Nothing here is computed at runtime by the browser: sync_nav
renders it into the static HTML of every page.

Tier rule (portfolio spec, ngineer420.github.io#13): a page is tier 1 only if it
answers a *different question*. All ten do — there is no preset family on this
site, so no tier 2, no hub row and no in-panel sibling chips.

Rail is the first eight in traffic order; the renderer's cap is eight and the
spec's errata makes that cap win over any per-site request for more, so Slugify
and Text Statistics are sheet-only. At ten destinations the sheet renders as
named groups rather than one flat list — also the renderer's rule, at 9+.

hrefs are the clean extensionless paths the site already publishes in its
canonicals, sitemap and in-body lists.
"""

# Noun used in the menu trigger: "All 10 tools".
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
]

# Sheet groups, in order: (key, label). Named for what a visitor came to do,
# not for how the tools are built.
GROUPS = [
    ("measure", "Count & compare"),
    ("cleanup", "Clean up text"),
    ("convert", "Convert & generate"),
]

# No preset family on this site: every tool answers a different question.
HUBS = []

# The rail plus the sheet carry all ten tools on every page, and each tool page
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
]
