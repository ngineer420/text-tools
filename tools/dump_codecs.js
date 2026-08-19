#!/usr/bin/env node
/* Read the codec tables out of the engine and print them as JSON.

   The build needs the Morse alphabet and the NATO spellings to render the
   reference tables on those two pages. Retyping them into a Python file would
   create a second copy of data that has exactly one correct value per row, and
   the two copies would disagree the first time either was corrected. So the
   generator reads the engine, the same way fontloom's tools/dump_styles.js
   reads its transform catalogue.

       node tools/dump_codecs.js > /dev/null && echo ok
*/
const C = require("../assets/js/codecs.js");

const morse = Object.keys(C.MORSE).map((k) => [k, C.MORSE[k]]);
const prosigns = Object.keys(C.PROSIGNS).map((k) => [k, C.PROSIGNS[k]]);
const nato = Object.keys(C.NATO).map((k) => [k, C.NATO[k], C.NATO_RADIO[k] || ""]);

// The printable ASCII range, which is what the binary pages' table is for.
const ascii = [];
for (let i = 32; i <= 126; i++) {
  ascii.push([
    i === 32 ? "(space)" : String.fromCharCode(i),
    i.toString(2).padStart(8, "0"),
    i.toString(16).toUpperCase().padStart(2, "0"),
    String(i),
  ]);
}

process.stdout.write(JSON.stringify({ morse, prosigns, nato, ascii }, null, 2));
