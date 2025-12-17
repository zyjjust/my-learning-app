# 部署到互联网 - 剩余步骤清单

## ✅ 已完成
- [x] GitHub 仓库已创建：https://github.com/zyjjust/my-learning-app
- [x] 代码已推送到 GitHub
- [x] `.gitignore` 已正确配置（保护敏感文件）

## 📋 剩余步骤

### 步骤 1：准备环境变量值

在部署前，请准备好以下环境变量的实际值：

#### 必需的环境变量：

1. **Supabase 配置**
   - `NEXT_PUBLIC_SUPABASE_URL` - 从 [Supabase Dashboard](https://app.supabase.com) 获取
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 从 Supabase Dashboard 获取

2. **通义千问 API 配置**
   - `DASHSCOPE_API_KEY` - 从 [DashScope 控制台](https://dashscope.console.aliyun.com/) 获取
   - `QWEN_MODEL` - 使用 `qwen-turbo`（默认值）

#### 如何获取这些值：

**Supabase 配置：**
1. 访问 https://app.supabase.com
2. 选择您的项目
3. 进入 **Settings** → **API**
4. 复制 **Project URL** 和 **anon/public key**

**DashScope API Key：**
1. 访问 https://dashscope.console.aliyun.com/
2. 登录您的阿里云账号
3. 进入 **API-KEY 管理**
4. 创建或复制您的 API Key

---

### 步骤 2：在 Vercel 上部署

#### 2.1 访问 Vercel 并登录

1. 打开 https://vercel.com
2. 点击右上角 **Sign Up** 或 **Log In**
3. 选择 **Continue with GitHub**（使用 GitHub 账号登录）

#### 2.2 导入项目

1. 登录后，点击 **Add New Project**（或 **New Project**）
2. 在 **Import Git Repository** 部分，找到 `zyjjust/my-learning-app`
3. 点击 **Import** 按钮

#### 2.3 配置项目设置

Vercel 会自动检测 Next.js 项目，保持默认设置即可：

- **Framework Preset**: Next.js ✅（自动检测）
- **Root Directory**: `./` ✅（默认）
- **Build Command**: `npm run build` ✅（默认）
- **Output Directory**: `.next` ✅（默认）
- **Install Command**: `npm install` ✅（默认）

#### 2.4 添加环境变量 ⚠️ 重要！

在部署前，必须添加环境变量：

1. 在 **Environment Variables** 部分，点击 **Add** 按钮
2. 逐个添加以下环境变量：

```
名称: NEXT_PUBLIC_SUPABASE_URL
值: [您的 Supabase URL]

名称: NEXT_PUBLIC_SUPABASE_ANON_KEY
值: [您的 Supabase Anon Key]

名称: DASHSCOPE_API_KEY
值: [您的 DashScope API Key]

名称: QWEN_MODEL
值: qwen-turbo
```

**注意：**
- 每个环境变量都要分别添加
- 确保值没有多余的空格
- 选择环境：**Production, Preview, Development**（全选）

#### 2.5 开始部署

1. 确认所有环境变量已添加
2. 点击页面底部的 **Deploy** 按钮
3. 等待构建完成（通常需要 2-5 分钟）

#### 2.6 查看部署结果

部署完成后：

1. 您会看到一个绿色的 **Success** 提示
2. 点击 **Visit** 按钮查看您的网站
3. 您的网站 URL 格式为：`https://my-learning-app-xxx.vercel.app`
4. 也可以使用自定义域名（在项目设置中配置）

---

### 步骤 3：验证部署

部署完成后，请测试以下功能：

#### 功能检查清单：

- [ ] 网站可以正常访问
- [ ] 登录/注册功能正常
- [ ] AI 任务生成功能正常
- [ ] AI 导师对话功能正常
- [ ] 任务完成和金币系统正常
- [ ] 奖励商店功能正常
- [ ] 商品兑换功能正常
- [ ] 头像上传功能正常
- [ ] 主题切换功能正常

#### 如果遇到问题：

1. **检查环境变量**
   - 进入 Vercel 项目 → **Settings** → **Environment Variables**
   - 确认所有变量都已正确添加

2. **查看构建日志**
   - 进入 Vercel 项目 → **Deployments**
   - 点击最新的部署
   - 查看 **Build Logs** 查找错误

3. **检查浏览器控制台**
   - 按 `F12` 打开开发者工具
   - 查看 **Console** 标签页的错误信息

---

### 步骤 4：配置自动部署（可选）

Vercel 默认已启用自动部署：

- ✅ 当您推送代码到 GitHub 的 `master` 分支时，会自动触发部署
- ✅ 每次部署都会生成一个新的预览 URL
- ✅ 生产环境使用主分支的最新代码

#### 如何更新网站：

1. 在本地修改代码
2. 提交更改：
   ```bash
   git add .
   git commit -m "更新描述"
   git push
   ```
3. Vercel 会自动检测并部署新版本

---

### 步骤 5：自定义域名（可选）

如果您有自己的域名：

1. 进入 Vercel 项目 → **Settings** → **Domains**
2. 输入您的域名（例如：`myapp.com`）
3. 按照提示配置 DNS 记录
4. 等待 DNS 生效（通常几分钟到几小时）

---

## 🎉 完成！

部署完成后，您的应用就可以在互联网上访问了！

### 有用的链接：

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub 仓库**: https://github.com/zyjjust/my-learning-app
- **Supabase Dashboard**: https://app.supabase.com
- **DashScope 控制台**: https://dashscope.console.aliyun.com/

### 需要帮助？

如果遇到问题，请检查：
1. 环境变量是否正确配置
2. Supabase 项目是否正常运行
3. DashScope API Key 是否有效
4. 查看 Vercel 的构建日志

---

**下一步：开始使用您的在线应用！** 🚀








