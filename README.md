# Snapdrop on Cloudflare Workers

本项目是 [Snapdrop](https://github.com/laukeng/snapdrop) 的 Cloudflare Workers 移植版，使用 **Durable Objects** 管理 WebSocket 信令，并通过 `assets` 绑定托管静态文件，实现全栈无服务器部署。

## ✨ 特性 

- 🚀 完全运行在 Cloudflare 边缘网络
- 🔒 自动提供 HTTPS
- 💬 WebSocket 信令由 Durable Objects 管理，支持多房间
- 📦 静态资源由 Cloudflare CDN 加速

## 🚀 一键部署（推荐）

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/你的用户名/你的仓库名)

点击上方按钮，授权 Cloudflare 访问你的 GitHub 仓库，即可自动完成部署。

## 🔧 手动部署

1. **克隆本项目**
   ```bash
   git clone https://github.com/你的用户名/你的仓库名.git
   cd 你的仓库名
