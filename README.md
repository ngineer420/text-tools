# textkitpro.com

A free, ad-supported bundle of text utilities, twelve tools in one page:

- **Word Counter** (default tab): live word/character/sentence/paragraph counts, estimated reading time, and a top-10 keyword density table (common stopwords excluded).
- **Case Converter**: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and aLtErNaTiNg CaSe, with one-click copy.
- **Lorem Ipsum Generator**: placeholder text by paragraphs, sentences, or words, starting with the traditional "Lorem ipsum dolor sit amet..." opening.
- **Text Diff Checker**: line-based diff between an "Original" and "Changed" textarea, highlighting added/removed/unchanged lines using a self-contained LCS diff (no external libraries).
- **Find and Replace**: literal or full regular-expression search with a live match count and a preview of what each capture group caught. Literal mode escapes the pattern, so searching for `$1.00` finds `$1.00`.
- **Sort and Dedupe Lines**: alphabetical, natural (`file2` before `file10`), numeric, length, reverse and shuffle ordering, plus duplicate removal keeping either the first or the last occurrence.
- **Markdown ↔ HTML**: both directions, with a live rendered preview. The Markdown→HTML renderer is shared verbatim with [notepadly.app](https://notepadly.app) (see below); HTML→Markdown is specific to this repo and emits GitHub-flavoured pipe tables.
- **CSV ↔ JSON**: RFC 4180 parsing, delimiter detection by column-count consistency, a header-row toggle and optional type coercion.
- **Slugify**: text to a URL-safe slug, with transliteration for accented characters, a configurable separator, a length limit and a bulk per-line mode.
- **Remove Line Breaks**: join every line onto one, unwrap paragraphs copied out of a PDF while keeping the blank line between them, or strip blank lines only — with a space, a comma or nothing in place of each break, plus trim/collapse-spaces/tabs-to-spaces passes and a live before/after character delta.
- **Reverse Text**: reverse by character, by word or by line, splitting on grapheme clusters so emoji, flags and combining accents survive the flip.
- **Text Statistics**: reading and speaking time, sentence/paragraph/syllable/unique-word counts, the longest sentence, and Flesch Reading Ease plus Flesch–Kincaid Grade Level.

Everything runs client-side — no backend, no build step, nothing uploaded. Deployed as static files on GitHub Pages.

The `articles/` directory adds four original written guides (word count standards, text case styles, reading time & readability, and how the tools work) linked from the homepage's "Learn more" section — part of an AdSense content-depth round to give the site substantive text content beyond the tools themselves.

## Local development

No build tooling required. Serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

```
index.html             Main app (all twelve tools, tabbed)
articles/                Original written content (content-depth round)
privacy.html            Privacy policy (required for ad networks)
terms.html               Terms of use
404.html                 Custom 404 page
robots.txt               Crawler rules + sitemap pointer
sitemap.xml              XML sitemap
assets/favicon.svg       Site icon (original mark)
assets/css/styles.css    Design system
assets/js/app.js         All app logic — pure text/diff functions plus DOM wiring for tabs, copy buttons, etc.
assets/js/markdown.js    Markdown renderer, shared verbatim with notepadly.app (see below)
assets/js/app.test.js    node:test suite for the pure functions — run with `node assets/js/app.test.js`
CNAME                    GitHub Pages custom domain (textkitpro.com)
```

`assets/js/app.js` keeps every core function (word/char/sentence/paragraph counting, keyword density, each case-conversion function, Lorem Ipsum generation, the diff algorithm) pure and DOM-independent, exported via a `typeof module !== "undefined"` guard so they can be sanity-checked from Node without a browser. The DOM-wiring code below that guard is skipped when the file is `require()`'d outside a browser.

Run the tests with:

```
node assets/js/app.test.js
```

### The shared Markdown renderer

`assets/js/markdown.js` is notepadly.app's renderer, copied rather than reimplemented — these are static sites with no package registry between them, so "reuse" means one file kept identical in both places. It differs from notepadly's copy in exactly two backwards-compatible ways: an options argument (`shiftHeadings: false`, so a converter emits a real `<h1>` where notepadly shifts headings down one level to sit under the page's own `<h1>`), and the `typeof module` export guard used for tests. If you change it, change it in both repos.

The HTML→Markdown direction lives in `app.js` and is genuinely this repo's own — it is the other direction and has no counterpart to share.

## Enabling ads (Google AdSense)

1. Deploy the site and get it live at textkitpro.com.
2. Apply at https://adsense.google.com with the live URL. Approval requires a working privacy policy (already included) and some real content/traffic — it isn't instant.
3. Once approved, uncomment the AdSense `<script>` tag in `index.html`'s `<head>` and replace `ca-pub-XXXXXXXXXXXXXXXX` with your publisher ID. Auto ads then places ad units automatically — no manual ad-slot placement is needed or included in this page.

## Custom domain (textkitpro.com)

**Note: textkitpro.com has not been registered yet.** The `CNAME` file below is in place so that GitHub Pages is ready to serve the domain the moment it's purchased and pointed here, but until then Pages will only serve the site at `https://ngineer420.github.io/text-tools/`.

The `CNAME` file tells GitHub Pages to serve this repo at `textkitpro.com`. Once the domain is registered, you'll still need to point DNS at GitHub Pages yourself:

- Apex domain (`textkitpro.com`): four `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
- `www` subdomain (optional): `CNAME` record to `ngineer420.github.io`.

Then enable Pages in the repo's Settings → Pages, and enter `textkitpro.com` as the custom domain (GitHub will offer to enforce HTTPS once DNS propagates).
