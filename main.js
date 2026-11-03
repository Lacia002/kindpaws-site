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
 * 空投领取开放开关。
 * CLAIM_OPENS_AT 是写死的绝对时间，时区 Asia/Shanghai（UTC+8，无夏令时）。
 * 取值 = 本次提交时刻 + 24 小时，用来近似「合并进 main 并部署生效」后再过 24 小时。
 * 开放：2026-11-04 18:17:59（北京时间）
 * ISO：2026-11-04T18:17:59+08:00
 * 页面加载、每秒刷新、从后台回到页面时，都用当前时间与该时刻比较。
 * 不使用「打开页面后再等 24 小时」的单次 setTimeout。
 */
function initClaimGate() {
  var CLAIM_OPENS_AT = "2026-11-04T18:17:59+08:00";
  var countdown = document.getElementById("claim-countdown");
  var lead = document.getElementById("countdown-lead");
  var grid = document.getElementById("countdown-grid");
  var meta = document.getElementById("countdown-meta");
  var live = document.getElementById("countdown-live");
  var hoursEl = document.getElementById("cd-hours");
  var minutesEl = document.getElementById("cd-minutes");
  var secondsEl = document.getElementById("cd-seconds");
  var form = document.getElementById("airdrop-form");
  var wallet = document.getElementById("wallet");
  var claimButton = document.getElementById("claim-button");
  var claimHint = document.getElementById("claim-hint");

  if (!countdown || !lead || !grid || !meta || !wallet || !claimButton || !claimHint) {
    return;
  }

  var opensAtMs = Date.parse(CLAIM_OPENS_AT);
  if (!isFinite(opensAtMs)) {
    return;
  }

  var opensAtLabel = formatShanghai(new Date(opensAtMs));
  var wasOpen = null;
  var lastLiveKey = "";

  function pad(n) {
    return (n < 10 ? "0" : "") + n;
  }

  function splitRemaining(ms) {
    var total = Math.floor(Math.max(0, ms) / 1000);
    return {
      hours: Math.floor(total / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60
    };
  }

  function applyOpenState(isOpen) {
    countdown.setAttribute("data-state", isOpen ? "open" : "closed");
    countdown.classList.toggle("is-open", isOpen);
    wallet.disabled = !isOpen;
    claimButton.disabled = !isOpen;

    if (isOpen) {
      lead.textContent = "已开放";
      grid.hidden = true;
      meta.textContent = "已于 " + opensAtLabel + "（北京时间）开放领取。";
      wallet.placeholder = "填写 Solana 地址…";
      claimButton.textContent = "领取空投";
      claimHint.textContent =
        "状态：已开放。可以填写 Solana 地址并点击领取。本页只打开前端入口，点击不会发起链上交易。请勿填写助记词或私钥。";
      return;
    }

    lead.textContent = "24 小时后开放领取";
    grid.hidden = false;
    wallet.placeholder = "开放后填写 Solana 地址…";
    claimButton.textContent = "领取空投（未开放）";
    meta.textContent =
      "开放时刻：" +
      opensAtLabel +
      "（北京时间），固定不顺延。倒计时结束前领取入口关闭。";
    claimHint.textContent =
      "状态：未开放。倒计时结束前无法领取；到点后本页会自动打开输入框和按钮。刷新后仍按同一开放时刻判断。本页不接入链上领取合约。空投数量不代表未来价格。";
  }

  function renderClaimGate() {
    var remaining = opensAtMs - Date.now();
    var isOpen = remaining <= 0;

    if (isOpen !== wasOpen) {
      applyOpenState(isOpen);
      wasOpen = isOpen;
    }

    if (isOpen) {
      if (live && lastLiveKey !== "open") {
        live.textContent = "领取已开放。";
        lastLiveKey = "open";
      }
      return;
    }

    var parts = splitRemaining(remaining);
    if (hoursEl) hoursEl.textContent = pad(parts.hours);
    if (minutesEl) minutesEl.textContent = pad(parts.minutes);
    if (secondsEl) secondsEl.textContent = pad(parts.seconds);

    var liveKey = parts.hours + ":" + parts.minutes;
    if (live && liveKey !== lastLiveKey) {
      live.textContent =
        "距领取开放还有 " + parts.hours + " 小时 " + parts.minutes + " 分。";
      lastLiveKey = liveKey;
    }
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  claimButton.addEventListener("click", function () {
    if (claimButton.disabled || Date.now() < opensAtMs) return;
    claimHint.textContent =
      "领取入口已开放。这次点击没有发起链上交易或转账。请勿填写助记词，也不要向陌生地址转账。";
  });

  renderClaimGate();
  setInterval(renderClaimGate, 1000);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) renderClaimGate();
  });
  window.addEventListener("pageshow", renderClaimGate);
}

function formatShanghai(date) {
  var parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  var map = {};
  parts.forEach(function (part) {
    map[part.type] = part.value;
  });
  return (
    map.year +
    "-" +
    map.month +
    "-" +
    map.day +
    " " +
    map.hour +
    ":" +
    map.minute +
    ":" +
    map.second
  );
}
