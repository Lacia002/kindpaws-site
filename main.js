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
  initAddressCopy();
})();

/**
 * 空投领取开关。
 * 临时测试：已取消 CLAIM_OPENS_AT（2026-11-04T18:17:59+08:00）时间门禁。
 * 领取时把推特用户名和钱包地址保存到本机，并下载文本。点击不发起链上交易。
 */
function initClaimGate() {
  var STORAGE_KEY = "kindpaws.claimNotes";
  var countdown = document.getElementById("claim-countdown");
  var lead = document.getElementById("countdown-lead");
  var grid = document.getElementById("countdown-grid");
  var meta = document.getElementById("countdown-meta");
  var live = document.getElementById("countdown-live");
  var form = document.getElementById("airdrop-form");
  var twitter = document.getElementById("twitter");
  var wallet = document.getElementById("wallet");
  var claimButton = document.getElementById("claim-button");
  var claimHint = document.getElementById("claim-hint");
  var savedBox = document.getElementById("claim-saved");
  var savedTitle = document.getElementById("claim-saved-title");
  var summary = document.getElementById("claim-summary");
  var savedList = document.getElementById("claim-saved-list");
  var copyButton = document.getElementById("claim-copy");

  if (!countdown || !lead || !grid || !meta || !twitter || !wallet || !claimButton || !claimHint) {
    return;
  }

  countdown.setAttribute("data-state", "open");
  countdown.classList.add("is-open");
  grid.hidden = true;
  lead.textContent = "已开放";
  meta.textContent = "领取入口已开放，可供测试。";
  twitter.disabled = false;
  wallet.disabled = false;
  wallet.placeholder = "填写 Solana 地址…";
  claimButton.disabled = false;
  claimButton.textContent = "领取空投";
  if (live) live.textContent = "领取已开放。";

  var latestText = "";

  function normalizeTwitter(value) {
    var text = String(value || "").trim();
    if (text.charAt(0) === "@") text = text.slice(1).trim();
    if (!text || /\s/.test(text) || text.length > 30) return "";
    return "@" + text;
  }

  function normalizeWallet(value) {
    var text = String(value || "").trim();
    if (!text || /\s/.test(text) || text.length > 128) return "";
    return text;
  }

  function formatWhen(date) {
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
    return map.year + "-" + map.month + "-" + map.day + " " + map.hour + ":" + map.minute + ":" + map.second;
  }

  function formatNote(note) {
    return [
      "KindPaws 空投领取测试记录",
      "推特用户名：" + note.twitter,
      "钱包地址：" + note.wallet,
      "保存时间：" + note.savedAt + "（北京时间）"
    ].join("\n");
  }

  function readNotes() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(function (note) {
        return note && note.twitter && note.wallet && note.savedAt;
      });
    } catch (error) {
      return [];
    }
  }

  function writeNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(-50)));
  }

  function renderNotes(notes, justSaved) {
    if (!savedBox || !savedTitle || !summary || !savedList) return;
    if (!notes.length) {
      savedBox.hidden = true;
      latestText = "";
      return;
    }
    var latest = notes[notes.length - 1];
    latestText = formatNote(latest);
    savedBox.hidden = false;
    savedTitle.textContent = justSaved ? "已保存" : "本机已保存 " + notes.length + " 条";
    summary.textContent = latestText;
    savedList.replaceChildren();
    notes.slice(-8).reverse().forEach(function (note) {
      var item = document.createElement("li");
      item.textContent = note.twitter + "  ·  " + note.wallet;
      savedList.appendChild(item);
    });
  }

  function downloadText(filename, text) {
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function saveClaim(event) {
    if (event) event.preventDefault();
    var handle = normalizeTwitter(twitter.value);
    var address = normalizeWallet(wallet.value);
    if (!handle || !address) {
      claimHint.textContent = "请填写推特用户名和钱包地址。用户名不要带空格，地址请勿填写助记词或私钥。这次没有保存，也没有发起链上交易。";
      return;
    }
    var note = {
      twitter: handle,
      wallet: address,
      savedAt: formatWhen(new Date())
    };
    var notes = readNotes();
    notes.push(note);
    var stored = false;
    try {
      writeNotes(notes);
      stored = true;
    } catch (error) {
      stored = false;
    }
    var text = formatNote(note);
    downloadText("kindpaws-claim.txt", text);
    renderNotes(stored ? readNotes() : notes, true);
    claimHint.textContent = "已保存。摘要在下方，文本文件已下载到本机。这次点击没有发起链上交易。";
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
    }
  }

  if (form) form.addEventListener("submit", saveClaim);

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      if (!latestText) return;
      var done = function () {
        if (savedTitle) savedTitle.textContent = "已保存";
        claimHint.textContent = "已保存。摘要已复制。这次没有发起链上交易。";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(latestText).then(done).catch(function () {
          claimHint.textContent = "已保存。请在摘要文本上长按或选中后复制。";
        });
        return;
      }
      claimHint.textContent = "已保存。请在摘要文本上长按或选中后复制。";
    });
  }

  renderNotes(readNotes(), false);
}

function initAddressCopy() {
  var root = document.getElementById("crowdfund");
  var live = document.getElementById("crowdfund-copy-live");
  if (!root) return;
  root.querySelectorAll("[data-copy]").forEach(function (button) {
    var label = button.textContent;
    button.addEventListener("click", function () {
      var text = button.getAttribute("data-copy");
      var name = button.getAttribute("data-copy-name") || "地址";
      copyText(text).then(function () {
        button.textContent = "已复制";
        if (live) live.textContent = name + "已复制。";
        setTimeout(function () {
          button.textContent = label;
        }, 1600);
      }).catch(function () {
        if (live) live.textContent = "复制没有完成，请选中地址后手动复制。";
      });
    });
  });
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise(function (resolve, reject) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    area.remove();
    if (ok) resolve();
    else reject(new Error("copy failed"));
  });
}
