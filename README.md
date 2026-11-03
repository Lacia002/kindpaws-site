# KindPaws (KIND) 官网

纯静态单页：`index.html` + `styles.css` + `main.js`。无需构建。文案对齐白皮书 v0.1.1-draft。主网 Mint、Squads 多签与六桶金库地址已写入页面。

## 本地预览

```bash
python3 -m http.server 8080
```

浏览器打开：http://127.0.0.1:8080/

## 发布

- GitHub Pages：默认分支 `main` 的仓库根目录（已有 `.nojekyll`）。
- 自定义域名：根目录 `CNAME` 为 `kindpaws.site`。DNS 的 A/CNAME 由域名侧指向 GitHub Pages。
- Enforce HTTPS：在 GitHub Pages 证书签发后开启。若设置接口因证书未就绪被拒绝，先保留自定义域名，证书可用后再打开强制 HTTPS。

## 说明

- 中文为主；Hero 含英文副标题。
- 红线未改：Solana；众筹+贡献空投；默认流浪猫狗；KIND=参与/治理信号（非理财、无 APY/保本）；持有/购买 ≠ 捐赠收据 ≠ 税务抵扣；透明公示；反对「买入即暴富」。
- 代币比例未改：救助 35% / 众筹 25% / 空投 15% / 流动性 15% / 团队 7% / 生态 3%。团队桶为待锁 staging，本轮无 Streamflow。
- 空投领取入口暂时开放，供前端测试。原先的 `CLAIM_OPENS_AT`（2026-11-04T18:17:59+08:00）时间门禁已取消。现金科目 C_treasury / C_ops 地址、硬顶、窗口与发放公式仍待公布。不接入链上领取合约。

## 空投领取（临时测试）

时间门禁已取消。推特用户名、钱包地址和「领取空投」按钮直接可用，页面显示「已开放」，不再显示「24 小时后开放领取」。

点击领取后，页面把这两项整理成可读文本：写入本机 `localStorage`（键 `kindpaws.claimNotes`），显示可复制摘要，并下载 `kindpaws-claim.txt`。页面提示「已保存」。点击不调用链上合约，也不会发起交易。

## 首页众筹

首页英雄区有可操作的「参与众筹」表（`#crowdfund`），桌面端在标题右侧，手机上紧跟标题。

- 资产：USDC、USDT、SOL
- 预估：1 USDC 或 1 USDT = 1,000 KIND；1 SOL = 100,000 KIND
- 单人下限：1 USDT/USDC，或 0.01 SOL
- 硬顶：众筹桶 25%，即 2.5 亿 KIND
- 窗口：自本次上线起 30 天，截止 **2026-12-03 19:13:24（Asia/Shanghai）**，ISO `2026-12-03T19:13:24+08:00`。写在 `main.js` 的 `CROWDFUND_ENDS_AT`。
- 提交只把意向写入本机 `localStorage`（键 `kindpaws.crowdfundNotes`）并显示摘要。不发起链上支付。
