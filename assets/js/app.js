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

  /* ============================================================
     Export pure functions for Node-based sanity checks (see README).
     In the browser this block is skipped and the IIFE below runs.
     ============================================================ */
  if (typeof module !== "undefined" && module.exports) {
    module.exports = {
      STOPWORDS,
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

  /* ------------------------------- tabs ---------------------------------- */

  (function initTabs() {
    const tabIds = ["tab-wordcount", "tab-case", "tab-lorem", "tab-diff"];
    const tabs = tabIds.map((id) => document.getElementById(id)).filter(Boolean);
    const panels = {};
    tabs.forEach((t) => {
      panels[t.id] = document.getElementById(t.getAttribute("aria-controls"));
    });

    function select(tab, { focus = true } = {}) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        panels[t.id].hidden = !active;
        panels[t.id].classList.toggle("active", active);
      });
      if (focus) tab.focus();
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") select(tabs[(i + 1) % tabs.length]);
        if (e.key === "ArrowLeft") select(tabs[(i - 1 + tabs.length) % tabs.length]);
        if (e.key === "Home") select(tabs[0]);
        if (e.key === "End") select(tabs[tabs.length - 1]);
      });
    });
  })();

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
})();
