# Hello8693 的博客

基于 Hexo + Fluid 主题，自动化部署到腾讯云 COS。

## 本地开发

```bash
pnpm install
pnpm server
```

## 部署到 COS

配置以下环境变量（或在 GitHub Actions 中设置 Secrets）：

- `COS_SECRET_ID`
- `COS_SECRET_KEY`
（`bucket` 与 `region` 已在 `/_config.yml` 中配置）

注意：`hexo-deployer-cos` 环境变量优先级低于 `/_config.yml`，因此不要在配置里写 `secretId/secretKey`，否则会被当作字面量字符串。

本仓库已内置 GitHub Actions 工作流，推送到 `main` 会自动部署。

## 必应每日背景图

- `scripts/fetch-bing-hero.mjs` 会调用 Bing 图片接口拉取当日壁纸。
- 前端也会尝试在运行时从 Bing 接口更新背景（`source/js/bing-hero.js`）。
