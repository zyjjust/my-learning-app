# 网站部署指南

## 概述

本指南将帮助你将学习英雄应用部署到互联网。推荐使用 Vercel（Next.js 官方推荐平台）进行部署。

## 部署前准备

### 1. 检查项目文件

确保以下文件存在且配置正确：
- ✅ `.env.local` - 包含所有必要的环境变量
- ✅ `package.json` - 包含所有依赖
- ✅ `next.config.js` 或 `next.config.mjs` - Next.js 配置

### 2. 准备环境变量

在部署前，确保准备好以下环境变量：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_anon_key

# 通义千问 API 配置
DASHSCOPE_API_KEY=你的_dashscope_api_key
QWEN_MODEL=qwen-turbo
```

## 方法一：使用 Vercel 部署（推荐）

### 为什么选择 Vercel？

- ✅ Next.js 官方推荐平台
- ✅ 自动 HTTPS 和 CDN
- ✅ 自动部署（连接 GitHub）
- ✅ 免费套餐足够使用
- ✅ 内置环境变量管理
- ✅ 自动优化和缓存

### 部署步骤

#### 步骤 1：准备代码仓库

1. **创建 GitHub 仓库**（如果还没有）
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

2. **确保 `.gitignore` 包含敏感文件**
   ```
   .env.local
   .env*.local
   node_modules
   .next
   ```

#### 步骤 2：在 Vercel 上部署

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 GitHub 仓库
   - 点击 "Import"

3. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）

4. **添加环境变量**
   在 "Environment Variables" 部分添加：
   ```
   NEXT_PUBLIC_SUPABASE_URL = 你的值
   NEXT_PUBLIC_SUPABASE_ANON_KEY = 你的值
   DASHSCOPE_API_KEY = 你的值
   QWEN_MODEL = qwen-turbo
   ```

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成（通常 2-5 分钟）

6. **获取部署 URL**
   - 部署完成后，你会得到一个 URL，例如：`https://your-app.vercel.app`
   - 可以自定义域名（在项目设置中）

### Vercel 部署后的操作

1. **验证部署**
   - 访问部署的 URL
   - 检查所有功能是否正常

2. **设置自定义域名**（可选）
   - 在项目设置 → Domains
   - 添加你的域名
   - 按照提示配置 DNS

## 方法二：使用 Netlify 部署

### 部署步骤

1. **访问 Netlify**
   - 打开 https://www.netlify.com
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add new site" → "Import an existing project"
   - 选择你的 GitHub 仓库

3. **配置构建设置**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

4. **添加环境变量**
   - 在 Site settings → Environment variables
   - 添加所有必要的环境变量

5. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

## 方法三：使用 Railway 部署

### 部署步骤

1. **访问 Railway**
   - 打开 https://railway.app
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置环境变量**
   - 在项目设置中添加环境变量

4. **部署**
   - Railway 会自动检测 Next.js 并部署

## 方法四：使用 Docker 部署到云服务器

### 前提条件

- 云服务器（阿里云、腾讯云、AWS 等）
- Docker 和 Docker Compose 已安装

### 部署步骤

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS base
   
   # Install dependencies only when needed
   FROM base AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   
   COPY package.json package-lock.json* ./
   RUN npm ci
   
   # Rebuild the source code only when needed
   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN npm run build
   
   # Production image, copy all the files and run next
   FROM base AS runner
   WORKDIR /app
   
   ENV NODE_ENV production
   ENV NEXT_TELEMETRY_DISABLED 1
   
   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs
   
   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
   
   USER nextjs
   
   EXPOSE 3000
   
   ENV PORT 3000
   
   CMD ["node", "server.js"]
   ```

2. **更新 next.config.js**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'standalone',
   }
   
   module.exports = nextConfig
   ```

3. **创建 docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
         - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
         - DASHSCOPE_API_KEY=${DASHSCOPE_API_KEY}
         - QWEN_MODEL=${QWEN_MODEL}
       restart: unless-stopped
   ```

4. **部署**
   ```bash
   docker-compose up -d
   ```

## 部署后检查清单

### ✅ 功能检查

- [ ] 登录/注册功能正常
- [ ] 任务生成功能正常（AI 任务）
- [ ] AI 导师对话功能正常
- [ ] 任务完成和金币系统正常
- [ ] 奖励商店功能正常
- [ ] 商品兑换功能正常
- [ ] 头像上传功能正常
- [ ] 主题切换功能正常

### ✅ 性能检查

- [ ] 页面加载速度正常
- [ ] 图片加载正常
- [ ] API 响应速度正常

### ✅ 安全检查

- [ ] 环境变量已正确配置
- [ ] API Key 未暴露在前端代码中
- [ ] HTTPS 已启用
- [ ] Supabase RLS 策略已正确配置

## 常见问题

### Q1: 部署后环境变量不生效？

**A:** 确保：
- 环境变量名称正确（区分大小写）
- 在部署平台正确添加了环境变量
- 重新部署应用（修改环境变量后需要重新部署）

### Q2: API 调用失败？

**A:** 检查：
- API Key 是否正确
- 网络连接是否正常
- API 服务是否可用
- 查看浏览器控制台和服务器日志

### Q3: 数据库连接失败？

**A:** 检查：
- Supabase URL 和 Key 是否正确
- Supabase 项目是否正常运行
- RLS 策略是否允许访问
- 网络防火墙设置

### Q4: 图片无法加载？

**A:** 检查：
- 图片 URL 是否可公开访问
- 是否使用了 HTTPS
- CORS 设置是否正确

### Q5: 如何更新部署？

**Vercel/Netlify:**
- 推送到 GitHub 主分支会自动触发部署
- 或在平台手动触发重新部署

**Railway:**
- 推送到 GitHub 会自动部署
- 或在 Railway 控制台点击 "Redeploy"

**Docker:**
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 推荐配置

### 生产环境优化

1. **启用压缩**
   - Vercel/Netlify 自动启用
   - 手动部署需要配置 Nginx

2. **CDN 配置**
   - Vercel/Netlify 自动提供 CDN
   - 手动部署建议使用 Cloudflare

3. **监控和日志**
   - Vercel: 内置 Analytics
   - 建议集成 Sentry 进行错误监控

4. **备份**
   - 定期备份 Supabase 数据库
   - 使用 Git 版本控制代码

## 成本估算

### 免费方案

- **Vercel**: 免费（个人项目）
- **Netlify**: 免费（100GB 带宽/月）
- **Railway**: $5/月（有免费额度）
- **Supabase**: 免费（500MB 数据库）
- **通义千问**: 按量付费（有免费额度）

### 付费方案（如需）

- **Vercel Pro**: $20/月
- **Netlify Pro**: $19/月
- **Supabase Pro**: $25/月
- **自定义域名**: $10-15/年

## 下一步

部署完成后：

1. **测试所有功能**
2. **配置自定义域名**（可选）
3. **设置监控和日志**
4. **定期备份数据**
5. **优化性能**

## 获取帮助

如果遇到问题：

1. 查看平台文档
2. 检查浏览器控制台错误
3. 查看服务器日志
4. 在 GitHub Issues 提问

---

**推荐部署平台：Vercel** - 最简单、最快速、最适合 Next.js 应用！










































