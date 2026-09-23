/* Shared live-region announcer.
 *
 * Portfolio issue ngineer420/ngineer420.github.io#29: a tool writes its result
 * to the page and announces it to nobody. The fix is one `role="status"` node
 * per tool, and a throttle, because a live region wired straight to a keystroke
 * handler is worse than no live region at all — a screen reader then reads a
 * new number on every character typed and the visitor cannot hear the page.
 *
 * Two rules, both from perfecttune/assets/metronome.js:298-334:
 *
 *   1. Never write text that is already there. An assignment to textContent
 *      re-announces the node even when the string does not change, so the
 *      guard is the difference between one announcement and forty.
 *   2. At most one announcement every 500 ms. The first change after a quiet
 *      period lands at once, so the visible hint never lags behind the result.
 *      Changes inside the window are collapsed into a single write at the end
 *      of it, and only the last of them is announced.
 *
 * Announce the headline sentence only. A whole output blob or a results table
 * in a live region is not information, it is a stuck horn.
 *
 *     TKAnnounce.say(document.getElementById("wc-status"), "482 words");
 */
(function (global) {
  "use strict";

  var DELAY = 500;
  // Keyed on the node itself, so a node that leaves the document takes its
  // state with it rather than sitting in a list this file never empties.
  var states = new WeakMap();

  function stateFor(node) {
    var found = states.get(node);
    if (found) return found;
    var fresh = { node: node, last: null, pending: null, timer: 0, wrote: 0 };
    states.set(node, fresh);
    return fresh;
  }

  function commit(state, text) {
    state.timer = 0;
    state.pending = null;
    if (text === state.last) return;
    state.last = text;
    state.wrote = Date.now();
    state.node.textContent = text;
  }

  /* Put `text` in `node`, at most once every 500 ms, never twice in a row. */
  function say(node, text) {
    if (!node) return;
    var next = text === null || text === undefined ? "" : String(text);
    var state = stateFor(node);
    if (next === state.last && !state.timer) return;
    var waited = Date.now() - state.wrote;
    if (!state.timer && waited >= DELAY) {
      commit(state, next);
      return;
    }
    state.pending = next;
    if (!state.timer) {
      state.timer = global.setTimeout(function () {
        commit(state, state.pending);
      }, DELAY - waited);
    }
  }

  global.TKAnnounce = { say: say, DELAY: DELAY };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = { say: say, DELAY: DELAY };
  }
})(typeof window !== "undefined" ? window : globalThis);
