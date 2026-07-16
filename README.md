# textkitpro.com

A free, ad-supported bundle of text utilities, four tools in one page:

- **Word Counter** (default tab): live word/character/sentence/paragraph counts, estimated reading time, and a top-10 keyword density table (common stopwords excluded).
- **Case Converter**: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, PascalCase, snake_case, kebab-case, and aLtErNaTiNg CaSe, with one-click copy.
- **Lorem Ipsum Generator**: placeholder text by paragraphs, sentences, or words, starting with the traditional "Lorem ipsum dolor sit amet..." opening.
- **Text Diff Checker**: line-based diff between an "Original" and "Changed" textarea, highlighting added/removed/unchanged lines using a self-contained LCS diff (no external libraries).

Everything runs client-side — no backend, no build step, nothing uploaded. Deployed as static files on GitHub Pages.

## Local development

No build tooling required. Serve the folder with any static file server, e.g.:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Structure

```
index.html             Main app (all four tools, tabbed)
privacy.html            Privacy policy (required for ad networks)
terms.html               Terms of use
404.html                 Custom 404 page
robots.txt               Crawler rules + sitemap pointer
sitemap.xml              XML sitemap
assets/favicon.svg       Site icon (original mark)
assets/css/styles.css    Design system
assets/js/app.js         All app logic — pure text/diff functions plus DOM wiring for tabs, copy buttons, etc.
CNAME                    GitHub Pages custom domain (textkitpro.com)
```

`assets/js/app.js` keeps every core function (word/char/sentence/paragraph counting, keyword density, each case-conversion function, Lorem Ipsum generation, the diff algorithm) pure and DOM-independent, exported via a `typeof module !== "undefined"` guard so they can be sanity-checked from Node without a browser. The DOM-wiring code below that guard is skipped when the file is `require()`'d outside a browser.

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
