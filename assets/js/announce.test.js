// Tests for the shared live-region announcer.
// Run with: node assets/js/announce.test.js
// No framework/deps — Node's built-in test runner plus assert.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { say, DELAY } = require("./announce.js");

function fakeNode() {
  return { textContent: "", writes: 0 };
}

// textContent is a plain property on the fake node, so count the writes by
// wrapping it: a live region announces on every assignment, and the whole
// point of the helper is that it assigns as rarely as it can.
function counted() {
  const node = { _text: "", writes: 0 };
  Object.defineProperty(node, "textContent", {
    get() { return this._text; },
    set(v) { this._text = v; this.writes += 1; },
  });
  return node;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

test("the first change is written at once", () => {
  const node = counted();
  say(node, "3 matches");
  assert.equal(node.textContent, "3 matches");
  assert.equal(node.writes, 1);
});

test("identical text is never written twice", async () => {
  const node = counted();
  say(node, "7 words");
  await wait(DELAY + 60);
  say(node, "7 words");
  await wait(DELAY + 60);
  assert.equal(node.writes, 1);
});

test("a burst inside the window collapses to one write", async () => {
  const node = counted();
  say(node, "1");            // leading edge, written at once
  say(node, "2");
  say(node, "3");
  say(node, "4 words");
  assert.equal(node.writes, 1, "the burst must not write four times");
  await wait(DELAY + 80);
  assert.equal(node.textContent, "4 words", "the last value wins");
  assert.equal(node.writes, 2, "one leading write plus one trailing write");
});

test("a change after a quiet period is written at once again", async () => {
  const node = counted();
  say(node, "a");
  await wait(DELAY + 80);
  say(node, "b");
  assert.equal(node.textContent, "b");
  assert.equal(node.writes, 2);
});

test("two nodes keep separate state", async () => {
  const one = counted();
  const two = counted();
  say(one, "left");
  say(two, "right");
  assert.equal(one.textContent, "left");
  assert.equal(two.textContent, "right");
});

test("a missing node is ignored rather than thrown on", () => {
  assert.doesNotThrow(() => say(null, "x"));
  assert.doesNotThrow(() => say(undefined, "x"));
});

test("null and undefined text become an empty string", () => {
  const node = fakeNode();
  say(node, null);
  assert.equal(node.textContent, "");
});
