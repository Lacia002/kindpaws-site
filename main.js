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
  initCrowdfund();
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

/**
 * 首页众筹参与意向。
 * 窗口截止：2026-12-03 19:13:24（北京时间），自本次上线起 30 天。
 * ISO：2026-12-03T19:13:24+08:00
 * 1 USDC / 1 USDT = 1000 KIND，1 SOL = 100000 KIND。
 * 硬顶 2.5 亿 KIND。单人下限 1 USDT/USDC 或 0.01 SOL。
 * 只记录本机摘要，不发起链上支付。
 */
function initCrowdfund() {
  var CROWDFUND_ENDS_AT = "2026-12-03T19:13:24+08:00";
  var STORAGE_KEY = "kindpaws.crowdfundNotes";
  var RATES = { USDC: 1000, USDT: 1000, SOL: 100000 };
  var MINS = { USDC: "1", USDT: "1", SOL: "0.01" };
  var HARD_CAP = 250000000n;
  var form = document.getElementById("crowdfund");
  var amountInput = document.getElementById("crowdfund-amount");
  var walletInput = document.getElementById("crowdfund-wallet");
  var estimate = document.getElementById("crowdfund-estimate");
  var rules = document.getElementById("crowdfund-rules");
  var hint = document.getElementById("crowdfund-hint");
  var submit = document.getElementById("crowdfund-submit");
  var savedBox = document.getElementById("crowdfund-saved");
  var savedTitle = document.getElementById("crowdfund-saved-title");
  var summary = document.getElementById("crowdfund-summary");
  var copyButton = document.getElementById("crowdfund-copy");
  if (!form || !amountInput || !walletInput || !estimate || !rules || !hint || !submit) return;

  var endsAt = Date.parse(CROWDFUND_ENDS_AT);
  var latestText = "";

  function asset() {
    var checked = form.querySelector('input[name="crowdfund-asset"]:checked');
    return checked ? checked.value : "USDC";
  }

  function scaled(text) {
    var value = String(text || "").trim();
    if (!/^\d+(\.\d+)?$/.test(value)) return null;
    var parts = value.split(".");
    var frac = parts[1] || "";
    if (frac.length > 8) return null;
    var digits = (parts[0] + frac).replace(/^0+(?=\d)/, "");
    return { n: BigInt(digits || "0"), scale: frac.length, text: value };
  }

  function compare(amountText, minText) {
    var left = scaled(amountText);
    var right = scaled(minText);
    if (!left || !right) return null;
    var scale = Math.max(left.scale, right.scale);
    var a = left.n * (10n ** BigInt(scale - left.scale));
    var b = right.n * (10n ** BigInt(scale - right.scale));
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  function kindParts(amountText, rate) {
    var amount = scaled(amountText);
    if (!amount || amount.n === 0n) return null;
    var product = amount.n * BigInt(rate);
    var base = 10n ** BigInt(amount.scale);
    return { whole: product / base, frac: product % base, scale: amount.scale, product: product };
  }

  function formatKind(parts) {
    var whole = parts.whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (parts.frac === 0n) return whole;
    var frac = parts.frac.toString().padStart(parts.scale, "0").replace(/0+$/, "");
    return whole + "." + frac;
  }

  function formatWhen(date) {
    var bits = new Intl.DateTimeFormat("zh-CN", {
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
    bits.forEach(function (part) { map[part.type] = part.value; });
    return map.year + "-" + map.month + "-" + map.day + " " + map.hour + ":" + map.minute + ":" + map.second;
  }

  function windowOpen() {
    return Number.isFinite(endsAt) && Date.now() < endsAt;
  }

  function readNotes() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function quote(note) {
    return [
      "KindPaws 众筹参与意向",
      "资产：" + note.asset,
      "金额：" + note.amount,
      "预估 KIND：" + note.kind,
      "钱包地址：" + note.wallet,
      "记录时间：" + note.savedAt + "（北京时间）"
    ].join("\n");
  }

  function renderSaved(note, justSaved) {
    if (!savedBox || !savedTitle || !summary || !note) return;
    latestText = quote(note);
    savedBox.hidden = false;
    savedTitle.textContent = justSaved ? "已记录" : "本机已有参与意向";
    summary.textContent = latestText;
  }

  function refresh() {
    var name = asset();
    var open = windowOpen();
    amountInput.disabled = !open;
    walletInput.disabled = !open;
    submit.disabled = !open;
    form.querySelectorAll('input[name="crowdfund-asset"]').forEach(function (input) {
      input.disabled = !open;
    });
    amountInput.placeholder = name === "SOL" ? "至少 0.01" : "至少 1";
    var rateLabel = name === "SOL" ? "1 SOL = 100,000 KIND" : "1 " + name + " = 1,000 KIND";
    var minLabel = name === "SOL" ? "0.01 SOL" : "1 " + name;
    var endsLabel = formatWhen(new Date(endsAt));
    rules.textContent = rateLabel + "。单人下限 " + minLabel + "。硬顶 2.5 亿 KIND。窗口至 " + endsLabel + "（北京时间）。";
    if (!open) {
      estimate.textContent = "众筹窗口已结束";
      hint.textContent = "窗口已于 " + endsLabel + "（北京时间）结束。表单已关闭，没有发起链上支付。";
      return;
    }
    var parts = kindParts(amountInput.value, RATES[name]);
    if (!parts) {
      estimate.textContent = "预估 0 KIND";
      return;
    }
    var capScaled = HARD_CAP * (10n ** BigInt(parts.scale));
    var belowMin = compare(amountInput.value.trim(), MINS[name]) < 0;
    var overCap = parts.product > capScaled;
    estimate.textContent = "预估 " + formatKind(parts) + " KIND";
    if (belowMin) estimate.textContent += "（低于单人下限）";
    if (overCap) estimate.textContent += "（超过硬顶）";
  }

  function saveIntent(event) {
    if (event) event.preventDefault();
    if (!windowOpen()) {
      refresh();
      return;
    }
    var name = asset();
    var amountText = amountInput.value.trim();
    var address = walletInput.value.trim();
    var parts = kindParts(amountText, RATES[name]);
    var belowMin = !parts || compare(amountText, MINS[name]) < 0;
    var overCap = parts && parts.product > HARD_CAP * (10n ** BigInt(parts.scale));
    if (!parts || belowMin || overCap || !address || /\s/.test(address) || address.length > 128) {
      hint.textContent = "请填写达到下限的金额和钱包地址。地址不要含空格，也勿填写助记词。单笔预估不能超过硬顶 2.5 亿 KIND。这次没有记录，也没有发起链上支付。";
      return;
    }
    var note = {
      asset: name,
      amount: amountText,
      kind: formatKind(parts),
      wallet: address,
      savedAt: formatWhen(new Date())
    };
    var notes = readNotes();
    notes.push(note);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.slice(-50)));
    } catch (error) {
      notes = [note];
    }
    renderSaved(note, true);
    hint.textContent = "已记录。摘要在下方。这是参与意向，没有发起链上支付。";
  }

  form.addEventListener("submit", saveIntent);
  amountInput.addEventListener("input", refresh);
  form.querySelectorAll('input[name="crowdfund-asset"]').forEach(function (input) {
    input.addEventListener("change", refresh);
  });
  if (copyButton) {
    copyButton.addEventListener("click", function () {
      if (!latestText) return;
      var done = function () {
        if (savedTitle) savedTitle.textContent = "已记录";
        hint.textContent = "已记录。摘要已复制。没有发起链上支付。";
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(latestText).then(done).catch(function () {
          hint.textContent = "已记录。请在摘要文本上长按或选中后复制。";
        });
        return;
      }
      hint.textContent = "已记录。请在摘要文本上长按或选中后复制。";
    });
  }

  var existing = readNotes();
  if (existing.length) renderSaved(existing[existing.length - 1], false);
  refresh();
}
