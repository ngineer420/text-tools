(() => {
  "use strict";

  /* ======================================================================
     TextKit Pro — core logic
     All functions in this section are pure and DOM-independent so they can
     be unit-tested outside the browser (see README for the dev workflow).
     ====================================================================== */

  /* ---------------------------- stopwords ---------------------------- */

  const STOPWORDS = new Set([
    "a","about","above","after","again","against","all","am","an","and","any",
    "are","aren't","as","at","be","because","been","before","being","below",
    "between","both","but","by","can","can't","cannot","could","couldn't",
    "did","didn't","do","does","doesn't","doing","don't","down","during",
    "each","few","for","from","further","had","hadn't","has","hasn't","have",
    "haven't","having","he","he'd","he'll","he's","her","here","here's",
    "hers","herself","him","himself","his","how","how's","i","i'd","i'll",
    "i'm","i've","if","in","into","is","isn't","it","it's","its","itself",
    "let's","me","more","most","mustn't","my","myself","no","nor","not","of",
    "off","on","once","only","or","other","ought","our","ours","ourselves",
    "out","over","own","same","shan't","she","she'd","she'll","she's",
    "should","shouldn't","so","some","such","than","that","that's","the",
    "their","theirs","them","themselves","then","there","there's","these",
    "they","they'd","they'll","they're","they've","this","those","through",
    "to","too","under","until","up","very","was","wasn't","we","we'd",
    "we'll","we're","we've","were","weren't","what","what's","when","when's",
    "where","where's","which","while","who","who's","whom","why","why's",
    "with","won't","would","wouldn't","you","you'd","you'll","you're",
    "you've","your","yours","yourself","yourselves",
  ]);

  /* ---------------------------- word counter --------------------------- */

  function countWords(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return 0;
    const matches = trimmed.match(/\S+/g);
    return matches ? matches.length : 0;
  }

  function countCharsWithSpaces(text) {
    return (text || "").length;
  }

  function countCharsWithoutSpaces(text) {
    return (text || "").replace(/\s/g, "").length;
  }

  function countSentences(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return 0;
    const parts = trimmed
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return parts.length;
  }

  function countParagraphs(text) {
    const trimmed = (text || "").trim();
    if (!trimmed) return 0;
    const parts = trimmed
      .split(/\n\s*\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    return parts.length;
  }

  function estimateReadingTime(wordCount, wpm) {
    wpm = wpm || 200;
    if (!wordCount) return 0;
    return Math.max(1, Math.ceil(wordCount / wpm));
  }

  function keywordDensity(text, topN) {
    topN = topN || 10;
    const lower = (text || "").toLowerCase();
    const words = lower.match(/[a-z0-9']+/g) || [];
    const filtered = words.filter((w) => w.length > 1 && !STOPWORDS.has(w));
    const total = filtered.length;
    const freq = new Map();
    filtered.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1));
    const arr = Array.from(freq.entries()).map(([word, count]) => ({
      word,
      count,
      percent: total ? Math.round((count / total) * 1000) / 10 : 0,
    }));
    arr.sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    return arr.slice(0, topN);
  }

  /* ---------------------------- case converter ------------------------- */

  function splitIntoWords(text) {
    if (!text) return [];
    return text
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .split(/[^A-Za-z0-9']+/)
      .filter(Boolean);
  }

  function toUpperCase(text) {
    return (text || "").toUpperCase();
  }

  function toLowerCase(text) {
    return (text || "").toLowerCase();
  }

  function toTitleCase(text) {
    if (!text) return "";
    return text.replace(
      /\w\S*/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  }

  function toSentenceCase(text) {
    if (!text) return "";
    const lower = text.toLowerCase();
    return lower.replace(/(^\s*[a-z])|([.!?]\s+[a-z])/g, (m) => m.toUpperCase());
  }

  function toCamelCase(text) {
    const words = splitIntoWords(text).map((w) => w.toLowerCase());
    if (words.length === 0) return "";
    return (
      words[0] +
      words
        .slice(1)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join("")
    );
  }

  function toPascalCase(text) {
    const words = splitIntoWords(text).map((w) => w.toLowerCase());
    return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
  }

  function toSnakeCase(text) {
    const words = splitIntoWords(text).map((w) => w.toLowerCase());
    return words.join("_");
  }

  function toKebabCase(text) {
    const words = splitIntoWords(text).map((w) => w.toLowerCase());
    return words.join("-");
  }

  function toAlternatingCase(text) {
    if (!text) return "";
    let i = 0;
    return text
      .split("")
      .map((ch) => {
        if (/[a-zA-Z]/.test(ch)) {
          const out = i % 2 === 0 ? ch.toLowerCase() : ch.toUpperCase();
          i++;
          return out;
        }
        return ch;
      })
      .join("");
  }

  /* ------------------------- lorem ipsum generator ---------------------- */

  const LOREM_OPENING_WORDS = [
    "Lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipiscing", "elit.",
  ];
  const LOREM_OPENING_SENTENCE = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

  const LOREM_BANK = [
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et",
    "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis",
    "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex",
    "ea", "commodo", "consequat", "duis", "aute", "irure", "in",
    "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat",
    "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non",
    "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit",
    "anim", "id", "est", "laborum", "at", "vero", "eos", "accusamus",
    "iusto", "odio", "dignissimos", "ducimus", "blanditiis",
  ];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomLoremWord() {
    return LOREM_BANK[randomInt(0, LOREM_BANK.length - 1)];
  }

  function buildLoremSentence(wordCount) {
    const words = [];
    for (let i = 0; i < wordCount; i++) words.push(randomLoremWord());
    const sentence = words.join(" ");
    return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
  }

  function generateLoremWords(count) {
    count = Math.max(1, Math.floor(count) || 1);
    const words = [];
    for (let i = 0; i < count; i++) {
      if (i < LOREM_OPENING_WORDS.length) words.push(LOREM_OPENING_WORDS[i]);
      else words.push(randomLoremWord());
    }
    return words.join(" ");
  }

  function generateLoremSentences(count) {
    count = Math.max(1, Math.floor(count) || 1);
    const sentences = [];
    for (let i = 0; i < count; i++) {
      sentences.push(i === 0 ? LOREM_OPENING_SENTENCE : buildLoremSentence(randomInt(6, 14)));
    }
    return sentences.join(" ");
  }

  function generateLoremParagraphs(count) {
    count = Math.max(1, Math.floor(count) || 1);
    const paragraphs = [];
    for (let p = 0; p < count; p++) {
      const sentenceCount = randomInt(4, 7);
      const sentences = [];
      for (let s = 0; s < sentenceCount; s++) {
        sentences.push(
          p === 0 && s === 0 ? LOREM_OPENING_SENTENCE : buildLoremSentence(randomInt(6, 14))
        );
      }
      paragraphs.push(sentences.join(" "));
    }
    return paragraphs.join("\n\n");
  }

  function generateLoremIpsum(count, unit) {
    if (unit === "words") return generateLoremWords(count);
    if (unit === "sentences") return generateLoremSentences(count);
    return generateLoremParagraphs(count);
  }

  /* ---------------------------- diff checker ---------------------------- */

  // Line-based diff using the classic LCS (longest common subsequence) table.
  // O(n*m) time/space — fine for the textarea-sized inputs this tool targets.
  function diffLines(original, changed) {
    const a = (original || "").split("\n");
    const b = (changed || "").split("\n");
    const n = a.length;
    const m = b.length;

    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }

    const result = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (a[i] === b[j]) {
        result.push({ type: "unchanged", line: a[i] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: "removed", line: a[i] });
        i++;
      } else {
        result.push({ type: "added", line: b[j] });
        j++;
      }
    }
    while (i < n) {
      result.push({ type: "removed", line: a[i] });
      i++;
    }
    while (j < m) {
      result.push({ type: "added", line: b[j] });
      j++;
    }
    return result;
  }

  /* ------------------------- find and replace ---------------------------- */

  /**
   * Build the RegExp a search asks for. Literal searches are escaped rather
   * than interpreted, so a user hunting for "$1.00" or "a.b" gets what they
   * typed. Throws on an invalid pattern so the UI can show the parser's own
   * complaint instead of failing silently.
   */
  function buildSearchRegex(pattern, options) {
    const o = options || {};
    const source = o.regex ? pattern : escapeRegExp(pattern);
    let flags = "g";
    if (!o.caseSensitive) flags += "i";
    if (o.multiline) flags += "m";
    if (o.dotAll) flags += "s";
    return new RegExp(source, flags);
  }

  function escapeRegExp(s) {
    return String(s == null ? "" : s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Collect matches with their capture groups.
   * A zero-length match (`\b`, `a*`, a lone `^`) would spin forever without
   * the manual lastIndex bump, so that is handled rather than hoped about.
   * @returns {{matches: Array, total: number, truncated: boolean}}
   */
  function findMatches(text, regex, limit) {
    const cap = typeof limit === "number" ? limit : 200;
    const src = String(text == null ? "" : text);
    const re = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
    const matches = [];
    let total = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
      total++;
      if (matches.length < cap) {
        matches.push({
          index: m.index,
          text: m[0],
          groups: m.slice(1).map((g) => (g === undefined ? null : g)),
        });
      }
      if (m[0] === "") re.lastIndex++;
      if (total > 100000) break; // pathological pattern guard
    }
    return { matches, total, truncated: total > matches.length };
  }

  /**
   * Replace, honouring $1…$9, $& and $$ in the replacement when in regex mode.
   * In literal mode the replacement is inserted verbatim — someone replacing
   * with "$100" means one hundred dollars, not capture group 1 plus "00".
   */
  function applyReplacement(text, regex, replacement, isRegexMode) {
    const src = String(text == null ? "" : text);
    const value = String(replacement == null ? "" : replacement);
    if (isRegexMode) return src.replace(regex, value);
    return src.replace(regex, () => value);
  }

  /** A one-line preview of what each capture group caught. */
  function describeGroups(match) {
    if (!match.groups.length) return "";
    return match.groups
      .map((g, i) => "$" + (i + 1) + "=" + (g === null ? "(no match)" : JSON.stringify(g)))
      .join("  ");
  }

  /* --------------------------- sort and dedupe --------------------------- */

  function splitLines(text) {
    return String(text == null ? "" : text).replace(/\r\n?/g, "\n").split("\n");
  }

  /**
   * Leading number of a line, for numeric sorting. Lines without one sort to
   * the end rather than pretending to be zero, which would scatter them
   * through the numbers.
   */
  function leadingNumber(line) {
    const m = /^\s*[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/.exec(line);
    if (!m) return null;
    const n = parseFloat(m[0]);
    return Number.isFinite(n) ? n : null;
  }

  /** Compare "file2" before "file10" the way a person would. */
  function naturalCompare(a, b) {
    const re = /(\d+)|(\D+)/g;
    const ax = String(a).match(re) || [];
    const bx = String(b).match(re) || [];
    for (let i = 0; i < Math.min(ax.length, bx.length); i++) {
      const an = /^\d/.test(ax[i]);
      const bn = /^\d/.test(bx[i]);
      if (an && bn) {
        const d = parseInt(ax[i], 10) - parseInt(bx[i], 10);
        if (d) return d;
      } else if (ax[i] !== bx[i]) {
        return ax[i] < bx[i] ? -1 : 1;
      }
    }
    return ax.length - bx.length;
  }

  function dedupeLines(lines, options) {
    const o = options || {};
    const keepLast = o.keep === "last";
    const key = (l) => (o.caseSensitive ? l : l.toLowerCase());
    if (keepLast) {
      const lastIndex = new Map();
      lines.forEach((l, i) => lastIndex.set(key(l), i));
      return lines.filter((l, i) => lastIndex.get(key(l)) === i);
    }
    const seen = new Set();
    return lines.filter((l) => {
      const k = key(l);
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  function sortLineArray(lines, options) {
    const o = options || {};
    const mode = o.mode || "alpha";
    const out = lines.slice();
    let cmp;
    if (mode === "length") cmp = (a, b) => a.length - b.length || a.localeCompare(b);
    else if (mode === "numeric") {
      cmp = (a, b) => {
        const na = leadingNumber(a);
        const nb = leadingNumber(b);
        if (na === null && nb === null) return a.localeCompare(b);
        if (na === null) return 1;   // numberless lines sink to the bottom
        if (nb === null) return -1;
        return na - nb || a.localeCompare(b);
      };
    } else if (mode === "natural") cmp = naturalCompare;
    else if (o.caseSensitive) cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    else cmp = (a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }) || (a < b ? -1 : a > b ? 1 : 0);

    out.sort(cmp);
    if (o.direction === "desc") out.reverse();
    return out;
  }

  /**
   * The whole line pipeline, in the order the options are presented.
   * @returns {{text: string, stats: {input, output, duplicates, blanks}}}
   */
  function processLines(text, options) {
    const o = options || {};
    let lines = splitLines(text);
    const inputCount = lines.length;

    if (o.trim) lines = lines.map((l) => l.trim());
    let blanks = 0;
    if (o.removeBlank) {
      const before = lines.length;
      lines = lines.filter((l) => l.trim() !== "");
      blanks = before - lines.length;
    }

    let duplicates = 0;
    if (o.dedupe && o.dedupe !== "none") {
      const before = lines.length;
      lines = dedupeLines(lines, { keep: o.dedupe, caseSensitive: o.caseSensitive });
      duplicates = before - lines.length;
    }

    if (o.mode === "reverse") lines.reverse();
    else if (o.mode === "shuffle") lines = shuffleLines(lines);
    else if (o.mode && o.mode !== "none") {
      lines = sortLineArray(lines, { mode: o.mode, direction: o.direction, caseSensitive: o.caseSensitive });
    }

    return {
      text: lines.join("\n"),
      stats: { input: inputCount, output: lines.length, duplicates, blanks },
    };
  }

  function shuffleLines(lines) {
    const out = lines.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = out[i];
      out[i] = out[j];
      out[j] = t;
    }
    return out;
  }

  /* ------------------------------ CSV ↔ JSON ----------------------------- */

  const CSV_DELIMITERS = [",", ";", "\t", "|"];

  /**
   * Guess the delimiter by which candidate gives the most consistent column
   * count over the first lines. Raw occurrence counting gets fooled by prose
   * full of commas; consistency does not.
   */
  function detectDelimiter(text) {
    const sample = String(text || "").split(/\r?\n/).filter((l) => l.trim() !== "").slice(0, 20);
    if (!sample.length) return ",";
    let best = ",";
    let bestScore = -1;
    CSV_DELIMITERS.forEach((delim) => {
      const counts = sample.map((line) => parseCsv(line, delim)[0].length);
      if (counts[0] < 2) return;
      const consistent = counts.filter((c) => c === counts[0]).length / counts.length;
      const score = consistent * 100 + Math.min(counts[0], 20);
      if (score > bestScore) {
        bestScore = score;
        best = delim;
      }
    });
    return best;
  }

  /** RFC 4180 reader: "" is a literal quote and a newline inside quotes is data. */
  function parseCsv(text, delimiter) {
    const delim = delimiter || ",";
    const src = String(text == null ? "" : text);
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"') {
          if (src[i + 1] === '"') { field += '"'; i++; }
          else inQuotes = false;
        } else field += ch;
        continue;
      }
      if (ch === '"') { inQuotes = true; continue; }
      if (ch === delim) { row.push(field); field = ""; continue; }
      if (ch === "\r") {
        if (src[i + 1] === "\n") i++;
        row.push(field); field = ""; rows.push(row); row = [];
        continue;
      }
      if (ch === "\n") { row.push(field); field = ""; rows.push(row); row = []; continue; }
      field += ch;
    }
    row.push(field);
    rows.push(row);
    while (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === "") rows.pop();
    return rows;
  }

  /** Numbers and booleans come back typed; everything else stays a string. */
  function coerceCell(value) {
    const v = String(value);
    const t = v.trim();
    if (t === "") return "";
    if (t === "true") return true;
    if (t === "false") return false;
    if (t === "null") return null;
    // Only plain numeric literals — "007" and "+1 555" must stay strings.
    if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][-+]?\d+)?$/.test(t)) {
      const n = Number(t);
      if (Number.isFinite(n) && String(n) === t) return n;
    }
    return v;
  }

  function csvToJson(text, options) {
    const o = options || {};
    const delim = o.delimiter || detectDelimiter(text);
    const rows = parseCsv(text, delim);
    if (!rows.length) return [];
    const typed = o.coerceTypes !== false;
    const cell = (v) => (typed ? coerceCell(v) : String(v));
    if (o.hasHeader === false) return rows.map((r) => r.map(cell));
    const header = rows[0].map((h, i) => String(h).trim() || "column" + (i + 1));
    return rows.slice(1).map((r) => {
      const obj = {};
      header.forEach((name, i) => { obj[name] = cell(r[i] === undefined ? "" : r[i]); });
      return obj;
    });
  }

  /** Quote a cell only where the format requires it. */
  function csvEscape(value, delimiter) {
    const s = value === null || value === undefined ? "" : String(value);
    if (s === "") return "";
    if (s.indexOf(delimiter) >= 0 || /["\n\r]/.test(s) || /^\s|\s$/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }

  /**
   * JSON → CSV. Accepts an array of objects (keys become the header, unioned
   * across every row so a sparse record does not lose a column), an array of
   * arrays, or a single object.
   */
  function jsonToCsv(value, options) {
    const o = options || {};
    const delim = o.delimiter || ",";
    let data = value;
    if (data && !Array.isArray(data) && typeof data === "object") data = [data];
    if (!Array.isArray(data) || data.length === 0) return "";

    if (Array.isArray(data[0])) {
      return data.map((row) => row.map((c) => csvEscape(c, delim)).join(delim)).join("\n");
    }

    const header = [];
    const seen = new Set();
    data.forEach((row) => {
      if (!row || typeof row !== "object") return;
      Object.keys(row).forEach((k) => {
        if (!seen.has(k)) { seen.add(k); header.push(k); }
      });
    });

    const lines = [];
    if (o.includeHeader !== false) lines.push(header.map((h) => csvEscape(h, delim)).join(delim));
    data.forEach((row) => {
      lines.push(
        header
          .map((key) => {
            const v = row && typeof row === "object" ? row[key] : undefined;
            // A nested object or array has no flat CSV form; JSON is the
            // least-lossy thing to put in the cell.
            if (v !== null && typeof v === "object") return csvEscape(JSON.stringify(v), delim);
            return csvEscape(v, delim);
          })
          .join(delim)
      );
    });
    return lines.join("\n");
  }

  /* -------------------------------- slugify ------------------------------ */

  // Characters that NFKD will not decompose into "letter + accent".
  const TRANSLITERATIONS = {
    "ß": "ss", "æ": "ae", "Æ": "ae", "œ": "oe", "Œ": "oe", "ø": "o", "Ø": "o",
    "đ": "d", "Đ": "d", "ð": "d", "Ð": "d", "þ": "th", "Þ": "th", "ł": "l",
    "Ł": "l", "ı": "i", "ħ": "h", "ŋ": "n", "ĸ": "k", "€": "euro", "£": "gbp",
    "$": "dollar", "&": "and", "@": "at", "%": "percent", "©": "c", "®": "r",
    "№": "no", "°": "deg", "µ": "u", "«": "", "»": "", "“": "", "”": "",
    "‘": "", "’": "", "…": "",
  };

  function transliterate(text) {
    let out = "";
    for (const ch of String(text == null ? "" : text)) {
      out += Object.prototype.hasOwnProperty.call(TRANSLITERATIONS, ch) ? TRANSLITERATIONS[ch] : ch;
    }
    // NFKD splits "é" into "e" + combining acute; drop the accents that leaves.
    return out.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Text → URL-safe slug.
   * @param {{separator, lowercase, transliterate, maxLength, keepUnicode}} options
   */
  function slugify(text, options) {
    const o = options || {};
    const sep = o.separator === undefined ? "-" : o.separator;
    let s = String(text == null ? "" : text);

    if (o.transliterate !== false) s = transliterate(s);
    if (o.lowercase !== false) s = s.toLowerCase();

    // Apostrophes are deleted rather than treated as a word boundary, so
    // "Beginner's Guide" slugs to "beginners-guide" and not "beginner-s-guide".
    // Every mainstream slug helper does this; a lone "s" segment reads as noise.
    s = s.replace(/['‘’ʼ]/g, "");

    // Keep letters and digits; everything else becomes a separator boundary.
    // keepUnicode leaves non-Latin scripts intact, which modern browsers and
    // search engines handle fine and which is the only sane option for a
    // Cyrillic or CJK title.
    const strip = o.keepUnicode ? /[^\p{L}\p{N}]+/gu : /[^A-Za-z0-9]+/g;
    // An empty separator just deletes the run outright; there is no need for
    // a placeholder pass, and a literal NUL in the source would make this file
    // read as binary to git and grep.
    s = s.replace(strip, sep);

    if (sep) {
      const escaped = escapeRegExp(sep);
      s = s.replace(new RegExp(escaped + "{2,}", "g"), sep);
      s = s.replace(new RegExp("^" + escaped + "+|" + escaped + "+$", "g"), "");
    }

    if (o.maxLength && s.length > o.maxLength) {
      s = s.slice(0, o.maxLength);
      if (sep) s = s.replace(new RegExp(escapeRegExp(sep) + "+$"), "");
    }
    return s;
  }

  /* ---------------------------- text statistics --------------------------- */

  const ABBREVIATIONS = ["mr", "mrs", "ms", "dr", "prof", "sr", "jr", "st", "vs", "etc", "e.g", "i.e", "fig", "no", "inc", "ltd", "approx"];

  /**
   * Split into sentences. A plain /[.!?]/ split breaks on "Dr. Smith" and on
   * "3.5", so abbreviations and decimals are stitched back together.
   */
  function splitSentences(text) {
    const src = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
    if (!src) return [];
    const rough = src.match(/[^.!?]+[.!?]*/g) || [];
    const out = [];
    rough.forEach((chunk) => {
      const prev = out.length ? out[out.length - 1] : null;
      const lastWord = prev ? (prev.trim().split(/\s+/).pop() || "").replace(/[.!?]+$/, "").toLowerCase() : "";
      const glue =
        prev &&
        (ABBREVIATIONS.indexOf(lastWord) >= 0 ||
          /\d$/.test(prev.replace(/[.!?]+$/, "")) && /^\s*\d/.test(chunk));
      if (glue) out[out.length - 1] = prev + chunk;
      else out.push(chunk);
    });
    return out.map((s) => s.trim()).filter(Boolean);
  }

  /**
   * Syllable count by the standard vowel-group heuristic: count vowel runs,
   * drop a silent trailing "e", and never return less than one. It is an
   * estimate — every readability formula in common use is built on one.
   */
  function countSyllables(word) {
    const w = String(word || "").toLowerCase().replace(/[^a-z]/g, "");
    if (!w) return 0;
    if (w.length <= 3) return 1;
    let s = w
      .replace(/(?:[^laeiouy]es|[^laeiouy]e)$/, "")
      .replace(/^y/, "");
    // Each contiguous run of vowels is one syllable nucleus. Capping the run
    // at two letters would split "beautiful" into bea-u-ti-ful (4) and "queue"
    // into que-ue (2); an unbounded run gets both right, and the Flesch scores
    // built on this count are only as good as it is.
    const groups = s.match(/[aeiouy]+/g);
    return Math.max(1, groups ? groups.length : 1);
  }

  function fleschReadingEase(words, sentences, syllables) {
    if (!words || !sentences) return null;
    return 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  }

  function fleschKincaidGrade(words, sentences, syllables) {
    if (!words || !sentences) return null;
    return 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  }

  function readingEaseLabel(score) {
    if (score === null) return "—";
    if (score >= 90) return "Very easy (5th grade)";
    if (score >= 80) return "Easy (6th grade)";
    if (score >= 70) return "Fairly easy (7th grade)";
    if (score >= 60) return "Plain English (8th–9th grade)";
    if (score >= 50) return "Fairly difficult (10th–12th grade)";
    if (score >= 30) return "Difficult (college)";
    return "Very difficult (graduate)";
  }

  /** Everything the statistics tool reports, in one pass. */
  function textStatistics(text, options) {
    const o = options || {};
    const wpm = o.wpm || 200;
    const spm = o.spm || 130; // speaking is slower than reading
    const src = String(text == null ? "" : text);

    const wordList = src.match(/\S+/g) || [];
    const words = wordList.length;
    const sentenceList = splitSentences(src);
    const sentences = sentenceList.length;
    const syllables = wordList.reduce((n, w) => n + countSyllables(w), 0);

    let longest = null;
    sentenceList.forEach((s) => {
      const n = (s.match(/\S+/g) || []).length;
      if (!longest || n > longest.words) longest = { text: s, words: n };
    });

    const ease = fleschReadingEase(words, sentences, syllables);
    const grade = fleschKincaidGrade(words, sentences, syllables);

    return {
      words,
      characters: src.length,
      charactersNoSpaces: src.replace(/\s/g, "").length,
      sentences,
      paragraphs: countParagraphs(src),
      syllables,
      readingMinutes: words ? words / wpm : 0,
      speakingMinutes: words ? words / spm : 0,
      avgWordsPerSentence: sentences ? words / sentences : 0,
      avgSyllablesPerWord: words ? syllables / words : 0,
      avgWordLength: words ? wordList.reduce((n, w) => n + w.replace(/[^\p{L}\p{N}]/gu, "").length, 0) / words : 0,
      longestSentence: longest,
      readingEase: ease,
      readingEaseLabel: readingEaseLabel(ease),
      gradeLevel: grade,
      uniqueWords: new Set(wordList.map((w) => w.toLowerCase().replace(/[^\p{L}\p{N}']/gu, ""))).size,
    };
  }

  /** "1 min 40 sec" reads better than "1.67 minutes" for a short piece. */
  function formatDuration(minutes) {
    if (!minutes) return "—";
    const totalSeconds = Math.max(1, Math.round(minutes * 60));
    if (totalSeconds < 60) return totalSeconds + " sec";
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return secs ? mins + " min " + secs + " sec" : mins + " min";
  }

  /* ---------------------------- HTML → Markdown --------------------------- */

  const HTML_ENTITIES = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–",
    mdash: "—", hellip: "…", lsquo: "‘", rsquo: "’", ldquo: "“",
    rdquo: "”", copy: "©", reg: "®", trade: "™", middot: "·", bull: "•",
  };

  function decodeEntities(text) {
    return String(text == null ? "" : text).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body) => {
      if (body[0] === "#") {
        const code = body[1] === "x" || body[1] === "X"
          ? parseInt(body.slice(2), 16)
          : parseInt(body.slice(1), 10);
        return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
      }
      const named = HTML_ENTITIES[body.toLowerCase()];
      return named === undefined ? whole : named;
    });
  }

  function parseAttributes(tagBody) {
    const attrs = {};
    const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
    let m;
    while ((m = re.exec(tagBody)) !== null) {
      attrs[m[1].toLowerCase()] = decodeEntities(m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : m[5]);
    }
    return attrs;
  }

  /**
   * Rows of cells → a GFM pipe table. Every row is padded to the widest row so
   * the delimiter line matches the header; a `|` inside a cell is escaped
   * because it would otherwise start a new column.
   */
  function renderMarkdownTable(rows) {
    const width = rows.reduce((w, r) => Math.max(w, r.length), 0);
    if (!width) return "";
    const line = (cells) =>
      "| " +
      Array.from({ length: width }, (_, i) => String(cells[i] === undefined ? "" : cells[i]).replace(/\|/g, "\\|"))
        .join(" | ") +
      " |";
    const out = [line(rows[0]), "| " + Array.from({ length: width }, () => "---").join(" | ") + " |"];
    rows.slice(1).forEach((r) => out.push(line(r)));
    return out.join("\n");
  }

  /**
   * HTML → Markdown for the subset Markdown can actually express.
   *
   * This walks tags with a scanner rather than a DOM, so it runs identically
   * in node and the browser and stays testable. It is deliberately not a
   * general HTML parser: anything it does not recognise contributes its text
   * and nothing else, which is the right failure mode for a converter — you
   * lose formatting, never content.
   */
  function htmlToMarkdown(html) {
    const src = String(html == null ? "" : html)
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");

    // A stack of output buffers. Blockquotes and link labels need their
    // content collected before it can be written — a quote has to prefix
    // every one of its lines with "> ", and a link's label has to be known
    // before "[label](href)" can be emitted — so they push a buffer and pop
    // it when they close. Everything else writes straight to the top.
    const buffers = [""];
    const listStack = [];
    const linkHrefs = [];
    const tableStack = [];
    let inPre = false;

    const top = () => buffers[buffers.length - 1];
    const write = (s) => { buffers[buffers.length - 1] += s; };
    const push = () => buffers.push("");
    const pop = () => buffers.pop();

    // Collapse to at most one blank line, and never open with one.
    //
    // The marker test has to run BEFORE trailing spaces are stripped: a buffer
    // sitting on a freshly written list marker ends in "- " or "1. ", and that
    // trailing space is the only thing distinguishing it from a finished line
    // of text. `<li><p>text</p></li>` — which is what most CMSs emit — would
    // otherwise have its marker stripped to "-" and then be split from its own
    // content by the paragraph break, giving "-\n\ntext" instead of "- text".
    const block = (blank) => {
      if (/(?:^|\n)[ \t]*(?:[-*]|\d+\.)[ \t]+$/.test(top())) return;
      const cur = top().replace(/[ \t]+$/, "");
      buffers[buffers.length - 1] = cur;
      if (cur === "") return;
      const trailing = /\n*$/.exec(cur)[0].length;
      write("\n".repeat(Math.max(0, (blank ? 2 : 1) - trailing)));
    };

    const tokens = src.split(/(<[^>]+>)/);
    tokens.forEach((token) => {
      if (!token) return;

      if (token[0] !== "<") {
        let text = decodeEntities(token);
        if (!inPre) {
          text = text.replace(/\s+/g, " ");
          // Whitespace between block tags is layout, not content.
          if (/^\s*$/.test(text) && /(?:\n|^)$/.test(top())) return;
        }
        write(text);
        return;
      }

      const closing = token[1] === "/";
      const nameMatch = /^<\/?\s*([a-zA-Z][a-zA-Z0-9-]*)/.exec(token);
      if (!nameMatch) return;
      const tag = nameMatch[1].toLowerCase();
      const attrs = closing ? {} : parseAttributes(token.slice(1 + tag.length, -1));

      switch (tag) {
        case "br":
          write(inPre ? "\n" : "  \n");
          break;
        case "hr":
          block(true);
          write("---\n\n");
          break;
        case "h1": case "h2": case "h3": case "h4": case "h5": case "h6":
          block(true);
          if (!closing) write("#".repeat(Number(tag[1])) + " ");
          break;
        case "p": case "div": case "section": case "article": case "header":
        case "footer": case "main": case "figure": case "figcaption":
          block(true);
          break;
        case "blockquote":
          if (closing) {
            const inner = pop().trim();
            block(true);
            write(inner.split("\n").map((l) => (l === "" ? ">" : "> " + l)).join("\n"));
            block(true);
          } else {
            block(true);
            push();
          }
          break;
        case "ul": case "ol":
          // A list nested inside an <li> continues the line above it, so it
          // gets a single newline. Only a top-level list opens a new block —
          // a blank line before a nested item would end the outer list.
          if (closing) { listStack.pop(); block(!listStack.length); }
          else { block(!listStack.length); listStack.push({ type: tag, index: 0 }); }
          break;
        case "li": {
          if (closing) { block(false); break; }
          block(false);
          const list = listStack[listStack.length - 1] || { type: "ul", index: 0 };
          list.index++;
          const indent = "  ".repeat(Math.max(0, listStack.length - 1));
          write(indent + (list.type === "ol" ? list.index + ". " : "- "));
          break;
        }
        case "pre":
          if (closing) {
            inPre = false;
            buffers[buffers.length - 1] = top().replace(/\n*$/, "\n");
            write("```\n\n");
          } else {
            block(true);
            inPre = true;
            write("```\n");
          }
          break;
        case "code":
          if (!inPre) write("`");
          break;
        case "strong": case "b":
          write("**");
          break;
        case "em": case "i":
          write("*");
          break;
        case "del": case "s": case "strike":
          write("~~");
          break;
        case "a":
          if (closing) {
            const label = pop();
            const href = linkHrefs.pop() || "";
            write(href ? "[" + label.trim() + "](" + href + ")" : label);
          } else {
            linkHrefs.push(attrs.href || "");
            push();
          }
          break;
        case "img":
          write("![" + (attrs.alt || "") + "](" + (attrs.src || "") + ")");
          break;
        // Tables cannot be streamed out cell by cell. A GFM table needs a
        // `| --- |` delimiter row whose width is only known once the first row
        // has been counted, so cells are buffered into rows and the whole
        // table is written when it closes.
        case "table":
          if (closing) {
            const t = tableStack.pop();
            block(true);
            if (t && t.rows.length) write(renderMarkdownTable(t.rows));
            block(true);
          } else {
            block(true);
            tableStack.push({ rows: [], row: null });
          }
          break;
        case "tr": {
          const t = tableStack[tableStack.length - 1];
          if (!t) break;
          if (closing) {
            if (t.row) t.rows.push(t.row);
            t.row = null;
          } else t.row = [];
          break;
        }
        case "td": case "th": {
          const t = tableStack[tableStack.length - 1];
          if (!t || !t.row) break;
          if (closing) t.row.push(pop().replace(/\s+/g, " ").trim());
          else push();
          break;
        }
        default:
          break;
      }
    });

    // An unclosed <a> or <blockquote> must not swallow the rest of the page.
    while (buffers.length > 1) {
      const inner = pop();
      write(inner);
    }

    return buffers[0]
      .replace(/[ \t]+\n/g, (m) => (m.length >= 3 && m.slice(-3) === "  \n" ? "  \n" : "\n"))
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n";
  }

  /* ============================================================
     Export pure functions for Node-based sanity checks (see README).
     In the browser this block is skipped and the IIFE below runs.
     ============================================================ */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      STOPWORDS,
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
      fleschKincaidGrade,
      readingEaseLabel,
      textStatistics,
      formatDuration,
      decodeEntities,
      htmlToMarkdown,
      countWords,
      countCharsWithSpaces,
      countCharsWithoutSpaces,
      countSentences,
      countParagraphs,
      estimateReadingTime,
      keywordDensity,
      splitIntoWords,
      toUpperCase,
      toLowerCase,
      toTitleCase,
      toSentenceCase,
      toCamelCase,
      toPascalCase,
      toSnakeCase,
      toKebabCase,
      toAlternatingCase,
      generateLoremWords,
      generateLoremSentences,
      generateLoremParagraphs,
      generateLoremIpsum,
      diffLines,
    };
  }

  /* ======================================================================
     Browser wiring — everything below touches the DOM.
     ====================================================================== */
  if (typeof document === "undefined") return;

  function flash(el) {
    if (!el) return;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 1100);
  }

  async function copyText(text, flashEl) {
    try {
      await navigator.clipboard.writeText(text);
      flash(flashEl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      flash(flashEl);
    }
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  /* ---------------------------- theme toggle ---------------------------- */

  (function initTheme() {
    const stored = localStorage.getItem("tk-theme");
    if (stored) document.documentElement.setAttribute("data-theme", stored);
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") ||
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("tk-theme", next);
    });
  })();

  /* ==================================================================== *
   * toolbar v1 — the portfolio navigation pattern.                       *
   * Spec: github.com/ngineer420/ngineer420.github.io/issues/13          *
   *                                                                     *
   * Copy this block verbatim into any site in the portfolio. It is pure *
   * enhancement: with JS off, <details>/<summary> still discloses the   *
   * sheet, the rail is still a native scroll container of real links,   *
   * the edge fades are still CSS and the scrim is still CSS. Only the   *
   * active-chip centring, Escape and click-outside are lost.            *
   * ================================================================== */
  function initToolbar() {
    var bar = document.querySelector(".toolbar");
    if (!bar) return;
    var rail = bar.querySelector(".tb-rail");
    var menu = bar.querySelector("details.tb-menu");

    if (rail) {
      // js-on hands the right-hand fade over to measurement. Until then the
      // CSS keeps it on, so a JS-disabled visitor never gets a chip clipped
      // mid-word with nothing to say there is more of the row.
      rail.classList.add("js-on");
      var fades = function () {
        var max = rail.scrollWidth - rail.clientWidth;
        rail.classList.toggle("can-l", rail.scrollLeft > 1);
        rail.classList.toggle("can-r", rail.scrollLeft < max - 1);
      };
      // Assigning scrollLeft, never scrollIntoView: that also scrolls every
      // ancestor and the document, which on a phone drops the visitor below
      // the header on arrival.
      var current = rail.querySelector("[aria-current]");
      if (current) {
        rail.scrollLeft = Math.max(
          0,
          current.offsetLeft - (rail.clientWidth - current.offsetWidth) / 2
        );
      }
      rail.addEventListener("scroll", fades, { passive: true });
      window.addEventListener("resize", fades);
      fades();
    }

    if (menu) {
      // A disclosure, not a modal: focus is deliberately not trapped, Tab
      // walks the links and straight out the other side.
      window.addEventListener("keydown", function (e) {
        if (e.key !== "Escape" || !menu.open) return;
        menu.open = false;
        var summary = menu.querySelector("summary");
        if (summary) summary.focus();
      });
      document.addEventListener("click", function (e) {
        if (menu.open && !menu.contains(e.target)) menu.open = false;
      });
    }
  }

  /* ---- homepage: the toolbar's own links switch the ten tool panels ----
   *
   * The homepage carries all ten tools on one page. The toolbar is the only
   * nav layer, so its links do double duty here: a plain left click swaps the
   * panel in place and pushes that tool's real address, exactly as the old tab
   * strip did, while a modified click, a JS-disabled visitor and every crawler
   * get ordinary navigation to the standalone page, which is the same tool.
   */
  function initHomePanels() {
    var bar = document.querySelector(".toolbar");
    if (!bar) return;
    var PANELS = {
      "/word-counter": "panel-wordcount",
      "/case-converter": "panel-case",
      "/lorem-ipsum-generator": "panel-lorem",
      "/diff-checker": "panel-diff",
      "/find-and-replace": "panel-find",
      "/sort-and-dedupe-lines": "panel-sort",
      "/markdown-to-html": "panel-markdown",
      "/csv-to-json": "panel-csv",
      "/slugify": "panel-slug",
      "/text-statistics": "panel-stats",
    };
    var keys = Object.keys(PANELS);
    var panels = {};
    for (var i = 0; i < keys.length; i++) {
      var el = document.getElementById(PANELS[keys[i]]);
      if (!el) return; // a standalone tool page: no panels to switch
      panels[keys[i]] = el;
    }
    var links = Array.prototype.slice.call(bar.querySelectorAll("a[href]"));
    var rail = bar.querySelector(".tb-rail");
    var menu = bar.querySelector("details.tb-menu");

    function pathOf(a) {
      return (a.getAttribute("href") || "").replace(/\.html$/, "").replace(/\/$/, "");
    }

    function show(path, moveFocus) {
      keys.forEach(function (k) {
        var on = k === path;
        panels[k].hidden = !on;
        panels[k].classList.toggle("active", on);
      });
      links.forEach(function (a) {
        if (pathOf(a) === path) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      if (rail) {
        var cur = rail.querySelector("[aria-current]");
        if (cur) {
          rail.scrollLeft = Math.max(
            0,
            cur.offsetLeft - (rail.clientWidth - cur.offsetWidth) / 2
          );
        }
      }
      if (moveFocus) panels[path].focus();
    }

    links.forEach(function (a) {
      var path = pathOf(a);
      if (!panels[path]) return;
      a.addEventListener("click", function (e) {
        // Modified and non-primary clicks fall through to real navigation so
        // middle-click and cmd/ctrl-click still open the standalone page.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        if (menu) menu.open = false;
        show(path, true);
        try {
          history.pushState({ tool: path }, "", path);
        } catch (err) {
          /* history unavailable — the anchor is still a real link */
        }
      });
    });

    window.addEventListener("popstate", function (e) {
      var path = (e.state && e.state.tool) || null;
      if (!path || !panels[path]) {
        path = location.pathname.replace(/\.html$/, "").replace(/\/$/, "");
      }
      show(panels[path] ? path : keys[0], false);
    });

    // Default panel = the Word Counter, this site's most-visited tool. Seed a
    // baseline history entry so Back after switching returns here cleanly.
    show(keys[0], false);
    try {
      history.replaceState({ tool: keys[0] }, "", location.pathname + location.search);
    } catch (err) {
      /* ignore */
    }
  }

  initToolbar();
  initHomePanels();

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------- word counter tool ------------------------ */

  (function wordCounterTool() {
    const input = document.getElementById("wc-input");
    if (!input) return;
    const elWords = document.getElementById("wc-words");
    const elCharsSpaces = document.getElementById("wc-chars-spaces");
    const elCharsNoSpaces = document.getElementById("wc-chars-nospaces");
    const elSentences = document.getElementById("wc-sentences");
    const elParagraphs = document.getElementById("wc-paragraphs");
    const elReadTime = document.getElementById("wc-readtime");
    const densityBody = document.getElementById("wc-density-body");
    const densityEmpty = document.getElementById("wc-density-empty");

    function render() {
      const text = input.value;
      const words = countWords(text);
      elWords.textContent = words.toLocaleString();
      elCharsSpaces.textContent = countCharsWithSpaces(text).toLocaleString();
      elCharsNoSpaces.textContent = countCharsWithoutSpaces(text).toLocaleString();
      elSentences.textContent = countSentences(text).toLocaleString();
      elParagraphs.textContent = countParagraphs(text).toLocaleString();
      const mins = estimateReadingTime(words);
      elReadTime.textContent = mins ? `${mins} min` : "—";

      const density = keywordDensity(text, 10);
      densityBody.innerHTML = "";
      if (density.length === 0) {
        densityEmpty.style.display = "";
      } else {
        densityEmpty.style.display = "none";
        density.forEach((row) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${escapeHtml(row.word)}</td><td>${row.count}</td><td>${row.percent}%</td>`;
          densityBody.appendChild(tr);
        });
      }
    }

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[c]));
    }

    input.addEventListener("input", debounce(render, 80));
    render();
  })();

  /* ---------------------------- case converter tool ----------------------- */

  (function caseConverterTool() {
    const input = document.getElementById("case-input");
    if (!input) return;
    const output = document.getElementById("case-output");
    const copyBtn = document.getElementById("case-copy");
    const copyFlash = document.getElementById("case-copy-flash");
    const buttons = Array.from(document.querySelectorAll(".case-btn"));

    const CONVERTERS = {
      upper: toUpperCase,
      lower: toLowerCase,
      title: toTitleCase,
      sentence: toSentenceCase,
      camel: toCamelCase,
      pascal: toPascalCase,
      snake: toSnakeCase,
      kebab: toKebabCase,
      alternating: toAlternatingCase,
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const fn = CONVERTERS[btn.dataset.case];
        if (!fn) return;
        output.value = fn(input.value);
        buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      });
    });

    copyBtn.addEventListener("click", () => {
      if (output.value) copyText(output.value, copyFlash);
    });
  })();

  /* ------------------------- lorem ipsum generator tool -------------------- */

  (function loremIpsumTool() {
    const countInput = document.getElementById("lorem-count");
    if (!countInput) return;
    const unitSelect = document.getElementById("lorem-unit");
    const generateBtn = document.getElementById("lorem-generate");
    const output = document.getElementById("lorem-output");
    const copyBtn = document.getElementById("lorem-copy");
    const copyFlash = document.getElementById("lorem-copy-flash");

    function generate() {
      const count = parseInt(countInput.value, 10) || 1;
      output.value = generateLoremIpsum(count, unitSelect.value);
    }

    generateBtn.addEventListener("click", generate);
    copyBtn.addEventListener("click", () => {
      if (output.value) copyText(output.value, copyFlash);
    });

    generate();
  })();

  /* ---------------------------- diff checker tool -------------------------- */

  (function diffCheckerTool() {
    const originalInput = document.getElementById("diff-original");
    if (!originalInput) return;
    const changedInput = document.getElementById("diff-changed");
    const compareBtn = document.getElementById("diff-compare");
    const resultEl = document.getElementById("diff-result");
    const emptyMsg = document.getElementById("diff-empty");

    function escapeHtml(s) {
      return s.replace(/[&<>"']/g, (c) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
      }[c]));
    }

    function render() {
      const rows = diffLines(originalInput.value, changedInput.value);
      resultEl.innerHTML = "";
      if (!originalInput.value && !changedInput.value) {
        emptyMsg.style.display = "";
        resultEl.style.display = "none";
        return;
      }
      emptyMsg.style.display = "none";
      resultEl.style.display = "";
      rows.forEach((row) => {
        const div = document.createElement("div");
        div.className = `diff-line diff-${row.type}`;
        const marker = row.type === "added" ? "+" : row.type === "removed" ? "-" : " ";
        div.innerHTML = `<span class="diff-marker">${marker}</span><span class="diff-text">${escapeHtml(row.line) || "&nbsp;"}</span>`;
        resultEl.appendChild(div);
      });
    }

    compareBtn.addEventListener("click", render);
    render();
  })();

  /* --------------------------- shared DOM helpers ------------------------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  /** Wire a Copy button to whatever the getter returns. */
  function wireCopy(btnId, flashId, getText) {
    const btn = document.getElementById(btnId);
    const flashEl = document.getElementById(flashId);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const text = getText();
      if (text) copyText(text, flashEl);
    });
  }

  function setError(el, message) {
    if (!el) return;
    el.textContent = message || "";
    el.style.display = message ? "" : "none";
  }

  /* --------------------------- find and replace tool ---------------------- */

  (function findReplaceTool() {
    const input = document.getElementById("fr-input");
    if (!input) return;
    const findInput = document.getElementById("fr-find");
    const replaceInput = document.getElementById("fr-replace");
    const useRegex = document.getElementById("fr-regex");
    const caseSensitive = document.getElementById("fr-case");
    const output = document.getElementById("fr-output");
    const countEl = document.getElementById("fr-count");
    const groupsEl = document.getElementById("fr-groups");
    const errorEl = document.getElementById("fr-error");
    const applyBtn = document.getElementById("fr-apply");

    function currentRegex() {
      return buildSearchRegex(findInput.value, {
        regex: useRegex.checked,
        caseSensitive: caseSensitive.checked,
      });
    }

    function render() {
      setError(errorEl, "");
      groupsEl.innerHTML = "";
      if (!findInput.value) {
        countEl.textContent = "0 matches";
        return null;
      }
      let re;
      try {
        re = currentRegex();
      } catch (err) {
        // Show the engine's own complaint — it is more useful than "invalid".
        setError(errorEl, "Invalid regular expression: " + err.message);
        countEl.textContent = "—";
        return null;
      }
      const result = findMatches(input.value, re);
      countEl.textContent =
        result.total === 1 ? "1 match" : result.total.toLocaleString() + " matches";

      // Preview the first few matches and what their capture groups caught.
      result.matches.slice(0, 5).forEach((m) => {
        const li = document.createElement("li");
        const groups = describeGroups(m);
        li.innerHTML =
          "<code>" + esc(m.text) + "</code>" +
          (groups ? ' <span class="match-groups">' + esc(groups) + "</span>" : "");
        groupsEl.appendChild(li);
      });
      return re;
    }

    function applyAll() {
      const re = render();
      if (!re) return;
      output.value = applyReplacement(input.value, re, replaceInput.value, useRegex.checked);
    }

    [findInput, replaceInput, input].forEach((el) =>
      el.addEventListener("input", debounce(render, 120))
    );
    [useRegex, caseSensitive].forEach((el) => el.addEventListener("change", render));
    applyBtn.addEventListener("click", applyAll);
    wireCopy("fr-copy", "fr-copy-flash", () => output.value);
    render();
  })();

  /* --------------------------- sort and dedupe tool ----------------------- */

  (function sortDedupeTool() {
    const input = document.getElementById("sd-input");
    if (!input) return;
    const mode = document.getElementById("sd-mode");
    const direction = document.getElementById("sd-direction");
    const dedupe = document.getElementById("sd-dedupe");
    const trim = document.getElementById("sd-trim");
    const removeBlank = document.getElementById("sd-blank");
    const caseSensitive = document.getElementById("sd-case");
    const output = document.getElementById("sd-output");
    const statsEl = document.getElementById("sd-stats");

    function render() {
      const result = processLines(input.value, {
        mode: mode.value,
        direction: direction.value,
        dedupe: dedupe.value,
        trim: trim.checked,
        removeBlank: removeBlank.checked,
        caseSensitive: caseSensitive.checked,
      });
      output.value = result.text;
      const s = result.stats;
      statsEl.textContent =
        s.input.toLocaleString() + " in → " + s.output.toLocaleString() + " out" +
        (s.duplicates ? " · " + s.duplicates.toLocaleString() + " duplicate" + (s.duplicates === 1 ? "" : "s") + " removed" : "") +
        (s.blanks ? " · " + s.blanks.toLocaleString() + " blank" + (s.blanks === 1 ? "" : "s") + " removed" : "");
    }

    input.addEventListener("input", debounce(render, 120));
    [mode, direction, dedupe, trim, removeBlank, caseSensitive].forEach((el) =>
      el.addEventListener("change", render)
    );
    wireCopy("sd-copy", "sd-copy-flash", () => output.value);
    render();
  })();

  /* -------------------------- markdown ↔ html tool ------------------------ */

  (function markdownTool() {
    const input = document.getElementById("md-input");
    if (!input) return;
    const output = document.getElementById("md-output");
    const preview = document.getElementById("md-preview");
    const previewWrap = document.getElementById("md-preview-wrap");
    const outputLabel = document.getElementById("md-output-label");
    const inputLabel = document.getElementById("md-input-label");
    const swapBtn = document.getElementById("md-swap");
    const dirBtns = Array.from(document.querySelectorAll("[data-md-dir]"));
    let direction = "md2html";

    function render() {
      if (direction === "md2html") {
        // shiftHeadings:false — a converter must turn "# Title" into <h1>,
        // where notepadly's in-document renderer shifts it to <h2>.
        const html = renderMarkdown(input.value, { shiftHeadings: false });
        output.value = html;
        preview.innerHTML = html;
        previewWrap.hidden = false;
      } else {
        output.value = htmlToMarkdown(input.value);
        preview.innerHTML = "";
        previewWrap.hidden = true;
      }
    }

    function setDirection(next) {
      direction = next;
      const toHtml = direction === "md2html";
      inputLabel.textContent = toHtml ? "Markdown" : "HTML";
      outputLabel.textContent = toHtml ? "HTML" : "Markdown";
      input.setAttribute("placeholder", toHtml ? "# Paste Markdown here" : "<h1>Paste HTML here</h1>");
      dirBtns.forEach((b) => {
        const active = b.dataset.mdDir === direction;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      render();
    }

    dirBtns.forEach((b) => b.addEventListener("click", () => setDirection(b.dataset.mdDir)));

    // Swap feeds the output back in, so a user can convert and convert back
    // without copying and pasting between the boxes.
    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const converted = output.value;
        setDirection(direction === "md2html" ? "html2md" : "md2html");
        input.value = converted;
        render();
      });
    }

    input.addEventListener("input", debounce(render, 150));
    wireCopy("md-copy", "md-copy-flash", () => output.value);
    setDirection("md2html");
  })();

  /* ---------------------------- csv ↔ json tool --------------------------- */

  (function csvJsonTool() {
    const input = document.getElementById("cj-input");
    if (!input) return;
    const output = document.getElementById("cj-output");
    const delimiter = document.getElementById("cj-delimiter");
    const hasHeader = document.getElementById("cj-header");
    const coerce = document.getElementById("cj-coerce");
    const errorEl = document.getElementById("cj-error");
    const detectedEl = document.getElementById("cj-detected");
    const inputLabel = document.getElementById("cj-input-label");
    const outputLabel = document.getElementById("cj-output-label");
    const dirBtns = Array.from(document.querySelectorAll("[data-cj-dir]"));
    const csvOnly = Array.from(document.querySelectorAll("[data-csv-only]"));
    let direction = "csv2json";

    const DELIM_LABELS = { ",": "comma", ";": "semicolon", "\t": "tab", "|": "pipe" };

    function chosenDelimiter() {
      const v = delimiter.value;
      if (v === "auto") return null;
      return v === "\\t" ? "\t" : v;
    }

    function render() {
      setError(errorEl, "");
      detectedEl.textContent = "";
      if (!input.value.trim()) {
        output.value = "";
        return;
      }
      try {
        if (direction === "csv2json") {
          let delim = chosenDelimiter();
          if (!delim) {
            delim = detectDelimiter(input.value);
            detectedEl.textContent = "Detected delimiter: " + (DELIM_LABELS[delim] || delim);
          }
          const data = csvToJson(input.value, {
            delimiter: delim,
            hasHeader: hasHeader.checked,
            coerceTypes: coerce.checked,
          });
          output.value = JSON.stringify(data, null, 2);
        } else {
          const parsed = JSON.parse(input.value);
          const delim = chosenDelimiter() || ",";
          output.value = jsonToCsv(parsed, { delimiter: delim, includeHeader: hasHeader.checked });
        }
      } catch (err) {
        output.value = "";
        setError(errorEl, direction === "csv2json" ? err.message : "Invalid JSON: " + err.message);
      }
    }

    function setDirection(next) {
      direction = next;
      const toJson = direction === "csv2json";
      inputLabel.textContent = toJson ? "CSV" : "JSON";
      outputLabel.textContent = toJson ? "JSON" : "CSV";
      input.setAttribute("placeholder", toJson ? "name,age\nAda,36" : '[{ "name": "Ada", "age": 36 }]');
      // Delimiter auto-detection only means something when reading CSV.
      csvOnly.forEach((el) => { el.hidden = !toJson; });
      dirBtns.forEach((b) => {
        const active = b.dataset.cjDir === direction;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      render();
    }

    dirBtns.forEach((b) => b.addEventListener("click", () => setDirection(b.dataset.cjDir)));
    input.addEventListener("input", debounce(render, 150));
    [delimiter, hasHeader, coerce].forEach((el) => el.addEventListener("change", render));
    wireCopy("cj-copy", "cj-copy-flash", () => output.value);
    setDirection("csv2json");
  })();

  /* ------------------------------ slugify tool ---------------------------- */

  (function slugifyTool() {
    const input = document.getElementById("sl-input");
    if (!input) return;
    const output = document.getElementById("sl-output");
    const separator = document.getElementById("sl-separator");
    const lowercase = document.getElementById("sl-lowercase");
    const translit = document.getElementById("sl-translit");
    const keepUnicode = document.getElementById("sl-unicode");
    const maxLength = document.getElementById("sl-maxlength");
    const perLine = document.getElementById("sl-perline");

    function options() {
      const max = parseInt(maxLength.value, 10);
      return {
        separator: separator.value === "none" ? "" : separator.value,
        lowercase: lowercase.checked,
        transliterate: translit.checked,
        keepUnicode: keepUnicode.checked,
        maxLength: Number.isFinite(max) && max > 0 ? max : 0,
      };
    }

    function render() {
      const opts = options();
      // Per-line mode turns a pasted list of titles into a list of slugs,
      // which is the common bulk case.
      output.value = perLine.checked
        ? splitLines(input.value).map((l) => slugify(l, opts)).join("\n")
        : slugify(input.value, opts);
    }

    input.addEventListener("input", debounce(render, 100));
    [separator, lowercase, translit, keepUnicode, maxLength, perLine].forEach((el) =>
      el.addEventListener("change", render)
    );
    maxLength.addEventListener("input", debounce(render, 150));
    wireCopy("sl-copy", "sl-copy-flash", () => output.value);
    render();
  })();

  /* -------------------------- text statistics tool ------------------------ */

  (function textStatsTool() {
    const input = document.getElementById("ts-input");
    if (!input) return;
    const fields = {};
    [
      "words", "characters", "charsnospaces", "sentences", "paragraphs",
      "readingtime", "speakingtime", "uniquewords", "avgwords", "avgwordlength",
      "syllables", "ease", "grade",
    ].forEach((k) => { fields[k] = document.getElementById("ts-" + k); });
    const easeLabel = document.getElementById("ts-easelabel");
    const longestEl = document.getElementById("ts-longest");
    const longestWrap = document.getElementById("ts-longest-wrap");

    const num = (n, dp) => (dp ? n.toFixed(dp) : Math.round(n).toLocaleString());

    function render() {
      const s = textStatistics(input.value);
      fields.words.textContent = s.words.toLocaleString();
      fields.characters.textContent = s.characters.toLocaleString();
      fields.charsnospaces.textContent = s.charactersNoSpaces.toLocaleString();
      fields.sentences.textContent = s.sentences.toLocaleString();
      fields.paragraphs.textContent = s.paragraphs.toLocaleString();
      fields.readingtime.textContent = formatDuration(s.readingMinutes);
      fields.speakingtime.textContent = formatDuration(s.speakingMinutes);
      fields.uniquewords.textContent = s.uniqueWords.toLocaleString();
      fields.avgwords.textContent = s.words ? num(s.avgWordsPerSentence, 1) : "—";
      fields.avgwordlength.textContent = s.words ? num(s.avgWordLength, 1) : "—";
      fields.syllables.textContent = s.syllables.toLocaleString();
      fields.ease.textContent = s.readingEase === null ? "—" : num(s.readingEase, 1);
      fields.grade.textContent = s.gradeLevel === null ? "—" : num(Math.max(0, s.gradeLevel), 1);
      easeLabel.textContent = s.readingEaseLabel;

      if (s.longestSentence) {
        longestWrap.hidden = false;
        longestEl.textContent =
          s.longestSentence.text + " (" + s.longestSentence.words + " words)";
      } else {
        longestWrap.hidden = true;
      }
    }

    input.addEventListener("input", debounce(render, 100));
    render();
  })();
})();
