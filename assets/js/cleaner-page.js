/* Shared renderer for the generated "remove X from text" pages.
 *
 * Every page written by tools/build_cleaner_pages.py carries the same markup
 * with one attribute changed — `data-cleaner` on <main> names which entry of
 * the registry in app.js the page is about — so all seven run this file and
 * none of them ships a transform of its own.
 *
 * The option controls are read generically: anything inside #cl-primary with a
 * `data-opt` attribute becomes an option on the page's own cleaner, and any
 * checkbox with `data-also` switches on a second cleaner from the registry.
 * That is what lets tools/cleaner_pages.py add an option without a change
 * here, and it is why the "also clean up" stack produces exactly the same
 * result as ticking the same boxes on /text-cleaner.
 *
 * Loaded after app.js, which is where the registry and cleanText() live.
 */
(function () {
  "use strict";

  var api = window.TextKitClean;
  if (!api) return;

  var main = document.querySelector("main[data-cleaner]");
  if (!main) return;

  var id = main.getAttribute("data-cleaner");
  if (!api.CLEANERS[id]) return;

  var input = document.getElementById("cl-input");
  var output = document.getElementById("cl-output");
  if (!input || !output) return;

  var primary = document.getElementById("cl-primary");
  var also = document.getElementById("cl-also");
  var summary = document.getElementById("cl-summary");

  function extras(selection) {
    if (!also) return [];
    var picked = [];
    Array.prototype.forEach.call(also.querySelectorAll("[data-also]"), function (box) {
      if (!box.checked) return;
      selection[box.getAttribute("data-also")] = {};
      picked.push(api.CLEANERS[box.getAttribute("data-also")].label.toLowerCase());
    });
    return picked;
  }

  function render() {
    var selection = {};
    selection[id] = {};
    var picked = extras(selection);
    if (primary) api.readOptions(primary, selection, id);

    var result = api.cleanText(input.value, selection);
    output.value = result.text;
    api.renderStats("cl", result.stats);

    if (summary) {
      summary.textContent = picked.length
        ? "Also removing " + (picked.length === 1
            ? picked[0]
            : picked.slice(0, -1).join(", ") + " and " + picked[picked.length - 1]) + "."
        : "";
    }
  }

  input.addEventListener("input", api.debounce(render, 100));
  if (primary) primary.addEventListener("change", render);
  if (also) also.addEventListener("change", render);
  api.wireCopy("cl-copy", "cl-copy-flash", function () { return output.value; });
  api.wireDownload("cl-download", api.pageSlug("text-cleaner") + ".txt", function () { return output.value; });
  render();
})();
