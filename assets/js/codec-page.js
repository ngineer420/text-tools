/* textkitpro.com — the runtime behind the six translator pages.

   One driver, four control shapes. Every page carries
   `<main data-codec-engine="…">` and the driver reads the controls that engine
   is documented to have; a page that omits an optional control simply does not
   get that behaviour, so /rot13 can ship the caesar engine with no shift box
   and nothing here needs to know that /rot13 exists.

   This is a separate file rather than six IIFEs inside app.js for the same
   reason cleaner-page.js is: none of it runs on the other twenty pages, and
   app.js is already loaded on every one of them. It borrows `debounce` and
   `wireCopy` from `window.TextKitClean` rather than redefining them.

   The audio is WebAudio, generated from an oscillator at play time. There is
   no file to fetch, which is the point — a morse player that needs a network
   request is a morse player that does not work on the train. */
(function () {
  "use strict";

  var C = window.Codecs;
  var api = window.TextKitClean;
  if (!C || !api) return;

  var main = document.querySelector("main[data-codec-engine]");
  if (!main) return;

  /* Every control selector below is qualified to `button[...]`, and <main>'s
     own seed attributes are namespaced `data-codec-init-*`. Both halves of
     that matter: <main> encloses the controls, so a bare `[data-codec-dir]`
     matched the container as well as the buttons, gave it a click handler, and
     then every click on a real button bubbled up and fired it — which reset
     the very setting the button had just changed, and stopped Morse playback
     the instant Play was pressed. */

  var engine = main.dataset.codecEngine;
  var input = document.getElementById("co-input");
  var output = document.getElementById("co-output");
  if (!input || !output) return;

  var statsEl = document.getElementById("co-stats");
  var errorEl = document.getElementById("co-error");
  var swapBtn = document.getElementById("co-swap");
  var dirBtns = Array.prototype.slice.call(document.querySelectorAll("button[data-codec-dir]"));

  var dir = main.dataset.codecInitDir || "encode";
  var touched = false;   // has the visitor typed yet?

  /* Announce one headline sentence. assets/js/announce.js holds the throttle
     and the diff-against-last guard, so identical text is never re-announced. */
  function say(node, text) {
    if (!node) return;
    if (window.TKAnnounce) window.TKAnnounce.say(node, text);
    else if (node.textContent !== text) node.textContent = text;
  }

  function setError(msg) {
    if (!errorEl) return;
    errorEl.textContent = msg || "";
    errorEl.style.display = msg ? "block" : "none";
  }

  function setPressed(list, matches) {
    list.forEach(function (b) {
      var on = matches(b);
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  /* ------------------------------------------------------------- engines */

  var engines = {};

  /* ---- morse ---- */
  engines.morse = (function () {
    var wpmInput = document.getElementById("co-wpm");
    var wpmValue = document.getElementById("co-wpm-value");
    var pitchInput = document.getElementById("co-pitch");
    var pitchValue = document.getElementById("co-pitch-value");
    var playBtn = document.getElementById("co-play");
    var stopBtn = document.getElementById("co-stop");
    var lamp = document.getElementById("co-lamp");
    var playHint = document.getElementById("co-play-hint");

    var audioCtx = null;
    var osc = null;
    var gain = null;
    var timers = [];
    var playing = false;

    function wpm() { return wpmInput ? Number(wpmInput.value) || 20 : 20; }
    function pitch() { return pitchInput ? Number(pitchInput.value) || 600 : 600; }

    /* One oscillator for the whole message, gated by a gain node. Starting and
       stopping an oscillator per dit produces a click at every edge; ramping a
       gain over four milliseconds does not, and four milliseconds is far below
       the shortest dit any sane WPM produces. */
    function ensureAudio() {
      var Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return null;
      if (!audioCtx) {
        audioCtx = new Ctor();
        gain = audioCtx.createGain();
        gain.gain.value = 0;
        gain.connect(audioCtx.destination);
        osc = audioCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = pitch();
        osc.connect(gain);
        osc.start();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      osc.frequency.setValueAtTime(pitch(), audioCtx.currentTime);
      return audioCtx;
    }

    function clearTimers() {
      timers.forEach(clearTimeout);
      timers = [];
    }

    function stop() {
      clearTimers();
      playing = false;
      if (gain && audioCtx) {
        gain.gain.cancelScheduledValues(audioCtx.currentTime);
        gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.005);
      }
      if (lamp) lamp.classList.remove("is-on");
      if (playBtn) playBtn.textContent = "▶ Play";
      if (stopBtn) stopBtn.disabled = true;
    }

    function play() {
      var code = dir === "encode" ? output.value : input.value;
      var plan = C.morseTiming(code, wpm());
      if (!plan.length) return;
      stop();
      var ctx = ensureAudio();
      if (!ctx) {
        if (playHint) playHint.textContent = "This browser has no Web Audio support, so the beeper is unavailable. The flashing lamp still follows the message.";
      }
      playing = true;
      if (playBtn) playBtn.textContent = "▶ Playing…";
      if (stopBtn) stopBtn.disabled = false;

      /* The audio is SCHEDULED against the audio clock — sample-accurate — and
         the lamp is driven by setTimeout, which is not. Morse is judged by ear,
         so the ear gets the accurate clock and the eye gets the approximate
         one. Driving both from setTimeout would make the beeps audibly ragged
         under load. */
      var when = ctx ? ctx.currentTime + 0.06 : 0;
      var elapsed = 60;
      plan.forEach(function (span) {
        var secs = span.ms / 1000;
        if (span.on && ctx) {
          gain.gain.setTargetAtTime(0.22, when, 0.004);
          gain.gain.setTargetAtTime(0, when + secs - 0.004, 0.004);
        }
        if (span.on && lamp) {
          var onAt = elapsed;
          timers.push(setTimeout(function () { lamp.classList.add("is-on"); }, onAt));
          timers.push(setTimeout(function () { lamp.classList.remove("is-on"); }, onAt + span.ms));
        }
        when += secs;
        elapsed += span.ms;
      });
      timers.push(setTimeout(stop, elapsed + 120));
    }

    if (playBtn) playBtn.addEventListener("click", function () { playing ? stop() : play(); });
    if (stopBtn) { stopBtn.addEventListener("click", stop); stopBtn.disabled = true; }
    if (wpmInput) wpmInput.addEventListener("input", function () {
      if (wpmValue) wpmValue.textContent = wpmInput.value + " WPM";
      if (playing) { stop(); play(); }
    });
    if (pitchInput) pitchInput.addEventListener("input", function () {
      if (pitchValue) pitchValue.textContent = pitchInput.value + " Hz";
      if (audioCtx && osc) osc.frequency.setValueAtTime(pitch(), audioCtx.currentTime);
    });

    return {
      run: function () {
        if (dir === "encode") {
          output.value = C.morseEncode(input.value);
          return input.value.replace(/\s+/g, "").length + " characters in, "
            + output.value.replace(/[^.\-]/g, "").length + " dits and dahs out";
        }
        output.value = C.morseDecode(input.value);
        var unknown = (output.value.match(/�/g) || []).length;
        return unknown
          ? unknown + " symbol" + (unknown === 1 ? "" : "s") + " had no letter in the ITU table"
          : output.value.length + " characters decoded";
      },
      detect: function (v) { return C.detectMorse(v); },
      stop: stop
    };
  })();

  /* ---- binary / hex ---- */
  engines.binary = (function () {
    var baseBtns = Array.prototype.slice.call(document.querySelectorAll("button[data-codec-base]"));
    var modeBtns = Array.prototype.slice.call(document.querySelectorAll("button[data-codec-mode]"));
    var sepSelect = document.getElementById("co-sep");
    var base = main.dataset.codecInitBase || "binary";
    var mode = "bytes";

    function sep() {
      if (!sepSelect) return " ";
      if (sepSelect.value === "none") return "";
      if (sepSelect.value === "comma") return ", ";
      if (sepSelect.value === "newline") return "\n";
      return " ";
    }

    baseBtns.forEach(function (b) {
      b.addEventListener("click", function () { base = b.dataset.codecBase; sync(); render(); });
    });
    modeBtns.forEach(function (b) {
      b.addEventListener("click", function () { mode = b.dataset.codecMode; sync(); render(); });
    });
    if (sepSelect) sepSelect.addEventListener("change", render);

    function sync() {
      setPressed(baseBtns, function (b) { return b.dataset.codecBase === base; });
      setPressed(modeBtns, function (b) { return b.dataset.codecMode === mode; });
    }
    sync();

    return {
      run: function () {
        if (dir === "encode") {
          output.value = C.textToBinary(input.value, { base: base, mode: mode, separator: sep() });
          var groups = output.value ? output.value.trim().split(/[\s,]+/).length : 0;
          return groups + (base === "hex" ? " hex pair" : " group") + (groups === 1 ? "" : "s")
            + (mode === "bytes" ? " · one per UTF-8 byte" : " · one per character");
        }
        var res = C.binaryToText(input.value, { base: base, mode: mode });
        if (res.error) { output.value = ""; setError(res.error); return ""; }
        output.value = res.text;
        return res.text.length + " character" + (res.text.length === 1 ? "" : "s") + " decoded";
      },
      detect: function (v) { return C.detectBinary(v, base); },
      stop: function () {}
    };
  })();

  /* ---- caesar / rot13 ---- */
  engines.caesar = (function () {
    var shiftInput = document.getElementById("co-shift");
    var shiftBtns = Array.prototype.slice.call(document.querySelectorAll("button[data-codec-shift]"));
    var guessBtn = document.getElementById("co-guess");
    var tableBody = document.getElementById("co-table-body");
    var locked = main.dataset.codecInitLocked === "1";
    var shift = Number(main.dataset.codecInitShift || 3);

    function setShift(n) {
      shift = ((Number(n) || 0) % 26 + 26) % 26;
      if (shiftInput) shiftInput.value = String(shift);
      setPressed(shiftBtns, function (b) { return Number(b.dataset.codecShift) === shift; });
      render();
    }

    if (shiftInput) shiftInput.addEventListener("input", function () { setShift(shiftInput.value); });
    shiftBtns.forEach(function (b) {
      b.addEventListener("click", function () { setShift(b.dataset.codecShift); });
    });
    if (guessBtn) guessBtn.addEventListener("click", function () {
      var g = C.caesarGuess(input.value);
      setShift(g);
      say(statsEl, "Letter frequencies point at shift " + g + ".");
    });

    function renderTable() {
      if (!tableBody) return;
      var rows = C.caesarAll(input.value);
      tableBody.innerHTML = "";
      rows.forEach(function (r) {
        var tr = document.createElement("tr");
        if (r.shift === shift) tr.className = "is-current";
        var th = document.createElement("th");
        th.scope = "row";
        th.textContent = r.shift === 0 ? "0 (unchanged)" : String(r.shift);
        var td = document.createElement("td");
        td.className = "shift-text";
        td.textContent = r.text.slice(0, 160);
        tr.appendChild(th);
        tr.appendChild(td);
        tableBody.appendChild(tr);
      });
    }

    return {
      run: function () {
        // Decoding a Caesar is encoding by the complement, which is why the
        // direction toggle here changes the arithmetic rather than calling a
        // second function. ROT13 is the case where both are the same number.
        var n = dir === "encode" ? shift : 26 - shift;
        output.value = C.caesar(input.value, n);
        renderTable();
        var letters = (input.value.match(/[a-z]/gi) || []).length;
        return locked
          ? letters + " letter" + (letters === 1 ? "" : "s") + " rotated by 13 · run it again to get back"
          : letters + " letter" + (letters === 1 ? "" : "s") + " shifted by " + (dir === "encode" ? shift : "−" + shift);
      },
      detect: function () { return dir; },
      init: function () { if (!locked) setShift(shift); else renderTable(); },
      stop: function () {}
    };
  })();

  /* ---- NATO phonetic ---- */
  engines.nato = (function () {
    var variantBtns = Array.prototype.slice.call(document.querySelectorAll("button[data-codec-variant]"));
    var variant = "standard";
    variantBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        variant = b.dataset.codecVariant;
        setPressed(variantBtns, function (x) { return x.dataset.codecVariant === variant; });
        render();
      });
    });
    setPressed(variantBtns, function (b) { return b.dataset.codecVariant === variant; });

    return {
      run: function () {
        if (dir === "encode") {
          output.value = C.natoEncode(input.value, { radio: variant === "radio" });
          var n = (input.value.match(/[a-z0-9]/gi) || []).length;
          return n + " character" + (n === 1 ? "" : "s") + " spelt out";
        }
        output.value = C.natoDecode(input.value);
        return output.value.length + " character" + (output.value.length === 1 ? "" : "s") + " read back";
      },
      detect: function (v) { return C.detectNato(v); },
      stop: function () {}
    };
  })();

  var E = engines[engine];
  if (!E) return;

  /* ---------------------------------------------------------- direction */

  function setDir(next, fromDetect) {
    dir = next;
    setPressed(dirBtns, function (b) { return b.dataset.codecDir === dir; });
    if (!fromDetect) render();
  }

  dirBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      E.stop();
      setDir(b.dataset.codecDir);
    });
  });

  if (swapBtn) swapBtn.addEventListener("click", function () {
    // Swap moves the output into the input as well as flipping the arrow. A
    // toggle that flips the direction but leaves the old text in the box shows
    // you the encoding of an encoding, which is never what anyone meant.
    E.stop();
    var carried = output.value;
    setDir(dir === "encode" ? "decode" : "encode", true);
    input.value = carried;
    render();
    input.focus();
  });

  /* ------------------------------------------------------------- render */

  function render() {
    setError("");
    var note = E.run();
    if (note !== undefined) say(statsEl, input.value.trim() ? note : "");
  }

  input.addEventListener("input", function () { touched = true; });
  input.addEventListener("input", api.debounce(render, 100));

  /* Autodetect fires on PASTE only, never on typing. Flipping direction under
     someone mid-word is worse than the problem it solves; flipping it the
     instant they paste a screenful of dots and dashes into a page that was set
     to encode is the single thing every translator on the web gets wrong. */
  input.addEventListener("paste", function (e) {
    var text = (e.clipboardData || window.clipboardData);
    text = text ? text.getData("text") : "";
    if (!text || !E.detect) return;
    var want = E.detect(text);
    if (want && want !== dir) {
      setTimeout(function () {
        setDir(want, true);
        render();
        say(statsEl, "That looked like something to decode, so the direction flipped. "
          + (swapBtn ? "Use Swap to change it back." : ""));
      }, 0);
    }
  });

  api.wireCopy("co-copy", "co-copy-flash", function () { return output.value; });
  api.wireDownload("co-download", api.pageSlug("morse-code-translator") + ".txt", function () { return output.value; });

  if (E.init) E.init();
  setDir(dir, true);
  render();
})();
