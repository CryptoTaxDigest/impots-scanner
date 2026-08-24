/**
 * impots-scanner embed loader v1
 *
 * <div id="scanner"></div>
 * <script src="/embed/v1.js" data-target="#scanner"></script>
 */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var targetSel = script.getAttribute("data-target") || "#impots-scanner";
  var height = script.getAttribute("data-height") || "820";
  var base = script.getAttribute("data-base") || "";

  if (!base) {
    try {
      base = new URL(script.src).origin + new URL(script.src).pathname.replace(/\/embed\/v1\.js$/, "/");
    } catch (e) {
      base = "/";
    }
  }

  var target = document.querySelector(targetSel);
  if (!target) return;

  var iframe = document.createElement("iframe");
  iframe.src = base.replace(/\/?$/, "/") + "?embed=1";
  iframe.title = "Ce que l'État sait sur vous — scan comptes étrangers (3916-BIS)";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.style.cssText =
    "width:100%;max-width:720px;height:" + height + "px;border:0;border-radius:12px;display:block;background:#0b0f14;";

  target.appendChild(iframe);
})();
