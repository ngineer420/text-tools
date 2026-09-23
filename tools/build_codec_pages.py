#!/usr/bin/env python3
"""Generate the six translator pages: Morse, binary, hex, Caesar, ROT13, NATO.

    python3 tools/build_codec_pages.py            # regenerate everything
    python3 tools/build_codec_pages.py --check    # fail if anything is stale

What it writes, all at the repo root:

    <slug>.html      one per entry in tools/codec_pages.py PAGES

It does NOT write sitemap.xml. `tools/build_cleaner_pages.py` owns that file
outright — two generators rewriting one file fight forever and both --checks
flip-flop — so the six slugs are listed in its STATIC_URLS and this builder
asserts that they are all still there rather than writing the rows itself.

Why a generator when these six are six genuinely different tools rather than
one tool with a parameter: the chrome. Six copies of a head block, a header, a
toolbar region and a footer is six places for the AdSense tag to drift out of
byte-for-byte agreement and six pages to edit when the footer changes. So the
chrome is generated and the *bodies* are not — the tool markup comes from four
hand-written control shapes keyed on `engine`, and every word of prose comes
from tools/codec_pages.py. Nothing on these pages is interpolated across
slugs, because six pages built from one sentence with the nouns swapped is
scaled content and reads like it.

The reference tables are read out of assets/js/codecs.js via
tools/dump_codecs.js rather than retyped here, so the ITU alphabet exists once
in this repo.

The toolbar comes from `sync_nav.render_nav`, the same renderer the
hand-written pages use, between the same `<!-- nav:start -->` markers.

Standard library only, plus Node for the table dump. Python 3.8+.
"""

import argparse
import html
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)

import build_cleaner_pages as CLEAN  # noqa: E402  (for the shared sitemap guard)
import codec_pages as C  # noqa: E402
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
    "     Written by tools/build_codec_pages.py from tools/codec_pages.py.\n"
    "     Any edit here is lost on the next build, and\n"
    "     `python3 tools/build_codec_pages.py --check` fails while one exists. -->"
)


def esc(s):
    return html.escape(s, quote=True)


def plain(fragment):
    """HTML fragment -> the text a JSON-LD field wants."""
    return html.unescape(re.sub(r"<[^>]+>", "", fragment))


def tables():
    """The Morse, NATO and ASCII rows, read out of the engine."""
    proc = subprocess.run(
        ["node", os.path.join(HERE, "dump_codecs.js")],
        capture_output=True, text=True,
    )
    if proc.returncode != 0:
        raise SystemExit("tools/dump_codecs.js failed:\n" + proc.stderr.strip())
    return json.loads(proc.stdout)


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
<meta property="og:title" content="{ogtitle}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{site}/assets/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{ogtitle}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{site}/assets/og-image.png">

<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/css/styles.css">

{ld}

{ads}
</head>
""".format(warning=GENERATED_WARNING, title=esc(title), desc=esc(plain(desc)),
           url=url, site=SITE, ogtitle=esc(page["title"]), ld=blocks, ads=ADSENSE)


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

<script src="/assets/js/codecs.js"></script>
<script src="/assets/js/app.js"></script>
<script src="/assets/js/codec-page.js"></script>
{erabbit}
</body>
</html>
""".format(footer=sync_nav.render_footer("/" + slug), erabbit=ERABBIT)


# --------------------------------------------------------------------------
# The tool — four control shapes, keyed on `engine`
# --------------------------------------------------------------------------

DIRECTION_ROW = """      <div class="case-btn-grid">
        <button type="button" class="case-btn" data-codec-dir="encode" aria-pressed="true">{enc}</button>
        <button type="button" class="case-btn" data-codec-dir="decode" aria-pressed="false">{dec}</button>
        <button type="button" class="case-btn" id="co-swap">Swap &#8646;</button>
      </div>"""


def controls_morse():
    """The player first, deliberately.

    The beeper is the reason to use this page rather than the six that only
    print dots, so it sits above the textareas where a visitor — and a crawler
    reading the first screen — meets it before anything else. A WebAudio
    player below a text box is a player nobody finds.
    """
    return """    <div class="panel">
      <h2>Play it</h2>
      <div class="codec-player">
        <div class="codec-player-btns">
          <button type="button" id="co-play" class="primary">&#9654; Play</button>
          <button type="button" id="co-stop">Stop</button>
          <span class="codec-lamp" id="co-lamp" aria-hidden="true"></span>
        </div>
        <div class="codec-sliders">
          <div class="field" style="margin-bottom:0;">
            <label for="co-wpm">Speed <span class="codec-slider-value" id="co-wpm-value">20 WPM</span></label>
            <input type="range" id="co-wpm" min="5" max="40" step="1" value="20">
          </div>
          <div class="field" style="margin-bottom:0;">
            <label for="co-pitch">Pitch <span class="codec-slider-value" id="co-pitch-value">600 Hz</span></label>
            <input type="range" id="co-pitch" min="300" max="1000" step="20" value="600">
          </div>
        </div>
      </div>
      <p class="hint" id="co-play-hint">The tone is generated in the browser, not downloaded &mdash; there is no audio file, so it works offline. Timing is the ITU's: a dah is three dits, and WPM is measured against PARIS.</p>
    </div>

    <div class="panel">
      <h2>Direction</h2>
""" + DIRECTION_ROW.format(enc="Text &rarr; Morse", dec="Morse &rarr; Text") + """
    </div>"""


def controls_binary():
    return """    <div class="panel">
      <h2>Direction</h2>
""" + DIRECTION_ROW.format(enc="Text &rarr; Binary", dec="Binary &rarr; Text") + """
      <h2 style="margin:22px 0 14px;">Base</h2>
      <div class="case-btn-grid">
        <button type="button" class="case-btn" data-codec-base="binary" aria-pressed="true">Binary</button>
        <button type="button" class="case-btn" data-codec-base="hex" aria-pressed="false">Hex</button>
      </div>
      <h2 style="margin:22px 0 14px;">One group per</h2>
      <div class="case-btn-grid">
        <button type="button" class="case-btn" data-codec-mode="bytes" aria-pressed="true">UTF-8 byte</button>
        <button type="button" class="case-btn" data-codec-mode="codepoints" aria-pressed="false">Character</button>
      </div>
      <div class="tool-grid tool-grid--three" style="margin-top:22px;">
        <div class="field" style="margin-bottom:0;">
          <label for="co-sep">Separator</label>
          <select id="co-sep">
            <option value="space">Space</option>
            <option value="none">None</option>
            <option value="comma">Comma</option>
            <option value="newline">One per line</option>
          </select>
        </div>
      </div>
      <p class="hint">UTF-8 byte is what a computer means and round-trips anything. Character is what a puzzle means. Pure ASCII is identical either way.</p>
    </div>"""


def controls_caesar():
    chips = "\n".join(
        '        <button type="button" class="case-btn" data-codec-shift="%d" aria-pressed="false">%d</button>' % (n, n)
        for n in (1, 3, 5, 7, 13, 25)
    )
    return """    <div class="panel">
      <h2>Direction</h2>
""" + DIRECTION_ROW.format(enc="Encode", dec="Decode") + """
      <h2 style="margin:22px 0 14px;">Shift</h2>
      <div class="tool-grid tool-grid--three">
        <div class="field" style="margin-bottom:0;">
          <label for="co-shift">Places to move each letter</label>
          <input type="number" id="co-shift" min="0" max="25" step="1" value="3">
        </div>
        <div class="field" style="margin-bottom:0;">
          <label for="co-guess">Do not know the shift?</label>
          <button type="button" id="co-guess">Guess it from letter frequencies</button>
        </div>
      </div>
      <div class="case-btn-grid" style="margin-top:14px;">
""" + chips + """
      </div>
    </div>"""


def controls_rot13():
    return """    <div class="panel">
      <h2>One operation, both ways</h2>
      <p class="hint" style="margin-top:0;">Thirteen is half of twenty-six, so rotating twice returns the original. There is no decode button because there is nothing for it to do &mdash; paste encoded text in and the plain text comes out.</p>
    </div>"""


def controls_nato():
    return """    <div class="panel">
      <h2>Direction</h2>
""" + DIRECTION_ROW.format(enc="Text &rarr; Phonetic", dec="Phonetic &rarr; Text") + """
      <h2 style="margin:22px 0 14px;">Digits</h2>
      <div class="case-btn-grid">
        <button type="button" class="case-btn" data-codec-variant="standard" aria-pressed="true">Plain (Nine, Three)</button>
        <button type="button" class="case-btn" data-codec-variant="radio" aria-pressed="false">Aviation (Niner, Tree)</button>
      </div>
      <p class="hint">The aviation forms exist so a digit survives a noisy channel and a listener whose first language is not English. Outside aviation and shipping, nobody says them.</p>
    </div>"""


CONTROLS = {
    "morse": controls_morse,
    "binary": controls_binary,
    "caesar": controls_caesar,
    "rot13": controls_rot13,
    "nato": controls_nato,
}


def tool_section(page):
    controls = CONTROLS[page["controls"]]()
    out_label = {
        "morse": "Morse",
        "binary": "Output",
        "caesar": "Result",
        "rot13": "Rotated",
        "nato": "Spelt out",
    }[page["controls"]]
    table = ""
    if page["engine"] == "caesar" and not page["data"].get("codec-init-locked"):
        table = """
    <div class="panel" style="margin-top:16px;">
      <h2>All twenty-six shifts</h2>
      <p class="hint" style="margin-top:0;">The key space is twenty-six. That is the whole weakness &mdash; you do not need a technique, you read the list and pick the English one.</p>
      <div class="shift-table-wrap">
        <table class="density-table shift-table">
          <thead>
            <tr><th scope="col">Shift</th><th scope="col">Text</th></tr>
          </thead>
          <tbody id="co-table-body"></tbody>
        </table>
      </div>
    </div>"""
    return """  <section aria-label="{h1} tool">
{controls}

    <div class="tool-grid tool-grid--split" style="margin-top:16px;">
      <div class="panel">
        <h2>Input</h2>
        <div class="field" style="margin-bottom:0;">
          <label for="co-input" class="visually-hidden">Text to translate</label>
          <textarea id="co-input" rows="10" placeholder="Type or paste here...">{sample}</textarea>
        </div>
        <div class="error-banner" id="co-error" role="alert"></div>
      </div>
      <div class="panel">
        <div class="output-toolbar">
          <h2 style="margin:0;">{out}</h2>
          <div class="btn-row" style="margin-top:0;">
            <div class="copy-flash-wrap">
              <button type="button" id="co-copy" class="icon-btn">Copy</button>
              <span class="copy-flash" id="co-copy-flash">Copied!</span>
            </div>
            <button type="button" id="co-download" class="icon-btn">Download</button>
          </div>
        </div>
        <div class="field" style="margin-bottom:0;">
          <label for="co-output" class="visually-hidden">Result</label>
          <textarea id="co-output" rows="10" readonly></textarea>
        </div>
        <p class="hint" id="co-stats" role="status"></p>
      </div>
    </div>{table}
  </section>
""".format(h1=esc(page["h1"]), controls=controls, sample=esc(page["sample"]),
           out=out_label, table=table)


# --------------------------------------------------------------------------
# Prose
# --------------------------------------------------------------------------

def prose_section(page):
    paras = "\n".join("    <p>%s</p>" % p for p in page["about"])
    label, before, after = page["example"]
    return """
  <section class="container-narrow" style="padding-bottom:0;">
    <h2 style="margin-top:0;">{heading}</h2>
{paras}

    <p class="example-heading">{label}</p>
    <div class="cleaner-example">
      <figure>
        <figcaption>In</figcaption>
        <pre>{before}</pre>
      </figure>
      <figure>
        <figcaption>Out</figcaption>
        <pre>{after}</pre>
      </figure>
    </div>
  </section>
""".format(heading=esc(page["about_heading"]), paras=paras, label=esc(label),
           before=esc(before), after=esc(after))


def reference_section(page, data):
    if not page.get("reference"):
        return ""
    heading, intro, key, cols = page["reference"]
    if key == "morse":
        headers = ["Character", "Morse"]
        rows = [(k, v) for k, v in data["morse"]]
        extra = """
    <h3>Prosigns</h3>
    <p>Procedural signals, not letters. Each is sent as one unbroken symbol &mdash; type them in angle brackets and they encode as one.</p>
    <div class="table-scroll">
      <table class="density-table ref-table">
        <thead><tr><th scope="col">Prosign</th><th scope="col">Morse</th><th scope="col">Means</th></tr></thead>
        <tbody>
%s
        </tbody>
      </table>
    </div>""" % "\n".join(
            '          <tr><th scope="row">%s</th><td class="ref-code">%s</td><td>%s</td></tr>'
            % (esc(k), esc(v), esc(PROSIGN_MEANING.get(k, "")))
            for k, v in data["prosigns"]
        )
    elif key == "nato":
        headers = ["Letter", "Spoken", "On the radio"]
        rows = [(k, v, r) for k, v, r in data["nato"]]
        extra = ""
    else:
        headers = ["Character", "Binary", "Hex", "Decimal"]
        rows = [tuple(r) for r in data["ascii"]]
        extra = ""

    return """
  <section class="container-narrow" style="padding-top:24px;padding-bottom:0;">
    <h2 style="margin-top:0;">{heading}</h2>
    <p>{intro}</p>
{tables}{extra}
  </section>
""".format(heading=esc(heading), intro=esc(intro),
           tables=column_tables(headers, rows, cols), extra=extra)


def column_tables(headers, rows, cols):
    """Render one logical table as `cols` tables side by side.

    Sixty rows of two narrow columns is a screenful of mostly whitespace with a
    thread of content down the left of it. A reference chart is read by
    scanning, so it wants to be short and wide rather than tall and thin — and
    four real <table>s beat one table with CSS columns, which breaks rows
    across the gap.

    The split is by chunk rather than round-robin so each sub-table stays in
    alphabetical order top to bottom, which is how someone hunting for Q reads
    it. Below 700px the wrapper collapses to one column and the tables simply
    stack, so nothing is lost on a phone.
    """
    per = -(-len(rows) // cols)   # ceiling division
    chunks = [rows[i:i + per] for i in range(0, len(rows), per)]
    head_html = "".join('<th scope="col">%s</th>' % h for h in headers)
    out = []
    for chunk in chunks:
        body = "\n".join(
            '            <tr><th scope="row">%s</th>%s</tr>'
            % (esc(str(r[0])), "".join('<td class="ref-code">%s</td>' % esc(str(c)) for c in r[1:]))
            for r in chunk
        )
        out.append("""      <table class="density-table ref-table">
        <thead><tr>%s</tr></thead>
        <tbody>
%s
        </tbody>
      </table>""" % (head_html, body))
    return '    <div class="ref-columns" style="--ref-cols:%d;">\n%s\n    </div>' % (cols, "\n".join(out))


PROSIGN_MEANING = {
    "<AR>": "End of message",
    "<AS>": "Wait",
    "<BK>": "Break",
    "<BT>": "New paragraph",
    "<CL>": "Closing station",
    "<CT>": "Start of transmission",
    "<KN>": "Go ahead, named station only",
    "<SK>": "End of contact",
    "<SN>": "Understood",
    "<SOS>": "Distress",
    "<HH>": "Error",
}


def faq_section(page):
    items = "\n".join(
        """    <div class="faq-item">
      <h3>%s</h3>
      <p>%s</p>
    </div>""" % (esc(q), a)
        for q, a in page["faq"]
    )
    return """
  <section class="container-narrow" style="padding-top:24px;padding-bottom:0;">
    <h2 style="margin-top:0;">{h1} questions</h2>
{items}
  </section>
""".format(h1=esc(page["h1"]), items=items)


def related_section(page):
    items = "\n".join(
        '      <li><a href="%s">%s</a> &mdash; %s</li>' % (href, esc(text), esc(note))
        for href, text, note in page["related"]
    )
    return """
  <nav class="container-narrow" aria-label="Other text tools" style="padding-top:24px;">
    <h2 style="margin-top:0;">More text tools</h2>
    <ul>
{items}
    </ul>
  </nav>
</main>
""".format(items=items)


def render(page, data):
    attrs = "".join(' data-%s="%s"' % (k, v) for k, v in sorted(page["data"].items()))
    body = """<main id="main" data-codec-engine="{engine}"{attrs}>
  <div class="hero">
    <h1>{h1}</h1>
    <p>{tagline}</p>
    <p class="trust-line">Runs 100% in your browser<span class="dot">&bull;</span>Nothing is uploaded to a server<span class="dot">&bull;</span>Instant results</p>
  </div>

""".format(engine=page["engine"], attrs=attrs, h1=esc(page["h1"]), tagline=esc(page["tagline"]))
    body += tool_section(page)
    body += prose_section(page)
    body += reference_section(page, data)
    body += faq_section(page)
    body += related_section(page)
    return head(page) + header(page["slug"]) + body + footer(page["slug"])


def write(path, text, check, stale):
    if check:
        if not os.path.exists(path) or open(path, encoding="utf-8").read() != text:
            stale.append(os.path.relpath(path, ROOT))
        return
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(text)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--check", action="store_true",
                    help="report stale/missing generated files instead of writing")
    args = ap.parse_args()

    slugs = [p["slug"] for p in C.PAGES]
    if len(set(slugs)) != len(slugs):
        raise SystemExit("slug collision in tools/codec_pages.py")

    # Every page must be reachable, and the sitemap is not ours to write.
    nav_hrefs = {t["href"] for t in NAV.TOOLS}
    sitemap_locs = {loc for loc, _f, _p in CLEAN.STATIC_URLS}
    for slug in slugs:
        if "/" + slug not in nav_hrefs:
            raise SystemExit("tools/nav_data.py has no entry for /%s" % slug)
        if "/" + slug not in sitemap_locs:
            raise SystemExit(
                "/%s is missing from STATIC_URLS in tools/build_cleaner_pages.py, "
                "which owns sitemap.xml" % slug
            )

    data = tables()
    stale = []
    for page in C.PAGES:
        write(os.path.join(ROOT, page["slug"] + ".html"), render(page, data), args.check, stale)

    if args.check:
        if stale:
            print("stale or missing (%d):" % len(stale))
            for path in stale[:20]:
                print("  " + path)
            print("\nrun: python3 tools/build_codec_pages.py")
            return 1
        print("generated files are up to date (%d codec pages)" % len(C.PAGES))
        return 0

    print("wrote %d codec pages" % len(C.PAGES))
    return 0


if __name__ == "__main__":
    sys.exit(main())
