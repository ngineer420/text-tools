#!/usr/bin/env python3
"""Generate the "remove X from text" landing pages, and rewrite sitemap.xml.

textkitpro had no generator at all until this file: every page was a hand copy
of its neighbour, so a change to the chrome meant editing thirteen files and a
new page in a family meant duplicating three hundred lines. This is fontloom's
`tools/build_style_pages.py` ported to a site whose pages are flat `.html`
files at the repo root rather than directories.

    python3 tools/build_cleaner_pages.py            # regenerate everything
    python3 tools/build_cleaner_pages.py --check    # fail if anything is stale

What it writes, all under the repo root:

    <slug>.html      one per entry in tools/cleaner_pages.py PAGES
    sitemap.xml      rebuilt from the page list

NOTHING ELSE MAY WRITE THOSE FILES — a generated page edited by hand is
overwritten without warning on the next run, which is what `--check` exists to
catch in review rather than afterwards.

`/text-cleaner` is deliberately NOT generated. It is the head term and the full
combined tool, so it is hand-written and only appears here in the sitemap and
in the cross-links; the seven children carry a self-referencing canonical and
never point at it.

The toolbar comes from `sync_nav.render_nav`, the same renderer the
hand-written pages use, between the same `<!-- nav:start -->` markers, so
`python3 tools/sync_nav.py --check` covers generated and hand-written pages
alike and there is exactly one definition of the navigation in the repo.

Standard library only, no build step, Python 3.8+.
"""

import argparse
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import cleaner_pages as C  # noqa: E402
import nav_data as NAV  # noqa: E402
import sync_nav  # noqa: E402

SITE = "https://textkitpro.com"

# Byte-for-byte the tag the hand-written pages already carry. Auto ads only:
# there are no ad slots anywhere in this repo and none are to be added.
ADSENSE = ('<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
           '?client=ca-pub-7560786263587509" crossorigin="anonymous"></script>')

ERABBIT = ('<a href="https://erabb.it" class="erabbit-mark" aria-label="erabb.it">'
           '<img src="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 '
           'viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>\U0001f407</text></svg>" '
           'width="10" height="10" alt=""></a>')

GENERATED_WARNING = (
    "<!-- GENERATED FILE - do not edit by hand.\n"
    "     Written by tools/build_cleaner_pages.py from tools/cleaner_pages.py.\n"
    "     Any edit here is lost on the next build, and\n"
    "     `python3 tools/build_cleaner_pages.py --check` fails while one exists. -->"
)

# Pages this builder does not write, in the order the sitemap should list them.
# It owns sitemap.xml outright, so it has to know about all of them.
STATIC_URLS = [
    ("/", "weekly", "1.0"),
    ("/word-counter", "monthly", "0.8"),
    ("/case-converter", "monthly", "0.8"),
    ("/lorem-ipsum-generator", "monthly", "0.8"),
    ("/diff-checker", "monthly", "0.8"),
    ("/find-and-replace", "monthly", "0.8"),
    ("/sort-and-dedupe-lines", "monthly", "0.8"),
    ("/markdown-to-html", "monthly", "0.8"),
    ("/csv-to-json", "monthly", "0.8"),
    ("/slugify", "monthly", "0.8"),
    ("/text-statistics", "monthly", "0.8"),
    ("/remove-line-breaks", "monthly", "0.8"),
    ("/reverse-text", "monthly", "0.8"),
    ("/text-cleaner", "weekly", "0.9"),
    # The translator family. Written by tools/build_codec_pages.py, listed here
    # because sitemap.xml has exactly one owner and this is it — that builder
    # asserts these six rows still exist rather than writing a second copy.
    ("/morse-code-translator", "monthly", "0.8"),
    ("/text-to-binary", "monthly", "0.8"),
    ("/binary-to-text", "monthly", "0.8"),
    ("/caesar-cipher", "monthly", "0.8"),
    ("/rot13", "monthly", "0.8"),
    ("/nato-phonetic-alphabet", "monthly", "0.8"),
]

ARTICLE_URLS = [
    "/articles/word-count-guide.html",
    "/articles/text-case-styles-explained.html",
    "/articles/reading-time-and-readability.html",
    "/articles/how-this-tool-works.html",
]

TAIL_URLS = [("/privacy.html", "yearly", "0.2"), ("/terms.html", "yearly", "0.2")]


def esc(s):
    return html.escape(s, quote=True)


def plain(fragment):
    """HTML fragment -> the text a JSON-LD field wants.

    The copy file writes real markup, because a paragraph that cannot carry a
    <strong> or a link reads like a text file. Schema.org wants the same
    sentence without it.
    """
    text = re.sub(r"<[^>]+>", "", fragment)
    return html.unescape(text)


# --------------------------------------------------------------------------
# Page chrome
# --------------------------------------------------------------------------

def head(page):
    url = "%s/%s" % (SITE, page["slug"])
    title = "%s | TextKit Pro" % page["title"]
    desc = page["description"]
    ld_app = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "%s — TextKit Pro" % page["h1"],
        "url": url,
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
        "description": plain(desc),
    }
    ld_faq = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {"@type": "Question", "name": plain(q),
             "acceptedAnswer": {"@type": "Answer", "text": plain(a)}}
            for q, a in page["faq"]
        ],
    }
    blocks = "\n\n".join(
        '<script type="application/ld+json">\n%s\n</script>'
        % json.dumps(b, indent=2, ensure_ascii=False)
        for b in (ld_app, ld_faq)
    )
    return """<!doctype html>
<html lang="en">
{warning}
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#14131d">

<meta property="og:type" content="website">
<meta property="og:title" content="{h1} Online">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{h1} Online">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/assets/og-image.png">

<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/styles.css">

{ld}

{ads}
</head>
""".format(warning=GENERATED_WARNING, title=esc(title), desc=esc(plain(desc)),
           url=url, site=SITE, h1=esc(page["h1"]), ld=blocks, ads=ADSENSE)


def header(slug):
    return """<body>
<a class="skip-link" href="#main">Skip to content</a>

<!-- header:start -->
{header}
<!-- header:end -->

<!-- nav:start -->
{nav}
<!-- nav:end -->
""".format(header=sync_nav.render_header("/" + slug), nav=sync_nav.render_nav("/" + slug))


def footer(slug):
    return """
<!-- footer:start -->
{footer}
<!-- footer:end -->

<script src="/assets/js/app.js"></script>
<script src="/assets/js/cleaner-page.js"></script>
{erabbit}
</body>
</html>
""".format(footer=sync_nav.render_footer("/" + slug), erabbit=ERABBIT)


# --------------------------------------------------------------------------
# The tool
# --------------------------------------------------------------------------

def control_html(control):
    """One option control, from the schema in tools/cleaner_pages.py.

    `data-opt` is read straight back by readCleanerOptions() in app.js, so a
    new option is a data-file edit and nothing else.
    """
    if control["kind"] == "select":
        opts = "\n".join(
            '            <option value="%s">%s</option>' % (value, label)
            for value, label in control["options"]
        )
        return ("""        <div class="field" style="margin-bottom:0;">
          <label for="cl-opt-{opt}">{label}</label>
          <select id="cl-opt-{opt}" data-opt="{opt}">
{opts}
          </select>
        </div>""").format(opt=control["opt"], label=control["label"], opts=opts)
    checked = " checked" if control.get("checked") else ""
    return ('        <label class="check"><input type="checkbox" '
            'id="cl-opt-%s" data-opt="%s"%s> %s</label>'
            % (control["opt"], control["opt"], checked, control["label"]))


def tool_section(page):
    selects = [c for c in page["controls"] if c["kind"] == "select"]
    checks = [c for c in page["controls"] if c["kind"] == "check"]

    parts = ['  <section aria-label="%s tool">' % esc(page["h1"]),
             '    <div class="panel" id="cl-primary">',
             '      <h2>Options</h2>']
    if selects:
        grid = "tool-grid tool-grid--split" if len(selects) == 2 else "tool-grid tool-grid--three"
        parts.append('      <div class="%s">' % grid)
        parts += [control_html(c) for c in selects]
        parts.append("      </div>")
    if checks:
        parts.append('      <div class="check-grid"%s>'
                     % (' style="margin-top:14px;"' if selects else ""))
        parts += [control_html(c) for c in checks]
        parts.append("      </div>")
    parts.append("    </div>")

    # The "also do" stack. Every other cleaner in the registry, in the order
    # the pipeline runs them, so ticking two of them here gives the same result
    # as ticking two of them on /text-cleaner.
    others = [p for p in C.PAGES if p["id"] != page["id"]]
    order = {cid: i for i, cid in enumerate(
        ["html-tags", "emoji", "accents", "numbers", "punctuation", "special-chars", "extra-spaces"])}
    others.sort(key=lambda p: order[p["id"]])
    parts += ['    <div class="panel" id="cl-also">',
              '      <h2>Also clean up</h2>',
              '      <div class="check-grid">']
    for other in others:
        checked = " checked" if other["id"] in page.get("also_on", []) else ""
        parts.append('        <label class="check"><input type="checkbox" data-also="%s"%s> %s</label>'
                     % (other["id"], checked, esc(other["nav"])))
    parts += ["      </div>",
              '      <p class="hint">Each of these runs the same code as its own page. '
              'The full set, all switched on at once, is <a href="/text-cleaner">the text cleaner</a>.</p>',
              "    </div>"]

    parts += ['    <div class="tool-grid tool-grid--split" style="margin-top:16px;">',
              '      <div class="panel">',
              '        <h2>Input</h2>',
              '        <div class="field" style="margin-bottom:0;">',
              '          <label for="cl-input" class="visually-hidden">Text to clean</label>',
              '          <textarea id="cl-input" rows="12" placeholder="Paste your text here...">%s</textarea>'
              % esc(page["sample"].rstrip("\n")),
              "        </div>",
              "      </div>",
              '      <div class="panel">',
              '        <div class="output-toolbar">',
              '          <h2 style="margin:0;">Result</h2>',
              '          <div class="btn-row" style="margin-top:0;">',
              '            <div class="copy-flash-wrap">',
              '              <button type="button" id="cl-copy" class="icon-btn">Copy</button>',
              '              <span class="copy-flash" id="cl-copy-flash">Copied!</span>',
              "            </div>",
              '            <button type="button" id="cl-download" class="icon-btn">Download</button>',
              "          </div>",
              "        </div>",
              '        <div class="field" style="margin-bottom:0;">',
              '          <label for="cl-output" class="visually-hidden">Cleaned text</label>',
              '          <textarea id="cl-output" rows="12" readonly></textarea>',
              "        </div>",
              "      </div>",
              "    </div>",
              '    <p class="hint" id="cl-summary" role="status"></p>']

    parts += ['    <div class="panel" style="margin-top:16px;">',
              '      <h2>Before and after</h2>',
              '      <div class="stat-grid" style="margin-bottom:0;">',
              '        <div class="stat-card"><div class="stat-value" id="cl-before">0</div>'
              '<div class="stat-label">Characters in</div></div>',
              '        <div class="stat-card"><div class="stat-value" id="cl-after">0</div>'
              '<div class="stat-label">Characters out</div></div>',
              '        <div class="stat-card"><div class="stat-value" id="cl-removed">0</div>'
              '<div class="stat-label">Characters removed</div></div>',
              '        <div class="stat-card"><div class="stat-value" id="cl-words">0</div>'
              '<div class="stat-label">Words in &rarr; out</div></div>',
              "      </div>",
              "    </div>",
              "  </section>"]
    return "\n".join(parts)


def prose_section(page):
    label, before, after = page["example"]
    parts = ['  <section class="container-narrow" style="padding-bottom:0;">',
             '    <h2 style="margin-top:0;">%s</h2>' % esc(page["about_heading"])]
    parts += ["    <p>%s</p>" % para for para in page["about"]]
    parts += ['    <h3 class="example-heading">%s</h3>' % esc(label),
              '    <div class="cleaner-example">',
              '      <figure><figcaption>Pasted in</figcaption><pre>%s</pre></figure>' % esc(before),
              '      <figure><figcaption>Comes out</figcaption><pre>%s</pre></figure>' % esc(after),
              "    </div>",
              "  </section>"]
    return "\n".join(parts)


def faq_section(page):
    parts = ['  <section class="container-narrow" style="padding-top:24px;padding-bottom:0;">',
             '    <h2 style="margin-top:0;">%s questions</h2>' % esc(page["h1"].replace("Remove ", ""))]
    for q, a in page["faq"]:
        parts += ['    <div class="faq-item">',
                  "      <h3>%s</h3>" % q,
                  "      <p>%s</p>" % a,
                  "    </div>"]
    parts.append("  </section>")
    return "\n".join(parts)


def related_section(page):
    """Siblings in the family, then the hand-picked cross-links from the copy.

    Every child links to the hub and to the two family members nearest to its
    own job, so the seven pages are a mesh rather than seven dead ends off the
    sheet.
    """
    parts = ['  <nav class="container-narrow" aria-label="Other text tools" style="padding-top:24px;">',
             "    <h2 style=\"margin-top:0;\">More text tools</h2>",
             "    <ul>",
             '      <li><a href="/text-cleaner">Text Cleaner</a> &mdash; all seven of these at once, '
             'with every box ticked to start.</li>']
    for href, text, note in page["related"]:
        parts.append('      <li><a href="%s">%s</a> &mdash; %s</li>' % (href, text, note))
    parts += ["    </ul>"]

    # The rest of the family, as links rather than as checkboxes.
    #
    # The "Also clean up" panel above offers the same six pages, but it offers
    # them as checkboxes on this page: a crawler sees no link and a visitor who
    # wants the dedicated page cannot get there. That is why each generated
    # page held 1 to 4 inbound links against 33 for a tier-1 tool. This block
    # makes every sibling a real link, so the seven are a mesh.
    siblings = [p for p in C.PAGES if p["id"] != page["id"]]
    parts += ['    <h3 class="related-family">The rest of the family</h3>',
              '    <ul class="related-family-list">']
    for other in siblings:
        parts.append('      <li><a href="/%s">%s</a></li>' % (other["slug"], esc(other["h1"])))
    parts += ["    </ul>", "  </nav>"]
    return "\n".join(parts)


def render(page):
    body = ['<main id="main" data-cleaner="%s">' % esc(page["id"]),
            '  <div class="hero">',
            "    <h1>%s</h1>" % esc(page["h1"]),
            "    <p>%s</p>" % esc(page["tagline"]),
            '    <p class="trust-line">Runs 100% in your browser<span class="dot">&bull;</span>'
            'Nothing is uploaded to a server<span class="dot">&bull;</span>Instant results</p>',
            "  </div>",
            "",
            tool_section(page),
            "",
            prose_section(page),
            "",
            faq_section(page),
            "",
            related_section(page),
            "</main>"]
    return head(page) + header(page["slug"]) + "\n".join(body) + footer(page["slug"])


# --------------------------------------------------------------------------

def sitemap():
    rows = list(STATIC_URLS)
    rows += [("/" + p["slug"], "monthly", "0.7") for p in C.PAGES]
    rows += [(a, "monthly", "0.6") for a in ARTICLE_URLS]
    rows += TAIL_URLS
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, freq, prio in rows:
        out += ["  <url>",
                "    <loc>%s%s</loc>" % (SITE, loc.rstrip("/") or "/"),
                "    <changefreq>%s</changefreq>" % freq,
                "    <priority>%s</priority>" % prio,
                "  </url>"]
    out.append("</urlset>")
    return "\n".join(out) + "\n"


def write(path, text, check, stale):
    if check:
        if not os.path.exists(path) or open(path, encoding="utf-8").read() != text:
            stale.append(os.path.relpath(path, ROOT))
        return
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def main():
    ap = argparse.ArgumentParser(description="Generate the remove-X pages.")
    ap.add_argument("--check", action="store_true",
                    help="report stale or missing generated files instead of writing")
    args = ap.parse_args()

    slugs = [p["slug"] for p in C.PAGES]
    if len(set(slugs)) != len(slugs):
        raise SystemExit("slug collision in tools/cleaner_pages.py")

    # The nav is the site's chrome, so a family member missing from it would be
    # a page nothing links to. The hub carries the whole family's one nav slot.
    hub = "/" + C.HUB["slug"]
    if not any(sync_nav.canon(t["href"]) == hub for t in NAV.TOOLS):
        raise SystemExit("tools/nav_data.py has no entry for %s" % hub)

    # nav_data.FAMILY feeds the public tool count and the homepage directory,
    # so a page added here and forgotten there would make the site understate
    # itself and leave the new page with no link from the homepage.
    listed = {sync_nav.canon(f["href"]) for f in getattr(NAV, "FAMILY", [])}
    built = {"/" + p["slug"] for p in C.PAGES}
    if listed != built:
        raise SystemExit(
            "tools/nav_data.py FAMILY does not match tools/cleaner_pages.py PAGES\n"
            "  only in nav_data: %s\n  only in cleaner_pages: %s"
            % (sorted(listed - built), sorted(built - listed)))

    stale = []
    for page in C.PAGES:
        write(os.path.join(ROOT, page["slug"] + ".html"), render(page), args.check, stale)
    write(os.path.join(ROOT, "sitemap.xml"), sitemap(), args.check, stale)

    if args.check:
        if stale:
            print("stale or missing (%d):" % len(stale))
            for name in stale:
                print("  " + name)
            print("\nrun: python3 tools/build_cleaner_pages.py")
            return 1
        print("generated files are up to date (%d cleaner pages)" % len(C.PAGES))
        return 0

    print("wrote %d cleaner pages and sitemap.xml" % len(C.PAGES))
    return 0


if __name__ == "__main__":
    sys.exit(main())
