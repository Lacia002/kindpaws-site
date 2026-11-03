(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  initClaimGate();
})();

/**
 * 空投领取开关。
 * 临时测试：已取消 CLAIM_OPENS_AT（2026-11-04T18:17:59+08:00）时间门禁。
 * 钱包输入和领取按钮保持可用。点击仍不发起链上交易。
 */
function initClaimGate() {
  var countdown = document.getElementById("claim-countdown");
  var lead = document.getElementById("countdown-lead");
  var grid = document.getElementById("countdown-grid");
  var meta = document.getElementById("countdown-meta");
  var live = document.getElementById("countdown-live");
  var form = document.getElementById("airdrop-form");
  var wallet = document.getElementById("wallet");
  var claimButton = document.getElementById("claim-button");
  var claimHint = document.getElementById("claim-hint");

  if (!countdown || !lead || !grid || !meta || !wallet || !claimButton || !claimHint) {
    return;
  }

  countdown.setAttribute("data-state", "open");
  countdown.classList.add("is-open");
  grid.hidden = true;
  lead.textContent = "已开放";
  meta.textContent = "领取入口已开放，可供测试。";
  wallet.disabled = false;
  wallet.placeholder = "填写 Solana 地址…";
  claimButton.disabled = false;
  claimButton.textContent = "领取空投";
  claimHint.textContent =
    "状态：已开放。可以填写 Solana 地址并点击领取。本页只打开前端入口，点击不会发起链上交易。请勿填写助记词或私钥。";
  if (live) live.textContent = "领取已开放。";

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  claimButton.addEventListener("click", function () {
    claimHint.textContent =
      "领取入口已开放。这次点击没有发起链上交易或转账。请勿填写助记词，也不要向陌生地址转账。";
  });
}
