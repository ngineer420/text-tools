// Tests for assets/js/codecs.js. Run with: node assets/js/codecs.test.js
// No framework/deps — uses Node's built-in test runner + assert, same as
// app.test.js next door.
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  morseEncode, morseDecode, morseTiming, ditMs,
  textToBinary, binaryToText,
  caesar, rot13, caesarAll, caesarGuess,
  natoEncode, natoDecode,
  detectMorse, detectBinary, detectNato,
  MORSE, NATO,
} = require("./codecs.js");

/* ------------------------------------------------------------------ morse */

test("morse encodes the letters everyone checks first", () => {
  assert.equal(morseEncode("SOS"), "... --- ...");
  assert.equal(morseEncode("E"), ".");
  assert.equal(morseEncode("T"), "-");
});

test("morse separates words with a slash and letters with a space", () => {
  assert.equal(morseEncode("HELLO WORLD"),
    ".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
});

test("morse encoding is case insensitive", () => {
  assert.equal(morseEncode("sos"), morseEncode("SOS"));
});

test("morse round-trips through decode", () => {
  assert.equal(morseDecode(morseEncode("THE QUICK BROWN FOX")), "THE QUICK BROWN FOX");
});

test("morse marks characters it has no encoding for instead of dropping them", () => {
  // Dropping them silently shortens the output and hides which one was the
  // problem, which is the entire complaint about every other converter.
  assert.equal(morseEncode("A€"), ".- #");
});

test("morse decodes the three word separators people actually paste", () => {
  assert.equal(morseDecode("... / ---"), "S O");
  assert.equal(morseDecode("... | ---"), "S O");
  assert.equal(morseDecode("...   ---"), "S O");
});

test("morse decode accepts en dashes and middots from word processors", () => {
  assert.equal(morseDecode("··· ——— ···"), "SOS");
});

test("morse prosigns encode as one unbroken symbol", () => {
  // <AR> is the same marks as A followed by R; only the missing gap says it
  // is a prosign, so it must not come back as two symbols.
  assert.equal(morseEncode("<AR>"), ".-.-.");
  assert.equal(morseEncode("K<AR>"), "-.- .-.-.");
});

test("morse decode never invents a prosign out of ordinary letters", () => {
  // ".-.-." is both <AR> and the letters A,R run together. The letter reading
  // is overwhelmingly the likely one for a person pasting text.
  assert.notEqual(morseDecode(".-.-."), "<AR>");
});

test("morse decode marks an unknown symbol rather than returning nothing", () => {
  assert.equal(morseDecode("... -------- ---"), "S�O");
});

test("morse handles empty and whitespace-only input", () => {
  assert.equal(morseEncode(""), "");
  assert.equal(morseEncode("   "), "");
  assert.equal(morseDecode(""), "");
  assert.equal(morseEncode(null), "");
  assert.equal(morseDecode(undefined), "");
});

test("the ITU table has the punctuation most charts drop", () => {
  ["?", "/", "@", "=", "+", ":", "$"].forEach((c) => {
    assert.ok(MORSE[c], c + " should be in the table");
  });
});

/* --- timing --- */

test("WPM is calibrated on PARIS", () => {
  // The standard word is 50 dit units, so 20 WPM = 1000 dits/min = 60ms/dit.
  assert.equal(ditMs(20), 60);
  assert.equal(ditMs(5), 240);
});

test("ditMs falls back rather than dividing by zero", () => {
  assert.equal(ditMs(0), 60);
  assert.equal(ditMs("nonsense"), 60);
});

test("a dah is exactly three dits and the ratios never move with speed", () => {
  const at20 = morseTiming("-", 20);
  const at40 = morseTiming("-", 40);
  assert.equal(at20[0].ms, ditMs(20) * 3);
  assert.equal(at40[0].ms, ditMs(40) * 3);
  assert.equal(at20[0].ms / ditMs(20), at40[0].ms / ditMs(40));
});

test("morse timing uses 1/3/7 unit gaps", () => {
  const unit = ditMs(20);
  // "E E" -> dit, letter gap, dit
  const letters = morseTiming(".  .", 20).filter((s) => !s.on);
  assert.equal(letters[0].ms, unit * 3);
  // "E / E" -> dit, word gap, dit
  const words = morseTiming(". / .", 20).filter((s) => !s.on);
  assert.equal(words[0].ms, unit * 7);
});

test("morse timing of an empty message is an empty schedule", () => {
  assert.deepEqual(morseTiming("", 20), []);
});

/* --------------------------------------------------------------- binary */

test("text to binary produces 8-bit groups for ASCII", () => {
  assert.equal(textToBinary("Hi"), "01001000 01101001");
  assert.equal(textToBinary(" "), "00100000");
});

test("the two modes genuinely differ above code point 127", () => {
  // This is the distinction every other converter makes silently.
  assert.equal(textToBinary("é"), "11000011 10101001");           // UTF-8 bytes
  assert.equal(textToBinary("é", { mode: "codepoints" }), "11101001"); // one per char
});

test("the two modes agree exactly on pure ASCII", () => {
  assert.equal(textToBinary("Hello"), textToBinary("Hello", { mode: "codepoints" }));
});

test("hex is the same numbers in a shorter base", () => {
  assert.equal(textToBinary("Hi", { base: "hex" }), "48 69");
});

test("separators", () => {
  assert.equal(textToBinary("Hi", { separator: "" }), "0100100001101001");
  assert.equal(textToBinary("Hi", { separator: ", " }), "01001000, 01101001");
});

test("binary to text decodes with and without separators", () => {
  assert.equal(binaryToText("01001000 01101001").text, "Hi");
  assert.equal(binaryToText("0100100001101001").text, "Hi");
  assert.equal(binaryToText("01001000,01101001").text, "Hi");
});

test("binary to text names the bad group instead of returning nothing", () => {
  const res = binaryToText("01001000 01002");
  assert.ok(res.error, "should report an error");
  assert.match(res.error, /01002/);
  assert.equal(res.text, "");
});

test("hex decode accepts the 0x prefix", () => {
  assert.equal(binaryToText("0x48 0x69", { base: "hex" }).text, "Hi");
});

test("UTF-8 round-trips through binary, emoji included", () => {
  const s = "héllo \u{1F407}";
  assert.equal(binaryToText(textToBinary(s)).text, s);
});

test("code points round-trip through binary, emoji included", () => {
  const s = "héllo \u{1F407}";
  assert.equal(binaryToText(textToBinary(s, { mode: "codepoints" }), { mode: "codepoints" }).text, s);
});

test("binary of empty input is empty, and decode of empty is the same shape", () => {
  assert.equal(textToBinary(""), "");
  assert.deepEqual(binaryToText(""), { text: "", error: null });
});

/* --------------------------------------------------------------- caesar */

test("caesar shifts by three the way Caesar did", () => {
  assert.equal(caesar("attack at dawn", 3), "dwwdfn dw gdzq");
});

test("caesar leaves digits, spaces and punctuation alone", () => {
  assert.equal(caesar("abc, 123!", 1), "bcd, 123!");
});

test("caesar preserves case", () => {
  assert.equal(caesar("AbZ", 1), "BcA");
});

test("caesar wraps around the end of the alphabet", () => {
  assert.equal(caesar("z", 1), "a");
  assert.equal(caesar("a", 25), "z");
});

test("caesar normalises shifts outside 0-25, negatives included", () => {
  assert.equal(caesar("abc", 26), "abc");
  assert.equal(caesar("abc", 27), caesar("abc", 1));
  assert.equal(caesar("bcd", -1), "abc");
});

test("rot13 is its own inverse — the property the whole convention rests on", () => {
  const s = "Spoilers ahead: the butler did it.";
  assert.equal(rot13(rot13(s)), s);
  assert.equal(rot13("Hello, World!"), "Uryyb, Jbeyq!");
});

test("rot13 is exactly caesar 13", () => {
  assert.equal(rot13("abcxyz"), caesar("abcxyz", 13));
});

test("caesarAll returns all twenty-six readings, shift 0 first and unchanged", () => {
  const rows = caesarAll("abc");
  assert.equal(rows.length, 26);
  assert.equal(rows[0].shift, 0);
  assert.equal(rows[0].text, "abc");
  assert.equal(rows[13].text, rot13("abc"));
});

test("frequency analysis recovers the shift on a sentence", () => {
  const plain = "the quick brown fox jumps over the lazy dog and then does it again";
  [3, 7, 13, 19].forEach((n) => {
    // caesarGuess returns the shift that DECODES, i.e. the complement.
    const guessed = caesarGuess(caesar(plain, n));
    assert.equal(caesar(caesar(plain, n), guessed), plain, "failed for shift " + n);
  });
});

test("caesarGuess does not throw on input with no letters", () => {
  assert.equal(typeof caesarGuess("12345"), "number");
  assert.equal(typeof caesarGuess(""), "number");
});

/* ----------------------------------------------------------------- nato */

test("nato spells letters and digits", () => {
  assert.equal(natoEncode("SOS"), "Sierra Oscar Sierra");
  assert.equal(natoEncode("A1"), "Alfa One");
});

test("the official spellings are the odd-looking ones", () => {
  // Both are deliberate: ph is not /f/ in most languages, and a French
  // speaker leaves a single final t silent.
  assert.equal(NATO.A, "Alfa");
  assert.equal(NATO.J, "Juliett");
});

test("the aviation digit forms are opt-in", () => {
  assert.equal(natoEncode("359"), "Three Five Nine");
  assert.equal(natoEncode("359", { radio: true }), "Tree Fife Niner");
});

test("nato marks a space rather than losing it", () => {
  assert.equal(natoEncode("A B"), "Alfa (space) Bravo");
});

test("nato decode accepts the common misspellings on input", () => {
  assert.equal(natoDecode("Alpha Bravo"), "AB");
  assert.equal(natoDecode("Alfa Bravo"), "AB");
  assert.equal(natoDecode("Juliet Xray"), "JX");
});

test("nato round-trips", () => {
  assert.equal(natoDecode(natoEncode("SOS")), "SOS");
});

/* ------------------------------------------------------------- detection */

test("detect tells morse from text", () => {
  assert.equal(detectMorse("... --- ..."), "decode");
  assert.equal(detectMorse("hello"), "encode");
  assert.equal(detectMorse(""), "encode");
});

test("detect tells binary from text, and needs a full group before it commits", () => {
  assert.equal(detectBinary("01001000"), "decode");
  assert.equal(detectBinary("hello"), "encode");
  // "10" is a plausible thing to type as text; one byte is not.
  assert.equal(detectBinary("10"), "encode");
});

test("detect tells hex apart when the base says hex", () => {
  assert.equal(detectBinary("48 69", "hex"), "decode");
  assert.equal(detectBinary("hello there", "hex"), "encode");
});

test("detect needs most of the words to be phonetic before flipping", () => {
  assert.equal(detectNato("Sierra Oscar Sierra"), "decode");
  assert.equal(detectNato("the quick brown fox"), "encode");
  // A single word is ambiguous — Mike and Victor are also names.
  assert.equal(detectNato("Mike"), "encode");
});

/* --------------------------------------------------------------- safety */

test("nothing throws on null, undefined or a number", () => {
  [null, undefined, 42].forEach((v) => {
    assert.doesNotThrow(() => morseEncode(v));
    assert.doesNotThrow(() => morseDecode(v));
    assert.doesNotThrow(() => textToBinary(v));
    assert.doesNotThrow(() => binaryToText(v));
    assert.doesNotThrow(() => caesar(v, 3));
    assert.doesNotThrow(() => natoEncode(v));
    assert.doesNotThrow(() => natoDecode(v));
  });
});
