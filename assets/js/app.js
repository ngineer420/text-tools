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

  // Letters that NFKD will not decompose into "letter + accent". These have no
  // decomposition at all - they are letters in their own right - so a
  // normalise-and-strip pass leaves them untouched and any ASCII filter after
  // it then deletes them outright, turning "Straße" into "Strae".
  const LETTER_FOLD = {
    "ß": "ss", "æ": "ae", "Æ": "ae", "œ": "oe", "Œ": "oe", "ø": "o", "Ø": "o",
    "đ": "d", "Đ": "d", "ð": "d", "Ð": "d", "þ": "th", "Þ": "th", "ł": "l",
    "Ł": "l", "ı": "i", "ħ": "h", "ŋ": "n", "ĸ": "k",
  };

  // Slug-only. A URL wants "50-percent" rather than "50", so slugify spells
  // these out - but an accent remover must not, or "12%" comes back as
  // "12percent" and "€1,240" as "euro1,240".
  const SLUG_SYMBOLS = {
    "€": "euro", "£": "gbp", "$": "dollar", "&": "and", "@": "at",
    "%": "percent", "©": "c", "®": "r", "№": "no", "°": "deg", "µ": "u",
    "«": "", "»": "", "“": "", "”": "", "‘": "", "’": "", "…": "",
  };

  const TRANSLITERATIONS = Object.assign({}, LETTER_FOLD, SLUG_SYMBOLS);

  // Uppercase forms worth keeping uppercase. slugify lowercases everything a
  // moment later so it never notices the difference, but "Łódź" is a name and
  // "lodz" in the middle of a sentence is wrong.
  const LETTER_FOLD_CASED = Object.assign({}, LETTER_FOLD, {
    "Æ": "AE", "Œ": "OE", "Ø": "O", "Đ": "D", "Ð": "D", "Þ": "TH", "Ł": "L",
  });

  /** Apply a substitution map, then NFKD-decompose and drop the marks left. */
  function foldMarks(text, map) {
    let out = "";
    for (const ch of String(text == null ? "" : text)) {
      out += Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch;
    }
    // NFKD splits "é" into "e" + combining acute; drop the accents that leaves.
    return out.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  function transliterate(text) {
    return foldMarks(text, TRANSLITERATIONS);
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

  /* --------------------------- remove line breaks ------------------------ */

  /* Text pasted out of a PDF, an email client or a Windows editor arrives with
     \r\n, and a lone \r still turns up in text copied out of older Mac files.
     Everything below assumes \n, so normalising first is what stops a "join
     lines" pass from leaving invisible carriage returns behind. */
  function normalizeNewlines(text) {
    return (text || "").replace(/\r\n?/g, "\n");
  }

  const BREAK_JOINERS = { space: " ", comma: ", ", none: "" };

  /* Join a run of wrapped lines back into one line.

     The joiner is not blindly concatenated: a line that already ends in a
     comma or semicolon does not get a second one, and whitespace either side
     of the seam is dropped so a trailing space plus a space joiner cannot
     produce a double space. Joining with nothing is left literal — someone
     rejoining a wrapped hash or a base64 blob wants exactly the characters
     they pasted, with the breaks gone and nothing added. */
  function joinWrapped(lines, joiner) {
    if (!lines.length) return "";
    if (!joiner) return lines.join("");
    let out = "";
    for (let i = 0; i < lines.length; i++) {
      const right = lines[i].replace(/^[ \t]+/, "");
      if (i === 0) { out = right; continue; }
      if (!right) continue;
      const left = out.replace(/[ \t]+$/, "");
      if (!left) { out = right; continue; }
      const glue = /[,;]$/.test(left) && /^[,;]/.test(joiner) ? " " : joiner;
      out = left + glue + right;
    }
    return out;
  }

  /* Strip line breaks out of pasted text.

     mode:
       "join"   — everything becomes one line
       "unwrap" — join the lines inside each paragraph but keep the blank line
                  between paragraphs (the shape you want after copying a PDF)
       "blank"  — remove blank lines only, leave every other break alone

     Returns the text plus the before/after counts the page shows live. */
  function removeLineBreaks(text, options) {
    const o = options || {};
    const mode = o.mode || "join";
    const joiner = Object.prototype.hasOwnProperty.call(BREAK_JOINERS, o.replaceWith)
      ? BREAK_JOINERS[o.replaceWith]
      : " ";
    const source = normalizeNewlines(text);

    let lines = source.split("\n");
    if (o.tabsToSpaces) lines = lines.map((l) => l.replace(/\t/g, " "));
    if (o.trimLines) lines = lines.map((l) => l.replace(/^[ \t]+|[ \t]+$/g, ""));
    if (o.collapseSpaces) lines = lines.map((l) => l.replace(/[ \t]{2,}/g, " "));

    const blank = (l) => !l.trim();
    let out;
    if (mode === "blank") {
      out = lines.filter((l) => !blank(l)).join("\n");
    } else if (mode === "unwrap") {
      const paragraphs = [];
      let current = [];
      for (const line of lines) {
        if (blank(line)) {
          if (current.length) { paragraphs.push(current); current = []; }
        } else {
          current.push(line);
        }
      }
      if (current.length) paragraphs.push(current);
      out = paragraphs.map((p) => joinWrapped(p, joiner)).join("\n\n");
    } else {
      out = joinWrapped(lines.filter((l) => !blank(l)), joiner);
    }

    const countLines = (s) => (s === "" ? 0 : s.split("\n").length);
    const linesBefore = countLines(source);
    const linesAfter = countLines(out);
    return {
      text: out,
      stats: {
        charactersBefore: source.length,
        charactersAfter: out.length,
        delta: out.length - source.length,
        linesBefore: linesBefore,
        linesAfter: linesAfter,
        breaksRemoved: Math.max(0, linesBefore - linesAfter),
      },
    };
  }

  /* ------------------------------ reverse text --------------------------- */

  /* Reversing by "character" means reversing by grapheme, not by code unit.
     "👍".split("").reverse() produces two lone surrogates and a
     replacement glyph, and "é" reversed by code point moves the accent
     onto whatever character now precedes it. */
  function splitGraphemesFallback(text) {
    // A base character plus its combining marks (which covers variation
    // selectors and keycaps), a regional-indicator pair (one flag), and any
    // run of those joined by ZWJ (one family, one profession emoji).
    const cluster = "(?:\\p{RI}\\p{RI}|\\P{M}\\p{M}*)";
    const re = new RegExp(cluster + "(?:\\u200D" + cluster + ")*", "gu");
    return text.match(re) || [];
  }

  function splitGraphemes(text) {
    const s = text || "";
    if (!s) return [];
    if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
      const out = [];
      for (const part of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(s)) {
        out.push(part.segment);
      }
      return out;
    }
    return splitGraphemesFallback(s);
  }

  function reverseGraphemes(text) {
    return splitGraphemes(text).reverse().join("");
  }

  /* Word order flipped, indentation left where it was: reversing the words of
     an indented list should not move the indent to the end of the line. */
  function reverseWordsInLine(line) {
    const lead = (line.match(/^\s*/) || [""])[0];
    const tail = line.length > lead.length ? (line.match(/\s*$/) || [""])[0] : "";
    const body = line.slice(lead.length, line.length - tail.length);
    if (!body) return line;
    const parts = body.split(/(\s+)/);
    const words = [];
    for (let i = 0; i < parts.length; i += 2) words.push(parts[i]);
    words.reverse();
    let w = 0;
    for (let i = 0; i < parts.length; i += 2) parts[i] = words[w++];
    return lead + parts.join("") + tail;
  }

  /* mode: "characters" (per line, so a paragraph keeps its shape), "words"
     (per line) or "lines" (the order of the lines themselves). */
  function reverseText(text, mode) {
    const source = normalizeNewlines(text);
    if (mode === "lines") return source.split("\n").reverse().join("\n");
    if (mode === "words") return source.split("\n").map(reverseWordsInLine).join("\n");
    return source.split("\n").map(reverseGraphemes).join("\n");
  }

  /* ------------------------------- cleaners ------------------------------ */

  /* The "remove X from text" family. One pure function per transform, plus a
     registry, so the combined tool on /text-cleaner and every generated
     /remove-… page run exactly the same code rather than near-copies of it.

     Every function takes (text, options) and returns a string. cleanText()
     runs a selection of them in CLEANER_ORDER, which is a fixed pipeline
     because the order changes the answer: markup has to go before punctuation
     (or `<p>` leaves a stray `p` behind), accents before an ASCII-only pass,
     and the whitespace tidy-up has to run last so it can close the gaps every
     earlier step opened. */

  // Everything that looks like a space but is not U+0020, plus the invisible
  // characters that survive a copy out of a web page and break a later diff.
  const UNICODE_SPACES = /[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000]/g;
  const ZERO_WIDTH = /[\u200b-\u200d\u2060\ufeff]/g;

  /**
   * Whitespace cleanup.
   * @param {{mode, blankLines, tabsToSpaces, unifySpaces}} options
   *   mode: "collapse" runs to one space and trim the ends (default),
   *         "indent" collapse runs but keep the leading indentation,
   *         "trim" only strip the ends, "all" delete every space and tab.
   */
  function removeExtraSpaces(text, options) {
    const o = options || {};
    let s = normalizeNewlines(text);
    if (o.unifySpaces !== false) s = s.replace(UNICODE_SPACES, " ").replace(ZERO_WIDTH, "");
    if (o.tabsToSpaces !== false) s = s.replace(/\t/g, " ");

    const mode = o.mode || "collapse";
    s = s
      .split("\n")
      .map((line) => {
        if (mode === "all") return line.replace(/[ \t]+/g, "");
        if (mode === "trim") return line.replace(/^[ \t]+|[ \t]+$/g, "");
        if (mode === "indent") {
          // The leading run is structure here, not noise, so the collapse pass
          // starts after it. Collapsing it too is what turns a YAML block or a
          // Python function into one flat column.
          const indent = line.match(/^[ \t]*/)[0];
          return indent + line.slice(indent.length)
            .replace(/([ \t])[ \t]+/g, "$1")
            .replace(/[ \t]+$/, "");
        }
        return line.replace(/([ \t])[ \t]+/g, "$1").replace(/^[ \t]+|[ \t]+$/g, "");
      })
      .join("\n");

    const blanks = o.blankLines || "collapse";
    if (blanks === "remove") s = s.split("\n").filter((l) => l.trim() !== "").join("\n");
    else if (blanks === "collapse") s = s.replace(/\n{3,}/g, "\n\n");
    return s;
  }

  // Which marks survive, by intent rather than by codepoint list.
  const PUNCT_KEEP = {
    none: "",
    sentence: ".!?,;:",
    words: "'-",
    both: ".!?,;:'-",
  };

  // Typographic forms of a mark whose ASCII twin may be on the keep list. A
  // curly apostrophe in "don’t" has to survive a "keep apostrophes" setting,
  // and the only sane way to keep it is to hand back the straight one.
  //
  // The en and em dash are deliberately NOT folded onto the hyphen. They are a
  // different mark doing a different job: "well-known" is one word and "a — b"
  // is a sentence break, so keeping hyphens should not quietly keep every dash.
  // U+2010 and U+2011 are folded, because those really are hyphens.
  const PUNCT_FOLD = {
    "‘": "'", "’": "'", "‚": "'", "‛": "'",
    "‐": "-", "‑": "-",
    "…": ".", "‼": "!", "⁇": "?", "⁈": "?", "⁉": "!",
    "！": "!", "，": ",", "．": ".", "：": ":", "；": ";", "？": "?",
  };

  /**
   * Strip punctuation. Symbols (+ = < > | ~ $ ^ `) are Unicode \p{S}, not
   * \p{P}, and belong to removeSpecialChars — a "remove punctuation" tool that
   * silently eats the plus sign in a phone number is the wrong tool.
   * @param {{keep, replaceWith, foldQuotes}} options
   */
  function removePunctuation(text, options) {
    const o = options || {};
    const keepSrc = PUNCT_KEEP[o.keep] === undefined ? PUNCT_KEEP.none : PUNCT_KEEP[o.keep];
    const keep = new Set(keepSrc.split(""));
    const rep = o.replaceWith === "space" ? " " : "";
    let out = "";
    for (const ch of String(text == null ? "" : text)) {
      if (!/\p{P}/u.test(ch)) { out += ch; continue; }
      if (keep.has(ch)) { out += ch; continue; }
      const folded = Object.prototype.hasOwnProperty.call(PUNCT_FOLD, ch) ? PUNCT_FOLD[ch] : ch;
      if (keep.has(folded)) { out += o.foldQuotes === false ? ch : folded; continue; }
      out += rep;
    }
    return out;
  }

  // What "special character" means depends entirely on where the text is going,
  // so the choice is the page's first control rather than a hidden constant.
  const SPECIAL_KEEP = {
    alnum: /[^\p{L}\p{N}\s]/gu,
    basic: /[^\p{L}\p{N}\s.,!?'"()\-:;/@#&%]/gu,
    ascii: /[^\x20-\x7e\n]/g,
  };

  /**
   * Remove symbols, control characters and anything outside the chosen set.
   * @param {{keep, replaceWith, transliterate}} options
   */
  function removeSpecialChars(text, options) {
    const o = options || {};
    const keep = SPECIAL_KEEP[o.keep] ? o.keep : "alnum";
    const rep = o.replaceWith === "space" ? " " : "";
    let s = normalizeNewlines(text);
    // Control characters are invisible and are never what anyone means to keep.
    s = s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
    // Folding first is what turns "café" into "cafe" rather than "caf" when the
    // target is ASCII; without it an ASCII pass deletes every accented letter.
    if (keep === "ascii" && o.transliterate !== false) s = foldMarks(s, LETTER_FOLD_CASED);
    const re = SPECIAL_KEEP[keep];
    return s.replace(new RegExp(re.source, re.flags), rep);
  }

  // Digits with their separators, anchored so a match cannot start mid-token.
  const NUMBER_TOKEN = /(^|[^\p{L}\p{N}])([-+]?\p{Nd}[\p{Nd},.]*)/gu;
  const CURRENCY = /[$¢-¥₠-₿%‰]/g;

  /**
   * Remove numbers.
   * @param {{mode, replaceWith, currency}} options
   *   mode: "all" every digit anywhere, "standalone" whole numbers only so
   *   mp3, H2O and A4 keep their digits, "listmarkers" only the "1." that
   *   opens a line of a pasted numbered list.
   */
  function removeNumbers(text, options) {
    const o = options || {};
    const mode = o.mode || "all";
    const rep = o.replaceWith === "space" ? " " : "";
    let s = normalizeNewlines(text);

    if (mode === "listmarkers") {
      // The dot, bracket or colon is required. Without it "2024 was a good
      // year" reads as list item 2024 and loses its opening word.
      s = s.split("\n").map((l) => l.replace(/^(\s*)[([]?\p{Nd}+[.)\]:][ \t]+/u, "$1")).join("\n");
    } else if (mode === "standalone") {
      s = s.replace(NUMBER_TOKEN, (whole, pre, num, idx, full) => {
        // "3.5kg" and "1st" are words with a number in them, not numbers.
        const after = full[idx + whole.length];
        if (after && /\p{L}/u.test(after)) return whole;
        let token = num;
        let tail = "";
        const trailing = token.match(/[.,]+$/);
        if (trailing) { tail = trailing[0]; token = token.slice(0, -tail.length); }
        return pre + rep + tail;
      });
    } else {
      s = s.replace(/\p{Nd}/gu, rep);
    }

    if (o.currency) s = s.replace(CURRENCY, rep);
    return s;
  }

  /* Emoji are clusters, not characters: a base pictograph plus an optional
     skin tone and variation selector, several of those joined by ZWJ into a
     family or a profession, a pair of regional indicators for a flag, or a
     digit plus U+20E3 for a keycap. Deleting one codepoint at a time leaves
     orphaned joiners and half a flag behind. */
  const EMOJI_TONE = "[\\u{1F3FB}-\\u{1F3FF}]";
  const EMOJI_ATOM = "(?:\\p{Extended_Pictographic}(?:\\uFE0F|\\uFE0E)?" + EMOJI_TONE + "?)";
  const EMOJI_CLUSTER =
    "(?:\\p{RI}\\p{RI}|[0-9#*]\\uFE0F?\\u20E3|" + EMOJI_ATOM + "(?:\\u200D" + EMOJI_ATOM + ")*)";

  /* Extended_Pictographic also covers © ® ™ ‼ ⁉ ℹ ↔ and friends, which are
     ordinary punctuation in running prose and only become emoji when they
     carry U+FE0F. Removing the © off a footer line is not what anyone asked
     for, so the text-presentation forms are kept unless keepTextSymbols is
     switched off. */
  const TEXT_PRESENTATION =
    /[©®™‼⁉ℹ↔-↪⌚⌛Ⓜ▪-◾☀-☄☎☑☔☕☘☝☠-☣☦☪☮☯☸-☺♀♂♈-♓]/;

  /**
   * Remove emoji.
   * @param {{replaceWith, symbols, keepTextSymbols}} options
   */
  function removeEmoji(text, options) {
    const o = options || {};
    const rep = o.replaceWith === "space" ? " " : "";
    let s = String(text == null ? "" : text);
    const cluster = new RegExp(EMOJI_CLUSTER, "gu");
    s = s.replace(cluster, (match) => {
      if (o.keepTextSymbols !== false && match.length === 1 && TEXT_PRESENTATION.test(match)) {
        return match;
      }
      return rep;
    });
    // ☑ ➜ ⚑ and the rest of the dingbats are \p{So} rather than pictographs.
    if (o.symbols) s = s.replace(/\p{So}/gu, rep);
    // A joiner or a variation selector left on its own renders as nothing but
    // still breaks string comparison, so it goes whatever else was kept.
    s = s.replace(/(^|[^\p{Extended_Pictographic}])[\ufe0e\ufe0f\u200d]+/gu, "$1");
    return s;
  }

  /* Tags whose closing edge is a line in the rendered page. Everything else is
     inline and closing it must not introduce a break, or a paragraph with a
     <strong> in it comes back as three lines. */
  const HTML_BLOCK_TAG = /^(?:address|article|aside|blockquote|br|div|dd|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|li|main|nav|ol|p|pre|section|table|tbody|td|tfoot|th|thead|tr|ul)$/i;

  /**
   * Strip HTML tags, leaving the text between them.
   * @param {{blockBreaks, dropScripts, dropComments, decodeEntities, tidy}} options
   */
  function stripHtmlTags(text, options) {
    const o = options || {};
    let s = normalizeNewlines(text);
    if (o.dropComments !== false) s = s.replace(/<!--[\s\S]*?-->/g, "");
    // A <script> body is code, not text, so dropping the tags alone would
    // paste a function into the middle of the result.
    if (o.dropScripts !== false) {
      s = s.replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, "");
    }
    s = s.replace(/<![a-zA-Z][^>]*>/g, "");
    // The break belongs to the *closing* edge of a block, plus the two tags
    // that are a break in themselves. Breaking on the opening tag as well puts
    // a blank line between every list item.
    s = s.replace(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)\b(?:"[^"]*"|'[^']*'|[^>])*>/g, (whole, slash, tag) => {
      if (o.blockBreaks === false || !HTML_BLOCK_TAG.test(tag)) return "";
      return slash || /^(?:br|hr)$/i.test(tag) ? "\n" : "";
    });
    if (o.decodeEntities !== false) s = decodeEntities(s);
    if (o.tidy !== false) {
      s = s.replace(/[ \t]+/g, " ").replace(/[ \t]*\n[ \t]*/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
    }
    return s;
  }

  /**
   * Remove accents and diacritics.
   * @param {{mode, transliterate, replaceWith}} options
   *   mode: "fold" é→e and ß→ss, leaving other scripts alone (default),
   *         "marks" drop the combining marks but keep every script,
   *         "ascii" fold, then delete anything still outside ASCII.
   */
  function removeAccents(text, options) {
    const o = options || {};
    const s = String(text == null ? "" : text);
    if (o.mode === "marks") {
      // NFD then NFC, not NFKD: decomposing compatibility forms would turn ½
      // into 1⁄2 and ﬁ into fi, which is a different job.
      return s.normalize("NFD").replace(/\p{M}/gu, "").normalize("NFC");
    }
    // foldMarks with the letter map, NOT transliterate(): slugify's map also
    // spells out % as "percent" and € as "euro", which is right for a URL and
    // very wrong for a page that only claims to remove accents.
    let out = o.transliterate === false
      ? s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
      : foldMarks(s, LETTER_FOLD_CASED);
    if (o.mode === "ascii") {
      out = out.replace(/[^\x00-\x7f]/g, o.replaceWith === "space" ? " " : "");
    }
    return out;
  }

  /* The registry. `id` is the value of the data-cleaner attribute on a
     generated page and the key in a cleanText() selection, so it is the one
     string shared between the Python builder, the page markup and this file. */
  const CLEANERS = {
    "html-tags":     { id: "html-tags",     label: "HTML tags",          href: "/remove-html-tags",          fn: stripHtmlTags },
    "emoji":         { id: "emoji",         label: "Emoji",              href: "/remove-emojis",             fn: removeEmoji },
    "accents":       { id: "accents",       label: "Accents",            href: "/remove-accents",            fn: removeAccents },
    "numbers":       { id: "numbers",       label: "Numbers",            href: "/remove-numbers",            fn: removeNumbers },
    "punctuation":   { id: "punctuation",   label: "Punctuation",        href: "/remove-punctuation",        fn: removePunctuation },
    "special-chars": { id: "special-chars", label: "Special characters", href: "/remove-special-characters", fn: removeSpecialChars },
    "extra-spaces":  { id: "extra-spaces",  label: "Extra spaces",       href: "/remove-extra-spaces",       fn: removeExtraSpaces },
  };

  // Pipeline order, deliberately not the display order — see the note above.
  const CLEANER_ORDER = [
    "html-tags", "emoji", "accents", "numbers", "punctuation", "special-chars", "extra-spaces",
  ];

  function cleanStats(before, after) {
    const countLines = (s) => (s === "" ? 0 : s.split("\n").length);
    return {
      charactersBefore: before.length,
      charactersAfter: after.length,
      delta: after.length - before.length,
      removed: Math.max(0, before.length - after.length),
      wordsBefore: countWords(before),
      wordsAfter: countWords(after),
      linesBefore: countLines(before),
      linesAfter: countLines(after),
    };
  }

  /**
   * Run a selection of cleaners over some text.
   * @param {string} text
   * @param {Object} selection  id -> options object, or `true` for defaults.
   *   Ids missing from the object are skipped, so the same call shape serves
   *   the seven single-transform pages and the everything-on combined tool.
   */
  function cleanText(text, selection) {
    const source = normalizeNewlines(text);
    const sel = selection || {};
    const applied = [];
    let out = source;
    for (const id of CLEANER_ORDER) {
      const chosen = sel[id];
      if (!chosen) continue;
      out = CLEANERS[id].fn(out, chosen === true ? {} : chosen);
      applied.push(id);
    }
    return { text: out, stats: cleanStats(source, out), applied };
  }

  /* ----------------------------- share links ------------------------------ */

  /* A share link keeps the tool inputs in location.hash. The text fields are
     compressed with lz-string (assets/js/lz-string.min.js), so a whole config
     file fits in one URL. The browser never sends the hash to the server, so a
     shared diff stays on the two machines that hold the link. */
  const SHARE_CAP_BYTES = 100 * 1024;

  /** Count the UTF-8 bytes of every string field, for the share cap. */
  function shareByteLength(fields) {
    let total = 0;
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      if (typeof value === "string") total += new TextEncoder().encode(value).length;
    }
    return total;
  }

  /** Build the hash body. The fields named in `textKeys` are compressed, the
      rest stay plain. Empty strings, false and null are left out. */
  function encodeShareHash(fields, lz, textKeys) {
    const parts = [];
    for (const key of Object.keys(fields)) {
      const value = fields[key];
      if (value === "" || value == null || value === false) continue;
      if (textKeys.indexOf(key) !== -1) {
        parts.push(key + "=" + lz.compressToEncodedURIComponent(String(value)));
      } else {
        parts.push(key + "=" + encodeURIComponent(String(value === true ? 1 : value)));
      }
    }
    return parts.join("&");
  }

  /** Read a hash back. `textKeys` names the compressed fields. A field that
      does not decompress is dropped, so a damaged link fills what it can. */
  function decodeShareHash(hash, lz, textKeys) {
    const out = {};
    const body = String(hash || "").replace(/^#/, "");
    if (!body) return out;
    for (const pair of body.split("&")) {
      const i = pair.indexOf("=");
      if (i < 1) continue;
      const key = pair.slice(0, i);
      const raw = pair.slice(i + 1);
      if (textKeys.indexOf(key) !== -1) {
        let text = null;
        try {
          text = lz.decompressFromEncodedURIComponent(raw);
        } catch (err) {
          text = null;
        }
        if (typeof text === "string" && text) out[key] = text;
      } else {
        try {
          out[key] = decodeURIComponent(raw);
        } catch (err) {
          /* a broken pair is dropped */
        }
      }
    }
    return out;
  }

  /** Render diff rows as plain text with a +, - or space marker per line. */
  function diffToText(rows) {
    return rows
      .map((row) => (row.type === "added" ? "+ " : row.type === "removed" ? "- " : "  ") + row.line)
      .join("\n");
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
      normalizeNewlines,
      joinWrapped,
      removeLineBreaks,
      splitGraphemes,
      splitGraphemesFallback,
      reverseGraphemes,
      reverseWordsInLine,
      reverseText,
      removeExtraSpaces,
      removePunctuation,
      removeSpecialChars,
      removeNumbers,
      removeEmoji,
      stripHtmlTags,
      removeAccents,
      cleanText,
      CLEANER_ORDER,
      SHARE_CAP_BYTES,
      shareByteLength,
      encodeShareHash,
      decodeShareHash,
      diffToText,
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

  /* ---- homepage: the toolbar's own links switch the tool panels ----
   *
   * The homepage carries all twelve tools on one page. The toolbar is the only
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
      "/remove-line-breaks": "panel-removebreaks",
      "/reverse-text": "panel-reverse",
      "/text-cleaner": "panel-cleaner",
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
    wireDownload("case-download", "case-converter.txt", () => output.value);
    wireCopyLink("case-link", "case-link-flash", "case-converter", ["t"], () => {
      const active = buttons.find((b) => b.classList.contains("is-active"));
      return { t: input.value, c: active ? active.dataset.case : "" };
    });

    const shared = readShareHash("case-converter", ["t"]);
    if (shared) {
      input.value = shared.t || "";
      const btn = buttons.find((b) => b.dataset.case === shared.c);
      if (btn) btn.click();
    }
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
    wireDownload("lorem-download", "lorem-ipsum-generator.txt", () => output.value);

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
    wireCopyLink("diff-link", "diff-link-flash", "diff-checker", ["a", "b"], () => ({
      a: originalInput.value,
      b: changedInput.value,
    }));
    wireDownload("diff-download", "diff-checker.txt", () =>
      diffToText(diffLines(originalInput.value, changedInput.value))
    );

    const shared = readShareHash("diff-checker", ["a", "b"]);
    if (shared) {
      originalInput.value = shared.a || "";
      changedInput.value = shared.b || "";
    }
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

  /** Save text as a file through a temporary object URL. */
  function downloadText(filename, text, mime) {
    const blob = new Blob([text], { type: (mime || "text/plain") + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /** Wire a Download button. `filename` is a string or a function, so a
      two-direction tool can pick .html or .md at click time. */
  function wireDownload(btnId, filename, getText, mime) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.addEventListener("click", () => {
      const text = getText();
      if (!text) return;
      const name = typeof filename === "function" ? filename() : filename;
      const type = typeof mime === "function" ? mime() : mime;
      downloadText(name, text, type);
    });
  }

  /** The page slug from the path, for a download name on a generated page. */
  function pageSlug(fallback) {
    const path = location.pathname.replace(/\.html$/, "").replace(/\/$/, "");
    return path.replace(/^\//, "") || fallback;
  }

  /* The diff tool wires up before this section runs, so this is a function
     and not a const: a function declaration hoists, a const does not. */
  function lz() {
    return typeof LZString !== "undefined" ? LZString : null;
  }

  /** Wire a "Copy link" button. The link points at the standalone tool page
      with the inputs in the hash. Over the cap, a banner replaces the copy. */
  function wireCopyLink(btnId, flashId, slug, textKeys, getFields) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    if (!lz()) {
      btn.hidden = true;
      return;
    }
    const flashEl = document.getElementById(flashId);
    const banner = document.createElement("div");
    banner.className = "error-banner";
    banner.setAttribute("role", "alert");
    const host = btn.closest(".output-toolbar, .btn-row") || btn;
    host.insertAdjacentElement("afterend", banner);
    btn.addEventListener("click", () => {
      const fields = getFields();
      if (shareByteLength(fields) > SHARE_CAP_BYTES) {
        setError(banner, "The text is over 100 KB. Shorten it to share a link.");
        return;
      }
      setError(banner, "");
      copyText(location.origin + "/" + slug + "#" + encodeShareHash(fields, lz(), textKeys), flashEl);
    });
  }

  /** Read the share hash on the standalone page for `slug`. The home page
      holds every panel under one URL, so a hash there names no tool. */
  function readShareHash(slug, textKeys) {
    if (!lz() || !location.hash) return null;
    if (pageSlug("") !== slug) return null;
    const fields = decodeShareHash(location.hash, lz(), textKeys);
    return Object.keys(fields).length ? fields : null;
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
    wireDownload("fr-download", "find-and-replace.txt", () => output.value);
    wireCopyLink("fr-link", "fr-link-flash", "find-and-replace", ["t", "f", "r"], () => ({
      t: input.value,
      f: findInput.value,
      r: replaceInput.value,
      re: useRegex.checked,
      cs: caseSensitive.checked,
    }));

    const shared = readShareHash("find-and-replace", ["t", "f", "r"]);
    if (shared) {
      input.value = shared.t || "";
      findInput.value = shared.f || "";
      replaceInput.value = shared.r || "";
      useRegex.checked = shared.re === "1";
      caseSensitive.checked = shared.cs === "1";
      applyAll();
    } else {
      render();
    }
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
    wireDownload("sd-download", "sort-and-dedupe-lines.txt", () => output.value);
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
    wireDownload(
      "md-download",
      () => (direction === "md2html" ? "markdown-to-html.html" : "markdown-to-html.md"),
      () => output.value,
      () => (direction === "md2html" ? "text/html" : "text/markdown")
    );
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
    wireDownload(
      "cj-download",
      () => (direction === "csv2json" ? "csv-to-json.json" : "csv-to-json.csv"),
      () => output.value,
      () => (direction === "csv2json" ? "application/json" : "text/csv")
    );
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
    wireDownload("sl-download", "slugify.txt", () => output.value);
    wireCopyLink("sl-link", "sl-link-flash", "slugify", ["t"], () => ({
      t: input.value,
      sep: separator.value,
      lc: lowercase.checked,
      tr: translit.checked,
      u: keepUnicode.checked,
      max: maxLength.value,
      pl: perLine.checked,
    }));

    const shared = readShareHash("slugify", ["t"]);
    if (shared) {
      input.value = shared.t || "";
      if (shared.sep) separator.value = shared.sep;
      lowercase.checked = shared.lc === "1";
      translit.checked = shared.tr === "1";
      keepUnicode.checked = shared.u === "1";
      maxLength.value = shared.max || "0";
      perLine.checked = shared.pl === "1";
    }
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

  /* ------------------------- remove line breaks tool --------------------- */

  (function removeLineBreaksTool() {
    const input = document.getElementById("rb-input");
    if (!input) return;
    const mode = document.getElementById("rb-mode");
    const replaceWith = document.getElementById("rb-replace");
    const collapse = document.getElementById("rb-collapse");
    const trim = document.getElementById("rb-trim");
    const tabs = document.getElementById("rb-tabs");
    const output = document.getElementById("rb-output");
    const before = document.getElementById("rb-before");
    const after = document.getElementById("rb-after");
    const delta = document.getElementById("rb-delta");
    const breaks = document.getElementById("rb-breaks");

    function render() {
      const result = removeLineBreaks(input.value, {
        mode: mode.value,
        replaceWith: replaceWith.value,
        collapseSpaces: collapse.checked,
        trimLines: trim.checked,
        tabsToSpaces: tabs.checked,
      });
      output.value = result.text;
      const s = result.stats;
      before.textContent = s.charactersBefore.toLocaleString();
      after.textContent = s.charactersAfter.toLocaleString();
      delta.textContent = (s.delta > 0 ? "+" : s.delta < 0 ? "−" : "")
        + Math.abs(s.delta).toLocaleString();
      breaks.textContent = s.breaksRemoved.toLocaleString();
    }

    input.addEventListener("input", debounce(render, 100));
    [mode, replaceWith, collapse, trim, tabs].forEach((el) =>
      el.addEventListener("change", render)
    );
    wireCopy("rb-copy", "rb-copy-flash", () => output.value);
    wireDownload("rb-download", "remove-line-breaks.txt", () => output.value);
    render();
  })();

  /* ----------------------------- text cleaner ---------------------------- */

  /* Shared with assets/js/cleaner-page.js, which drives the seven generated
     single-transform pages. Exposing the registry rather than duplicating it
     is what keeps /remove-emojis and the "Emoji" checkbox on /text-cleaner
     from drifting apart. */
  window.TextKitClean = {
    CLEANERS,
    CLEANER_ORDER,
    cleanText,
    readOptions: readCleanerOptions,
    renderStats: renderCleanerStats,
    wireCopy,
    wireDownload,
    pageSlug,
    debounce,
  };

  /* Read a set of option controls into cleanText()'s selection shape.

     Every control carries `data-opt="<optionName>"` and, on a page with more
     than one cleaner in play, `data-for="<cleanerId>"`. Nothing about which
     options exist is written twice: the builder emits the controls from
     tools/cleaner_pages.py and this reads back whatever it finds. */
  function readCleanerOptions(scope, selection, defaultId) {
    Array.from(scope.querySelectorAll("[data-opt]")).forEach((el) => {
      const target = selection[el.dataset.for || defaultId];
      const enabled = !!target;
      // A "keep apostrophes" select means nothing while punctuation is off,
      // and a live control that changes nothing is the worst kind of control.
      if (el.dataset.for) el.disabled = !enabled;
      if (!enabled) return;
      target[el.dataset.opt] = el.type === "checkbox" ? el.checked : el.value;
    });
    return selection;
  }

  /** Fill the four before/after cards every cleaner page shares. */
  function renderCleanerStats(prefix, s) {
    const set = (suffix, value) => {
      const el = document.getElementById(prefix + suffix);
      if (el) el.textContent = value;
    };
    set("-before", s.charactersBefore.toLocaleString());
    set("-after", s.charactersAfter.toLocaleString());
    set("-removed", s.removed.toLocaleString());
    set("-words", s.wordsBefore.toLocaleString() + " → " + s.wordsAfter.toLocaleString());
  }

  /* The combined tool on /text-cleaner: all seven transforms at once, each on
     a checkbox, all of them on when the page loads. */
  (function textCleanerTool() {
    const input = document.getElementById("tc-input");
    if (!input) return;
    const output = document.getElementById("tc-output");
    const panel = document.getElementById("tc-controls");
    const summary = document.getElementById("tc-summary");
    const toggles = Array.from(panel.querySelectorAll("[data-clean]"));

    function render() {
      const selection = {};
      toggles.forEach((t) => { if (t.checked) selection[t.dataset.clean] = {}; });
      readCleanerOptions(panel, selection, null);

      const result = cleanText(input.value, selection);
      output.value = result.text;
      renderCleanerStats("tc", result.stats);

      if (summary) {
        const names = result.applied.map((id) => CLEANERS[id].label.toLowerCase());
        summary.textContent = names.length
          ? "Removing " + (names.length === 1
              ? names[0]
              : names.slice(0, -1).join(", ") + " and " + names[names.length - 1]) + "."
          : "Nothing is switched on, so the text comes back exactly as pasted.";
      }
    }

    input.addEventListener("input", debounce(render, 100));
    panel.addEventListener("change", render);
    wireCopy("tc-copy", "tc-copy-flash", () => output.value);
    wireDownload("tc-download", "text-cleaner.txt", () => output.value);
    render();
  })();

  /* ---------------------------- reverse text tool ------------------------ */

  (function reverseTextTool() {
    const input = document.getElementById("rv-input");
    if (!input) return;
    const output = document.getElementById("rv-output");
    const statsEl = document.getElementById("rv-stats");
    const modeBtns = Array.from(document.querySelectorAll("[data-reverse]"));
    let mode = "characters";

    function render() {
      output.value = reverseText(input.value, mode);
      const graphemes = splitGraphemes(input.value.replace(/\n/g, "")).length;
      statsEl.textContent = graphemes
        ? graphemes.toLocaleString() + " character" + (graphemes === 1 ? "" : "s")
          + " · reversed by " + mode
        : "";
    }

    function setMode(next) {
      mode = next;
      modeBtns.forEach((b) => {
        const active = b.dataset.reverse === mode;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      render();
    }

    modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.reverse)));
    input.addEventListener("input", debounce(render, 100));
    wireCopy("rv-copy", "rv-copy-flash", () => output.value);
    wireDownload("rv-download", "reverse-text.txt", () => output.value);
    setMode(mode);
  })();
})();
