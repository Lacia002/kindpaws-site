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
- 代币比例未改：救助 35% / 众筹 25% / 空投 15% / 流动性 15% / 团队 7% / 回购 3%。救助为锁定后按热度解锁；空投为社区建设回报；回购为定期回购销毁。团队桶为待锁 staging，本轮无 Streamflow。
- 空投领取登记暂时开放，记录只在本机。原先的 `CLAIM_OPENS_AT`（2026-11-04T18:17:59+08:00）时间门禁已取消。不接入链上领取合约。

## 空投领取登记

时间门禁已取消。推特用户名、钱包地址和「提交登记」按钮直接可用，页面显示「登记已开放」。这是本地登记，不是链上领取。

点击领取后，页面把这两项整理成可读文本：写入本机 `localStorage`（键 `kindpaws.claimNotes`），显示可复制摘要，并下载 `kindpaws-claim.txt`。页面提示「已保存」。点击不调用链上合约，也不会发起交易。

## 首页众筹收款

首页 `#crowdfund` 只公示主网现金收款地址。

- SOL 直收（Vault PDA）：`Ct5znNfdHzZipsEAmAiKckMHRtGh2xPupoPeASrP6Nxt`
- USDC ATA：`77fJqwSXL2ZK2bcDznaqYbiDwW89U8nwWTaLZMssV9Wh`（mint `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`）
- USDT ATA：`G5G3AG7yj9yyTbVuzcQqfaMGtfA1VR9fj8BHksS8wP1S`（mint `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`）
- 规则：1 USDC 或 1 USDT = 1,000 KIND，1 SOL = 100,000 KIND；窗口至 2026-12-03 19:13:24（北京时间）；硬顶 2.5 亿 KIND；现金 60/40。
