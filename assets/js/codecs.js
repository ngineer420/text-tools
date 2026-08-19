/* textkitpro — codecs.
   Pure functions, no DOM, no network. Every translator page on this site is a
   thin wiring layer over something in here, which is the only reason six pages
   is a sane amount of code rather than six half-agreeing implementations of
   the same morse table.

   Everything is total: nothing throws on unexpected input, because these run on
   every keystroke and a thrown exception mid-type would blank the output while
   someone is still typing the thing that would have made it valid. Characters
   that have no encoding come back marked rather than dropped, so a visitor can
   see WHICH character the table does not cover instead of wondering why the
   output is short. */
(function (root) {
  "use strict";

  /* ---------------------------------------------------------------- morse */

  /* ITU-R M.1677-1. Letters, digits and the punctuation the recommendation
     actually lists — plus the prosigns, which are not letters at all but
     procedural signals sent as one unbroken symbol. They are written here in
     angle brackets (<AR>, <SK>) because that is how they appear in every
     operating manual, and because it keeps them out of the letter namespace:
     <AR> is di-dah-di-dah-dit, which is also exactly "A" then "R" run
     together, and only the absence of a letter gap distinguishes them. */
  var MORSE = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.",
    G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..",
    M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.",
    S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
    Y: "-.--", Z: "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
    "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
    ".": ".-.-.-", ",": "--..--", "?": "..--..", "'": ".----.",
    "!": "-.-.--", "/": "-..-.", "(": "-.--.", ")": "-.--.-",
    "&": ".-...", ":": "---...", ";": "-.-.-.", "=": "-...-",
    "+": ".-.-.", "-": "-....-", "_": "..--.-", '"': ".-..-.",
    $: "...-..-", "@": ".--.-.",
    // Accented forms the ITU table carries, useful outside English.
    "À": ".--.-", "Ä": ".-.-", "Ç": "-.-..", "È": ".-..-", "É": "..-..",
    "Ñ": "--.--", "Ö": "---.", "Ü": "..--"
  };

  var PROSIGNS = {
    "<AR>": ".-.-.",    // end of message
    "<AS>": ".-...",    // wait
    "<BK>": "-...-.-",  // break
    "<BT>": "-...-",    // new paragraph / separator
    "<CL>": "-.-..-..", // closing station
    "<CT>": "-.-.-",    // start of transmission
    "<KN>": "-.--.",    // go ahead, named station only
    "<SK>": "...-.-",   // end of contact
    "<SN>": "...-.",    // understood
    "<SOS>": "...---...", // distress, sent as one symbol
    "<HH>": "........" // error
  };

  var MORSE_TO_CHAR = (function () {
    var out = {}, k;
    // Letters first, then prosigns are NOT added — several collide with letter
    // pairs and the letter reading is overwhelmingly the likely one. A decoder
    // that turned every ".-.-." into <AR> would mangle ordinary text.
    for (k in MORSE) if (Object.prototype.hasOwnProperty.call(MORSE, k)) {
      if (!(MORSE[k] in out)) out[MORSE[k]] = k;
    }
    return out;
  })();

  function morseEncode(text, opts) {
    opts = opts || {};
    var letterGap = opts.letterGap || " ";
    var wordGap = opts.wordGap || " / ";
    var str = String(text == null ? "" : text);
    var words = str.trim().split(/\s+/);
    if (str.trim() === "") return "";
    return words.map(function (word) {
      var symbols = [];
      var i = 0;
      while (i < word.length) {
        // A prosign is written literally in the input and consumed whole.
        if (word[i] === "<") {
          var close = word.indexOf(">", i);
          if (close !== -1) {
            var tag = word.slice(i, close + 1).toUpperCase();
            if (PROSIGNS[tag]) { symbols.push(PROSIGNS[tag]); i = close + 1; continue; }
          }
        }
        var ch = word[i].toUpperCase();
        if (MORSE[ch]) symbols.push(MORSE[ch]);
        else symbols.push("#");   // marked, not dropped
        i++;
      }
      return symbols.join(letterGap);
    }).join(wordGap);
  }

  function morseDecode(code) {
    var str = String(code == null ? "" : code)
      // People type morse with every dash character a keyboard offers.
      .replace(/[–—−]/g, "-")
      .replace(/[·•∙]/g, ".")
      .trim();
    if (!str) return "";
    // Word separator: a slash, a pipe, or a run of 3+ spaces. Accepting all
    // three matters because pasted morse from three different sites uses three
    // different conventions and none of them say which.
    var words = str.split(/\s*[/|]\s*|\s{3,}/);
    return words.map(function (word) {
      return word.trim().split(/\s+/).map(function (sym) {
        if (!sym) return "";
        return MORSE_TO_CHAR[sym] || "�";
      }).join("");
    }).filter(function (w) { return w !== ""; }).join(" ");
  }

  /* Timing, in dit units, straight from the ITU definition: a dah is 3 dits, the
     gap inside a letter is 1, between letters 3, between words 7. The page's
     WPM slider is calibrated on PARIS, the standard 50-dit word, so 20 WPM is
     1000 dits a minute and one dit is 60 ms. */
  function ditMs(wpm) {
    var w = Number(wpm);
    if (!isFinite(w) || w <= 0) w = 20;
    return 1200 / w;
  }

  /* Turns a morse string into a flat schedule of on/off spans in milliseconds,
     so the player is a loop over an array rather than a nest of timeouts.
     Returned as [{on: bool, ms: n}, ...]. */
  function morseTiming(code, wpm) {
    var unit = ditMs(wpm);
    var out = [];
    var str = String(code == null ? "" : code).trim();
    if (!str) return out;
    var words = str.split(/\s*[/|]\s*|\s{3,}/);
    words.forEach(function (word, wi) {
      if (wi > 0) out.push({ on: false, ms: unit * 7 });
      word.trim().split(/\s+/).forEach(function (sym, si) {
        if (si > 0) out.push({ on: false, ms: unit * 3 });
        for (var i = 0; i < sym.length; i++) {
          if (i > 0) out.push({ on: false, ms: unit });
          if (sym[i] === ".") out.push({ on: true, ms: unit });
          else if (sym[i] === "-") out.push({ on: true, ms: unit * 3 });
        }
      });
    });
    return out;
  }

  /* ------------------------------------------------------------ binary/hex */

  /* Two modes, because "text to binary" means two different things and the
     tools that pick one silently are wrong half the time.

     "bytes" is UTF-8: every character becomes one or more 8-bit groups. This is
     what a programmer means, it round-trips anything, and é is two groups.

     "codepoints" is one group per character, width set by the character: this
     is what a puzzle or a homework question means, é is a single 11101001, and
     it does not survive being handed to a byte-oriented decoder.

     ASCII-only input is identical under both, which is why the difference goes
     unnoticed until someone types an emoji. */

  function toUtf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var cp = str.codePointAt(i);
      if (cp > 0xffff) i++;
      if (cp < 0x80) out.push(cp);
      else if (cp < 0x800) out.push(0xc0 | (cp >> 6), 0x80 | (cp & 63));
      else if (cp < 0x10000) out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
      else out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    }
    return out;
  }

  function fromUtf8Bytes(bytes) {
    var out = "", i = 0;
    while (i < bytes.length) {
      var b = bytes[i];
      if (b < 0x80) { out += String.fromCodePoint(b); i += 1; }
      else if (b >= 0xc0 && b < 0xe0 && i + 1 < bytes.length) {
        out += String.fromCodePoint(((b & 31) << 6) | (bytes[i + 1] & 63)); i += 2;
      } else if (b >= 0xe0 && b < 0xf0 && i + 2 < bytes.length) {
        out += String.fromCodePoint(((b & 15) << 12) | ((bytes[i + 1] & 63) << 6) | (bytes[i + 2] & 63)); i += 3;
      } else if (b >= 0xf0 && i + 3 < bytes.length) {
        out += String.fromCodePoint(((b & 7) << 18) | ((bytes[i + 1] & 63) << 12) | ((bytes[i + 2] & 63) << 6) | (bytes[i + 3] & 63)); i += 4;
      } else { out += "�"; i += 1; }
    }
    return out;
  }

  function pad(s, n) { while (s.length < n) s = "0" + s; return s; }

  function textToBinary(text, opts) {
    opts = opts || {};
    var sep = opts.separator === undefined ? " " : opts.separator;
    var base = opts.base === "hex" ? 16 : 2;
    var str = String(text == null ? "" : text);
    if (!str) return "";
    var groups;
    if (opts.mode === "codepoints") {
      groups = [];
      for (var i = 0; i < str.length; i++) {
        var cp = str.codePointAt(i);
        if (cp > 0xffff) i++;
        var s = cp.toString(base);
        // Width follows the character, rounded up to a byte, so the output
        // still reads as fixed-width columns rather than ragged.
        var width = base === 2 ? Math.max(8, Math.ceil(s.length / 8) * 8)
                               : Math.max(2, Math.ceil(s.length / 2) * 2);
        groups.push(pad(s, width));
      }
    } else {
      groups = toUtf8Bytes(str).map(function (b) {
        return pad(b.toString(base), base === 2 ? 8 : 2);
      });
    }
    if (base === 16 && opts.upper !== false) groups = groups.map(function (g) { return g.toUpperCase(); });
    return groups.join(sep);
  }

  function binaryToText(code, opts) {
    opts = opts || {};
    var str = String(code == null ? "" : code).trim();
    if (!str) return { text: "", error: null };
    var base = opts.base === "hex" ? 16 : 2;
    var tokens;
    if (/[\s,]/.test(str)) {
      tokens = str.split(/[\s,]+/).filter(Boolean);
    } else {
      // Unseparated: chop into fixed-width groups. This is the common paste.
      var w = base === 2 ? 8 : 2;
      tokens = str.replace(/0[xX]/g, "").match(new RegExp(".{1," + w + "}", "g")) || [];
    }
    var valid = base === 2 ? /^[01]+$/ : /^[0-9a-fA-F]+$/;
    var values = [];
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i].replace(/^0[xX]/, "");
      if (!valid.test(t)) return { error: "“" + tokens[i] + "” is not " + (base === 2 ? "binary" : "hex") + ".", text: "" };
      values.push(parseInt(t, base));
    }
    if (opts.mode === "codepoints") {
      return { text: values.map(function (v) {
        try { return String.fromCodePoint(v); } catch (e) { return "�"; }
      }).join(""), error: null };
    }
    return { text: fromUtf8Bytes(values), error: null };
  }

  /* ----------------------------------------------------------- caesar/rot13 */

  /* One implementation. /rot13 is this with the shift pinned at 13, which is
     the whole reason ROT13 is its own thing: 13 is half of 26, so encoding and
     decoding are the same operation and no key has to travel with the message.
     Non-letters pass through untouched — that is the definition, and it is also
     why ROT13 hides nothing from anything but an accidental glance. */
  function caesar(text, shift) {
    var n = ((Number(shift) || 0) % 26 + 26) % 26;
    return String(text == null ? "" : text).replace(/[a-zA-Z]/g, function (c) {
      var base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base);
    });
  }

  function rot13(text) { return caesar(text, 13); }

  /* Every shift at once. A Caesar cipher has 25 wrong answers and one right
     one, and the fastest way to break it by hand has always been to read all
     26 lines and spot the English — so the page shows them rather than
     pretending a frequency score is more useful than a human eye. */
  function caesarAll(text) {
    var rows = [];
    for (var i = 0; i < 26; i++) rows.push({ shift: i, text: caesar(text, i) });
    return rows;
  }

  /* Chi-squared against English letter frequencies, lowest wins. Used only to
     suggest a shift, never to replace the table. */
  var ENGLISH_FREQ = [8.17,1.49,2.78,4.25,12.70,2.23,2.02,6.09,6.97,0.15,0.77,4.03,2.41,
                      6.75,7.51,1.93,0.10,5.99,6.33,9.06,2.76,0.98,2.36,0.15,1.97,0.07];

  function caesarGuess(text) {
    var best = { shift: 0, score: Infinity };
    for (var s = 0; s < 26; s++) {
      var candidate = caesar(text, s);
      var counts = new Array(26).fill(0), total = 0;
      for (var i = 0; i < candidate.length; i++) {
        var c = candidate[i].toUpperCase().charCodeAt(0) - 65;
        if (c >= 0 && c < 26) { counts[c]++; total++; }
      }
      if (!total) continue;
      var score = 0;
      for (var j = 0; j < 26; j++) {
        var expected = total * ENGLISH_FREQ[j] / 100;
        score += Math.pow(counts[j] - expected, 2) / (expected || 1);
      }
      if (score < best.score) best = { shift: s, score: score };
    }
    return best.shift;
  }

  /* ------------------------------------------------------------------ NATO */

  /* The ICAO/NATO spelling alphabet. The spellings below are the official
     ones, which is why several look misspelt: ALFA and JULIETT are deliberate,
     spelt that way so speakers of languages where "ph" is not /f/ and a
     trailing "te" is silent still say them correctly. */
  var NATO = {
    A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
    G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima",
    M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
    S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey",
    X: "X-ray", Y: "Yankee", Z: "Zulu",
    "0": "Zero", "1": "One", "2": "Two", "3": "Three", "4": "Four",
    "5": "Five", "6": "Six", "7": "Seven", "8": "Eight", "9": "Nine"
  };

  /* Aviation and maritime radio say several digits differently from ordinary
     English, so that they survive a bad channel: "niner" so nine is not heard
     as the German "nein", "tree" and "fife" because the English /θ/ and the
     final /v/ are the first sounds lost to noise. */
  var NATO_RADIO = {
    "3": "Tree", "4": "Fower", "5": "Fife", "9": "Niner",
    ".": "Decimal", "-": "Dash"
  };

  function natoEncode(text, opts) {
    opts = opts || {};
    var radio = !!opts.radio;
    var str = String(text == null ? "" : text);
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var ch = str[i].toUpperCase();
      if (/\s/.test(ch)) { out.push("(space)"); continue; }
      if (radio && NATO_RADIO[ch]) { out.push(NATO_RADIO[ch]); continue; }
      out.push(NATO[ch] || ch);
    }
    return out.join(" ");
  }

  function natoDecode(text) {
    var lookup = {};
    Object.keys(NATO).forEach(function (k) { lookup[NATO[k].toUpperCase()] = k; });
    Object.keys(NATO_RADIO).forEach(function (k) { lookup[NATO_RADIO[k].toUpperCase()] = k; });
    lookup["(SPACE)"] = " ";
    lookup["ALPHA"] = "A";   // the common misspelling, accepted on input only
    lookup["JULIET"] = "J";
    lookup["XRAY"] = "X";
    return String(text == null ? "" : text).trim().split(/[\s,]+/).filter(Boolean)
      .map(function (w) {
        var hit = lookup[w.toUpperCase()];
        return hit === undefined ? (w.length === 1 ? w : "") : hit;
      }).join("");
  }

  /* -------------------------------------------------------------- autodetect */

  /* Which direction did they mean? Used to flip the translate direction the
     moment someone pastes rather than types, because the single most common
     complaint about every translator on the web is that it encoded the thing
     you pasted in expecting it to be decoded. */
  function detectMorse(str) {
    var s = String(str || "").trim();
    if (!s) return "encode";
    return /^[.\-–—\s/|·•]+$/.test(s) ? "decode" : "encode";
  }

  function detectBinary(str, base) {
    var s = String(str || "").trim();
    if (!s) return "encode";
    if (base === "hex") return /^(0[xX])?[0-9a-fA-F\s,]+$/.test(s) && /[0-9a-fA-F]{2}/.test(s) ? "decode" : "encode";
    return /^[01\s,]+$/.test(s) && s.replace(/[\s,]/g, "").length >= 8 ? "decode" : "encode";
  }

  function detectNato(str) {
    var s = String(str || "").trim();
    if (!s) return "encode";
    var words = s.split(/[\s,]+/).filter(Boolean);
    if (words.length < 2) return "encode";
    var known = 0;
    var names = {};
    Object.keys(NATO).forEach(function (k) { names[NATO[k].toUpperCase()] = 1; });
    names.ALPHA = 1; names.JULIET = 1; names.XRAY = 1;
    words.forEach(function (w) { if (names[w.toUpperCase()]) known++; });
    return known / words.length > 0.6 ? "decode" : "encode";
  }

  var api = {
    MORSE: MORSE, PROSIGNS: PROSIGNS, NATO: NATO, NATO_RADIO: NATO_RADIO,
    morseEncode: morseEncode, morseDecode: morseDecode,
    morseTiming: morseTiming, ditMs: ditMs,
    textToBinary: textToBinary, binaryToText: binaryToText,
    caesar: caesar, rot13: rot13, caesarAll: caesarAll, caesarGuess: caesarGuess,
    natoEncode: natoEncode, natoDecode: natoDecode,
    detectMorse: detectMorse, detectBinary: detectBinary, detectNato: detectNato
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.Codecs = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
