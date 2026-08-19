// Pure-helper tests for app.js and markdown.js. Run with: node assets/js/app.test.js
// No framework/deps — uses Node's built-in test runner + assert.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  countWords,
  countCharsWithSpaces,
  countCharsWithoutSpaces,
  countSentences,
  countParagraphs,
  keywordDensity,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  diffLines,
  buildSearchRegex,
  escapeRegExp,
  findMatches,
  applyReplacement,
  describeGroups,
  splitLines,
  leadingNumber,
  naturalCompare,
  dedupeLines,
  sortLineArray,
  processLines,
  detectDelimiter,
  parseCsv,
  coerceCell,
  csvToJson,
  csvEscape,
  jsonToCsv,
  transliterate,
  slugify,
  splitSentences,
  countSyllables,
  fleschReadingEase,
  textStatistics,
  formatDuration,
  decodeEntities,
  htmlToMarkdown,
  removeLineBreaks,
  reverseText,
  splitGraphemes,
  splitGraphemesFallback,
  removeExtraSpaces,
  removePunctuation,
  removeSpecialChars,
  removeNumbers,
  removeEmoji,
  stripHtmlTags,
  removeAccents,
  cleanText,
  CLEANER_ORDER,
} = require("./app.js");

const { renderMarkdown } = require("./markdown.js");

/* ------------------------------ existing tools ---------------------------- */

test("word counter basics", () => {
  assert.equal(countWords("hello world"), 2);
  assert.equal(countWords("   "), 0);
  assert.equal(countCharsWithSpaces("a b"), 3);
  assert.equal(countCharsWithoutSpaces("a b"), 2);
  assert.equal(countSentences("One. Two! Three?"), 3);
  assert.equal(countParagraphs("a\n\nb\n\nc"), 3);
});

test("keyword density skips stopwords and ranks by count", () => {
  const rows = keywordDensity("apple apple banana the the the", 5);
  assert.equal(rows[0].word, "apple");
  assert.equal(rows[0].count, 2);
  assert.ok(!rows.some((r) => r.word === "the"), "stopwords are excluded");
});

test("case converters", () => {
  assert.equal(toCamelCase("hello world again"), "helloWorldAgain");
  assert.equal(toSnakeCase("Hello World"), "hello_world");
  assert.equal(toKebabCase("Hello World"), "hello-world");
});

test("diffLines marks added, removed and unchanged", () => {
  const d = diffLines("a\nb\nc", "a\nx\nc");
  assert.deepEqual(
    d.map((r) => r.type),
    ["unchanged", "removed", "added", "unchanged"]
  );
});

/* ---------------------------- find and replace ---------------------------- */

test("escapeRegExp neutralises metacharacters", () => {
  assert.equal(escapeRegExp("a.b*c"), "a\\.b\\*c");
  assert.equal(new RegExp(escapeRegExp("$1.00")).test("$1.00"), true);
});

test("buildSearchRegex escapes in literal mode, not in regex mode", () => {
  assert.equal(buildSearchRegex("a.b", {}).source, "a\\.b");
  assert.equal(buildSearchRegex("a.b", { regex: true }).source, "a.b");
  assert.ok(buildSearchRegex("x", {}).flags.includes("i"), "case-insensitive by default");
  assert.ok(!buildSearchRegex("x", { caseSensitive: true }).flags.includes("i"));
});

test("findMatches counts matches and captures groups", () => {
  const re = buildSearchRegex("(\\w+)@(\\w+)", { regex: true, caseSensitive: true });
  const r = findMatches("a@b c@d", re);
  assert.equal(r.total, 2);
  assert.deepEqual(r.matches[0].groups, ["a", "b"]);
  assert.equal(r.matches[1].index, 4);
});

test("findMatches terminates on a zero-length match", () => {
  const r = findMatches("abc", /(?:)/g, 10);
  assert.equal(r.total, 4); // one empty match at each boundary
});

test("findMatches reports truncation past the cap", () => {
  const r = findMatches("aaaaa", /a/g, 2);
  assert.equal(r.total, 5);
  assert.equal(r.matches.length, 2);
  assert.equal(r.truncated, true);
});

test("applyReplacement treats $1 as literal outside regex mode", () => {
  const literal = buildSearchRegex("price", {});
  assert.equal(applyReplacement("price", literal, "$100", false), "$100");
  const re = buildSearchRegex("(a)(b)", { regex: true });
  assert.equal(applyReplacement("ab", re, "$2$1", true), "ba");
});

test("describeGroups renders a capture preview", () => {
  const re = buildSearchRegex("(\\d+)-(\\d+)", { regex: true });
  const r = findMatches("10-20", re);
  assert.equal(describeGroups(r.matches[0]), '$1="10"  $2="20"');
});

/* ----------------------------- sort and dedupe ---------------------------- */

test("splitLines normalises CRLF", () => {
  assert.deepEqual(splitLines("a\r\nb\rc"), ["a", "b", "c"]);
});

test("leadingNumber reads a leading numeric prefix only", () => {
  assert.equal(leadingNumber("42 apples"), 42);
  assert.equal(leadingNumber("-3.5x"), -3.5);
  assert.equal(leadingNumber("apples 42"), null);
});

test("naturalCompare orders file2 before file10", () => {
  const sorted = ["file10", "file2", "file1"].sort(naturalCompare);
  assert.deepEqual(sorted, ["file1", "file2", "file10"]);
});

test("dedupeLines keeps first or last", () => {
  assert.deepEqual(dedupeLines(["a", "b", "a"], { keep: "first" }), ["a", "b"]);
  assert.deepEqual(dedupeLines(["a", "b", "a"], { keep: "last" }), ["b", "a"]);
  assert.deepEqual(dedupeLines(["a", "A"], { caseSensitive: true }), ["a", "A"]);
  assert.deepEqual(dedupeLines(["a", "A"], {}), ["a"]);
});

test("sortLineArray sorts by mode and direction", () => {
  assert.deepEqual(sortLineArray(["b", "a", "c"], { mode: "alpha" }), ["a", "b", "c"]);
  assert.deepEqual(sortLineArray(["b", "a", "c"], { mode: "alpha", direction: "desc" }), ["c", "b", "a"]);
  assert.deepEqual(sortLineArray(["ccc", "a", "bb"], { mode: "length" }), ["a", "bb", "ccc"]);
  assert.deepEqual(sortLineArray(["10", "9", "100"], { mode: "numeric" }), ["9", "10", "100"]);
});

test("numeric sort sinks numberless lines to the bottom", () => {
  assert.deepEqual(sortLineArray(["x", "2", "1"], { mode: "numeric" }), ["1", "2", "x"]);
});

test("processLines runs the whole pipeline and reports stats", () => {
  const r = processLines("b\na\n\nb\n", { trim: true, removeBlank: true, dedupe: "first", mode: "alpha" });
  assert.equal(r.text, "a\nb");
  assert.equal(r.stats.duplicates, 1);
  assert.equal(r.stats.blanks, 2); // the blank line and the trailing newline
  assert.equal(r.stats.output, 2);
});

test("processLines reverse does not sort", () => {
  assert.equal(processLines("a\nb\nc", { mode: "reverse" }).text, "c\nb\na");
});

/* --------------------------------- CSV/JSON -------------------------------- */

test("parseCsv honours quotes, doubled quotes and embedded newlines", () => {
  assert.deepEqual(parseCsv('a,b\n1,2', ","), [["a", "b"], ["1", "2"]]);
  assert.deepEqual(parseCsv('"a,b",c', ","), [["a,b", "c"]]);
  assert.deepEqual(parseCsv('"say ""hi""",c', ","), [['say "hi"', "c"]]);
  assert.deepEqual(parseCsv('"line\nbreak",c', ","), [["line\nbreak", "c"]]);
});

test("detectDelimiter prefers the consistent one over the frequent one", () => {
  assert.equal(detectDelimiter("a,b,c\n1,2,3"), ",");
  assert.equal(detectDelimiter("a;b;c\n1;2;3"), ";");
  assert.equal(detectDelimiter("a\tb\n1\t2"), "\t");
  // Prose full of commas must not beat the real pipe delimiter.
  assert.equal(detectDelimiter("name|note\nada|one, two, three\nalan|four, five, six"), "|");
});

test("coerceCell types numbers and booleans but leaves lookalikes alone", () => {
  assert.equal(coerceCell("42"), 42);
  assert.equal(coerceCell("true"), true);
  assert.equal(coerceCell("007"), "007");
  assert.equal(coerceCell("+1 555"), "+1 555");
});

test("csvToJson uses the header row", () => {
  assert.deepEqual(csvToJson("name,age\nAda,36"), [{ name: "Ada", age: 36 }]);
  // Without a header row every cell is still type-coerced, so "1" becomes 1.
  assert.deepEqual(csvToJson("a,b\n1,2", { hasHeader: false }), [["a", "b"], [1, 2]]);
  assert.deepEqual(csvToJson("a,b\n1,2", { hasHeader: false, coerceTypes: false }), [["a", "b"], ["1", "2"]]);
});

test("csvEscape quotes only when required", () => {
  assert.equal(csvEscape("plain", ","), "plain");
  assert.equal(csvEscape("a,b", ","), '"a,b"');
  assert.equal(csvEscape('say "hi"', ","), '"say ""hi"""');
});

test("jsonToCsv unions keys across sparse rows", () => {
  const csv = jsonToCsv([{ a: 1 }, { b: 2 }]);
  assert.equal(csv, "a,b\n1,\n,2");
});

test("CSV round-trips through JSON", () => {
  const csv = "name,age\nAda,36\nAlan,41";
  assert.equal(jsonToCsv(csvToJson(csv)), csv);
});

/* --------------------------------- slugify --------------------------------- */

test("slugify makes a URL-safe slug", () => {
  assert.equal(slugify("Hello, World!"), "hello-world");
  assert.equal(slugify("  spaced  out  "), "spaced-out");
  assert.equal(slugify("Hello", { separator: "_" }), "hello");
  assert.equal(slugify("a b c", { separator: "_" }), "a_b_c");
  assert.equal(slugify("a b", { separator: "" }), "ab");
});

test("slugify transliterates accents and special letters", () => {
  assert.equal(slugify("Crème Brûlée"), "creme-brulee");
  assert.equal(slugify("Straße"), "strasse");
  assert.equal(slugify("Æther & Œuvre"), "aether-and-oeuvre");
});

test("slugify drops apostrophes instead of splitting on them", () => {
  assert.equal(slugify("Beginner's Guide"), "beginners-guide");
  assert.equal(slugify("Beginner’s Guide"), "beginners-guide"); // curly
  assert.equal(slugify("Beginner's Guide", { transliterate: false }), "beginners-guide");
});

test("transliterate strips combining marks", () => {
  assert.equal(transliterate("é"), "e");
  assert.equal(transliterate("ñ"), "n");
});

test("slugify keepUnicode preserves non-Latin scripts", () => {
  assert.equal(slugify("Привет мир", { keepUnicode: true }), "привет-мир");
  assert.equal(slugify("Привет мир"), "");
});

test("slugify honours maxLength without a trailing separator", () => {
  assert.equal(slugify("one two three four", { maxLength: 8 }), "one-two");
});

/* ------------------------------- text statistics --------------------------- */

test("splitSentences does not break on abbreviations or decimals", () => {
  assert.equal(splitSentences("Dr. Smith went home. He slept.").length, 2);
  assert.equal(splitSentences("It costs 3.5 dollars. That is fine.").length, 2);
});

test("countSyllables uses the vowel-group heuristic", () => {
  assert.equal(countSyllables("cat"), 1);
  assert.equal(countSyllables("hello"), 2);
  assert.equal(countSyllables("beautiful"), 3); // one vowel run for "eau"
  assert.equal(countSyllables("queue"), 1);
});

test("fleschReadingEase matches the published formula", () => {
  // 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
  const expected = 206.835 - 1.015 * (100 / 5) - 84.6 * (150 / 100);
  assert.ok(Math.abs(fleschReadingEase(100, 5, 150) - expected) < 1e-9);
  assert.equal(fleschReadingEase(0, 0, 0), null);
});

test("textStatistics reports counts and averages", () => {
  const s = textStatistics("One two three. Four five six seven.");
  assert.equal(s.words, 7);
  assert.equal(s.sentences, 2);
  assert.equal(s.longestSentence.words, 4);
  assert.equal(s.paragraphs, 1);
  assert.ok(s.readingMinutes > 0);
});

test("formatDuration reads as time, not decimals", () => {
  assert.equal(formatDuration(0), "—");
  assert.equal(formatDuration(0.5), "30 sec");
  assert.equal(formatDuration(1), "1 min");
  assert.equal(formatDuration(1.5), "1 min 30 sec");
});

/* --------------------------- markdown: both directions --------------------- */

test("renderMarkdown escapes HTML before parsing", () => {
  const html = renderMarkdown("<script>alert(1)</script>", { shiftHeadings: false });
  assert.ok(!html.includes("<script>"), "no raw script tag survives");
  assert.ok(html.includes("&lt;script&gt;"));
});

test("renderMarkdown honours shiftHeadings", () => {
  assert.equal(renderMarkdown("# T", { shiftHeadings: false }), "<h1>T</h1>");
  assert.equal(renderMarkdown("# T"), "<h2>T</h2>"); // notepadly's default
});

test("renderMarkdown placeholder cannot be forged by the document", () => {
  // The code-span stash uses NUL sentinels precisely so ordinary text can
  // never impersonate one.
  assert.equal(renderMarkdown("a C0 b", { shiftHeadings: false }), "<p>a C0 b</p>");
});

test("renderMarkdown rejects javascript: and data: URLs", () => {
  // The link pattern excludes parentheses from the URL, so the payload here
  // deliberately has none — otherwise it is never parsed as a link at all and
  // the test would pass without exercising the URL check.
  assert.equal(renderMarkdown("[x](javascript:alert)", { shiftHeadings: false }), "<p>x</p>");
  assert.equal(renderMarkdown("[x](data:text/html;base64,abc)", { shiftHeadings: false }), "<p>x</p>");
  assert.ok(renderMarkdown("[x](https://ok.example)", { shiftHeadings: false }).includes("href"));
});

test("decodeEntities handles named and numeric references", () => {
  assert.equal(decodeEntities("Tom &amp; Jerry"), "Tom & Jerry");
  assert.equal(decodeEntities("&lt;3"), "<3");
  assert.equal(decodeEntities("&#65;&#x42;"), "AB");
  assert.equal(decodeEntities("&notareal;"), "&notareal;");
});

test("htmlToMarkdown converts block elements", () => {
  assert.equal(htmlToMarkdown("<h1>Title</h1>"), "# Title\n");
  assert.equal(htmlToMarkdown("<h3>Sub</h3>"), "### Sub\n");
  assert.equal(htmlToMarkdown("<p>a</p><hr><p>b</p>"), "a\n\n---\n\nb\n");
  assert.equal(htmlToMarkdown("<blockquote><p>q</p></blockquote>"), "> q\n");
});

test("htmlToMarkdown converts inline elements", () => {
  assert.equal(htmlToMarkdown("<p><strong>b</strong> and <em>i</em></p>"), "**b** and *i*\n");
  assert.equal(htmlToMarkdown('<p><a href="/x">label</a></p>'), "[label](/x)\n");
  assert.equal(htmlToMarkdown('<p><img src="/a.png" alt="Cat"></p>'), "![Cat](/a.png)\n");
  assert.equal(htmlToMarkdown("<p>use <code>npm i</code></p>"), "use `npm i`\n");
});

test("htmlToMarkdown keeps a list item and its paragraph on one line", () => {
  // Regression: the block() helper used to strip the trailing space off a
  // fresh "- " marker before testing for it, so <li><p> emitted "-\n\none".
  assert.equal(htmlToMarkdown("<ul><li><p>one</p></li></ul>"), "- one\n");
});

test("htmlToMarkdown indents nested lists without breaking them", () => {
  // Regression: a nested <ul> used to force a blank line, ending the outer list.
  assert.equal(htmlToMarkdown("<ul><li>a<ul><li>b</li></ul></li></ul>"), "- a\n  - b\n");
  assert.equal(
    htmlToMarkdown("<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>"),
    "- a\n  - b\n    - c\n"
  );
  assert.equal(htmlToMarkdown("<ol><li>one</li><li>two</li></ol>"), "1. one\n2. two\n");
});

test("htmlToMarkdown emits a GFM table with a delimiter row", () => {
  // Regression: tables used to come out as "| A | B" with no trailing pipe and
  // no delimiter row, which renders as literal text rather than a table.
  assert.equal(
    htmlToMarkdown("<table><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table>"),
    "| A | B |\n| --- | --- |\n| 1 | 2 |\n"
  );
});

test("htmlToMarkdown escapes a pipe inside a table cell", () => {
  assert.equal(
    htmlToMarkdown("<table><tr><td>a|b</td></tr></table>"),
    "| a\\|b |\n| --- |\n"
  );
});

test("htmlToMarkdown pads a ragged table to the widest row", () => {
  assert.equal(
    htmlToMarkdown("<table><tr><td>a</td><td>b</td></tr><tr><td>1</td></tr></table>"),
    "| a | b |\n| --- | --- |\n| 1 |  |\n"
  );
});

test("htmlToMarkdown fences pre blocks and preserves their whitespace", () => {
  assert.equal(
    htmlToMarkdown("<pre><code>const a = 1;\n  indented</code></pre>"),
    "```\nconst a = 1;\n  indented\n```\n"
  );
});

test("htmlToMarkdown drops script and style content entirely", () => {
  assert.equal(htmlToMarkdown("<p>a</p><script>evil()</script>"), "a\n");
  assert.equal(htmlToMarkdown("<style>p{color:red}</style><p>a</p>"), "a\n");
});

test("htmlToMarkdown keeps text from unknown tags", () => {
  assert.equal(htmlToMarkdown("<p>a <span>b</span> c</p>"), "a b c\n");
  assert.equal(htmlToMarkdown("<custom-el>text</custom-el>"), "text\n");
});

test("htmlToMarkdown does not lose content on an unclosed tag", () => {
  assert.equal(htmlToMarkdown('<p>text <a href="/x">label'), "text label\n");
});

test("markdown survives a round trip through both directions", () => {
  const doc = [
    "# Title",
    "",
    "Some **bold** and *italic* text with `code`.",
    "",
    "- one",
    "- two",
    "",
    "> a quote",
    "",
    "```",
    "code block",
    "```",
    "",
    "[link](https://example.com)",
  ].join("\n");

  const html = renderMarkdown(doc, { shiftHeadings: false });
  const back = htmlToMarkdown(html);
  assert.equal(back.trim(), doc.trim());
});

test("round trip is stable on a second pass", () => {
  const doc = "## Heading\n\nText with a [link](/a).\n\n1. first\n2. second";
  const once = htmlToMarkdown(renderMarkdown(doc, { shiftHeadings: false }));
  const twice = htmlToMarkdown(renderMarkdown(once, { shiftHeadings: false }));
  assert.equal(once, twice);
});

/* --------------------------- remove line breaks --------------------------- */

test("removeLineBreaks joins everything onto one line", () => {
  const r = removeLineBreaks("one\ntwo\nthree", { mode: "join", replaceWith: "space" });
  assert.equal(r.text, "one two three");
  assert.equal(r.stats.linesBefore, 3);
  assert.equal(r.stats.linesAfter, 1);
  assert.equal(r.stats.breaksRemoved, 2);
});

test("removeLineBreaks normalises CRLF and lone CR before joining", () => {
  assert.equal(removeLineBreaks("one\r\ntwo\rthree", { mode: "join" }).text, "one two three");
  assert.equal(removeLineBreaks("a\r\nb", { mode: "blank" }).text, "a\nb");
});

test("removeLineBreaks unwrap keeps the blank line between paragraphs", () => {
  const text = "The quick\nbrown fox\n\njumps over\nthe lazy dog";
  assert.equal(
    removeLineBreaks(text, { mode: "unwrap" }).text,
    "The quick brown fox\n\njumps over the lazy dog"
  );
});

test("removeLineBreaks unwrap collapses runs of blank lines to one break", () => {
  assert.equal(removeLineBreaks("a\n\n\n\nb", { mode: "unwrap" }).text, "a\n\nb");
});

test("removeLineBreaks blank mode removes blank lines and nothing else", () => {
  const r = removeLineBreaks("a\n\n  \nb\n", { mode: "blank" });
  assert.equal(r.text, "a\nb");
  assert.equal(r.stats.breaksRemoved, 3);
});

test("removeLineBreaks replacement character", () => {
  assert.equal(removeLineBreaks("a\nb", { mode: "join", replaceWith: "comma" }).text, "a, b");
  assert.equal(removeLineBreaks("a\nb", { mode: "join", replaceWith: "none" }).text, "ab");
  // An unknown value falls back to a space rather than silently deleting text.
  assert.equal(removeLineBreaks("a\nb", { mode: "join", replaceWith: "nope" }).text, "a b");
});

test("removeLineBreaks does not double a separator the line already has", () => {
  assert.equal(removeLineBreaks("a,\nb", { mode: "join", replaceWith: "comma" }).text, "a, b");
  assert.equal(removeLineBreaks("a \n b", { mode: "join", replaceWith: "space" }).text, "a b");
});

test("removeLineBreaks joining with nothing is literal", () => {
  assert.equal(
    removeLineBreaks("d41d8cd98f\n00b204e980\n9998ecf842", { mode: "join", replaceWith: "none" }).text,
    "d41d8cd98f00b204e9809998ecf842"
  );
});

test("removeLineBreaks cleanup passes", () => {
  assert.equal(
    removeLineBreaks("a\t\tb", { mode: "blank", tabsToSpaces: true, collapseSpaces: true }).text,
    "a b"
  );
  assert.equal(removeLineBreaks("  a  \n  b  ", { mode: "blank", trimLines: true }).text, "a\nb");
  // Tabs survive when the box is off.
  assert.equal(removeLineBreaks("a\tb", { mode: "blank" }).text, "a\tb");
});

test("removeLineBreaks reports the character delta", () => {
  const r = removeLineBreaks("one\ntwo", { mode: "join", replaceWith: "none" });
  assert.equal(r.stats.charactersBefore, 7);
  assert.equal(r.stats.charactersAfter, 6);
  assert.equal(r.stats.delta, -1);
});

test("removeLineBreaks handles empty input", () => {
  const r = removeLineBreaks("", { mode: "join" });
  assert.equal(r.text, "");
  assert.equal(r.stats.linesBefore, 0);
  assert.equal(r.stats.breaksRemoved, 0);
});

/* ------------------------------- reverse text ----------------------------- */

test("reverseText by character", () => {
  assert.equal(reverseText("stressed", "characters"), "desserts");
  assert.equal(reverseText("", "characters"), "");
});

test("reverseText by character is grapheme-safe", () => {
  // Surrogate pairs, combining marks and ZWJ sequences come back intact.
  assert.equal(reverseText("ab👍", "characters"), "👍ba");
  assert.equal(reverseText("café", "characters"), "éfac");
  assert.equal(reverseText("x👨‍👩‍👧y", "characters"), "y👨‍👩‍👧x");
  assert.equal(reverseText("🇬🇧!", "characters"), "!🇬🇧");
});

test("reverseText by character reverses each line in place", () => {
  assert.equal(reverseText("ab\ncd", "characters"), "ba\ndc");
});

test("reverseText by word keeps indentation where it was", () => {
  assert.equal(reverseText("the quick brown fox", "words"), "fox brown quick the");
  assert.equal(reverseText("  a b c", "words"), "  c b a");
  assert.equal(reverseText("one two\nthree four", "words"), "two one\nfour three");
  assert.equal(reverseText("   ", "words"), "   ");
});

test("reverseText by line", () => {
  assert.equal(reverseText("one\ntwo\nthree", "lines"), "three\ntwo\none");
  assert.equal(reverseText("one\r\ntwo", "lines"), "two\none");
});

test("splitGraphemes agrees with the no-Intl.Segmenter fallback", () => {
  const samples = ["stressed", "ab👍", "café", "x👨‍👩‍👧y", "🇬🇧!", "1⃣"];
  for (const s of samples) {
    assert.deepEqual(splitGraphemesFallback(s), splitGraphemes(s), s);
  }
  assert.deepEqual(splitGraphemes(""), []);
  assert.deepEqual(splitGraphemesFallback("👍").length, 1);
});

/* ------------------------------ text cleaners ----------------------------- */

test("removeExtraSpaces collapses runs and trims, per mode", () => {
  assert.equal(removeExtraSpaces("a   b  c"), "a b c");
  assert.equal(removeExtraSpaces("  padded  "), "padded");
  assert.equal(removeExtraSpaces("    keep   me", { mode: "indent" }), "    keep me");
  assert.equal(removeExtraSpaces("  a   b  ", { mode: "trim" }), "a   b");
  assert.equal(removeExtraSpaces("a b\tc", { mode: "all" }), "abc");
});

test("removeExtraSpaces handles the spaces you cannot see", () => {
  assert.equal(removeExtraSpaces("a\u00a0\u00a0b"), "a b");
  assert.equal(removeExtraSpaces("a\u200bb"), "ab");
  assert.equal(removeExtraSpaces("a\u3000b"), "a b");
  assert.equal(removeExtraSpaces("a\u00a0b", { unifySpaces: false }), "a\u00a0b");
});

test("removeExtraSpaces blank-line modes", () => {
  assert.equal(removeExtraSpaces("a\n\n\n\nb"), "a\n\nb");
  assert.equal(removeExtraSpaces("a\n\nb", { blankLines: "remove" }), "a\nb");
  assert.equal(removeExtraSpaces("a\n\n\nb", { blankLines: "keep" }), "a\n\n\nb");
});

test("removePunctuation keeps only what was asked for", () => {
  assert.equal(removePunctuation("Hi, there!"), "Hi there");
  assert.equal(removePunctuation("Hi, there!", { keep: "sentence" }), "Hi, there!");
  assert.equal(removePunctuation("(a) well-known don't", { keep: "words" }), "a well-known don't");
});

test("removePunctuation folds the typographic forms of a kept mark", () => {
  assert.equal(removePunctuation("don’t — stop", { keep: "words" }), "don't  stop");
  // The em dash is not a hyphen, so keeping hyphens must not keep it.
  assert.equal(removePunctuation("a—b", { keep: "words" }), "ab");
  assert.equal(removePunctuation("don’t", { keep: "words", foldQuotes: false }), "don’t");
});

test("removePunctuation leaves symbols alone - they are not punctuation", () => {
  assert.equal(removePunctuation("+44 x=y $5 ~z"), "+44 x=y $5 ~z");
});

test("removeSpecialChars honours the keep set", () => {
  assert.equal(removeSpecialChars("a~b+c", { keep: "alnum" }), "abc");
  assert.equal(removeSpecialChars("a, b~c", { keep: "basic" }), "a, bc");
  assert.equal(removeSpecialChars("café ✓", { keep: "ascii" }), "cafe ");
  assert.equal(removeSpecialChars("café", { keep: "ascii", transliterate: false }), "caf");
  assert.equal(removeSpecialChars("café", { keep: "alnum" }), "café");
});

test("removeSpecialChars drops control characters in every mode", () => {
  assert.equal(removeSpecialChars("a\u0007b", { keep: "alnum" }), "ab");
  assert.equal(removeSpecialChars("a\nb", { keep: "alnum" }), "a\nb");
});

test("removeNumbers standalone mode spares digits inside words", () => {
  assert.equal(removeNumbers("2024 mp3 H2O A4", { mode: "standalone" }), " mp3 H2O A4");
  assert.equal(removeNumbers("3.5kg", { mode: "standalone" }), "3.5kg");
  assert.equal(removeNumbers("costs 1,240.00.", { mode: "standalone" }), "costs .");
});

test("removeNumbers all and listmarkers modes", () => {
  assert.equal(removeNumbers("mp3 in 2024", { mode: "all" }), "mp in ");
  assert.equal(removeNumbers("1. one\n2) two\n  (3) three", { mode: "listmarkers" }),
    "one\ntwo\n  three");
  assert.equal(removeNumbers("2024 only", { mode: "listmarkers" }), "2024 only");
});

test("removeNumbers currency is opt-in", () => {
  assert.equal(removeNumbers("€5 and 10%", { mode: "all" }), "€ and %");
  assert.equal(removeNumbers("€5 and 10%", { mode: "all", currency: true }), " and ");
});

test("removeEmoji takes whole clusters, not codepoints", () => {
  assert.equal(removeEmoji("hi 👍🏿 there"), "hi  there");
  assert.equal(removeEmoji("a🇬🇧b"), "ab");
  assert.equal(removeEmoji("x👨‍👩‍👧y"), "xy");
  assert.equal(removeEmoji("rank 1️⃣"), "rank ");
});

test("removeEmoji keeps text-style symbols unless told otherwise", () => {
  assert.equal(removeEmoji("© 2024"), "© 2024");
  assert.equal(removeEmoji("© 2024", { keepTextSymbols: false }), " 2024");
  assert.equal(removeEmoji("done ✓"), "done ✓");
  assert.equal(removeEmoji("done ✓", { symbols: true }), "done ");
});

test("stripHtmlTags keeps the words and the line structure", () => {
  assert.equal(stripHtmlTags("<p>a <strong>b</strong></p>"), "a b");
  assert.equal(stripHtmlTags("<ul><li>one</li><li>two</li></ul>"), "one\ntwo");
  assert.equal(stripHtmlTags("<p>a</p><p>b</p>", { blockBreaks: false }), "ab");
  assert.equal(stripHtmlTags("a<br>b"), "a\nb");
});

test("stripHtmlTags drops script bodies and decodes entities", () => {
  assert.equal(stripHtmlTags("a<script>var x=1;</script>b"), "ab");
  assert.equal(stripHtmlTags("<!-- note -->a"), "a");
  assert.equal(stripHtmlTags("a &amp; b"), "a & b");
  assert.equal(stripHtmlTags("a &amp; b", { decodeEntities: false }), "a &amp; b");
  assert.equal(stripHtmlTags('<a href="/x?a=1&b=2" title="a>b">link</a>'), "link");
});

test("removeAccents folds the letters NFKD cannot decompose", () => {
  assert.equal(removeAccents("résumé"), "resume");
  assert.equal(removeAccents("Straße"), "Strasse");
  assert.equal(removeAccents("Łódź"), "Lodz");
  assert.equal(removeAccents("Đặng"), "Dang");
});

test("removeAccents never spells out the symbols slugify does", () => {
  assert.equal(removeAccents("12% of €5 & up"), "12% of €5 & up");
});

test("removeAccents modes differ", () => {
  assert.equal(removeAccents("café 你好", { mode: "fold" }), "cafe 你好");
  assert.equal(removeAccents("café 你好", { mode: "ascii" }), "cafe ");
  assert.equal(removeAccents("½", { mode: "marks" }), "½");
  assert.equal(removeAccents("½", { mode: "fold" }), "1⁄2");
});

test("cleanText runs the pipeline in CLEANER_ORDER, not selection order", () => {
  assert.deepEqual(CLEANER_ORDER, [
    "html-tags", "emoji", "accents", "numbers", "punctuation",
    "special-chars", "extra-spaces",
  ]);
  const r = cleanText("<p>Café  2024!</p>", {
    "extra-spaces": true, "html-tags": true, accents: true,
  });
  assert.equal(r.text, "Cafe 2024!");
  assert.deepEqual(r.applied, ["html-tags", "accents", "extra-spaces"]);
});

test("cleanText reports before/after stats and skips unselected cleaners", () => {
  const r = cleanText("a  b", { "extra-spaces": true });
  assert.equal(r.stats.charactersBefore, 4);
  assert.equal(r.stats.charactersAfter, 3);
  assert.equal(r.stats.removed, 1);
  assert.equal(r.stats.wordsBefore, 2);
  assert.deepEqual(cleanText("a  b", {}).text, "a  b");
  assert.deepEqual(cleanText("a  b", {}).applied, []);
});
