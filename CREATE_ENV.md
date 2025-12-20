# 如何创建 .env.local 文件

## 方法 1：手动创建（最简单）

1. 在项目根目录（`my-learning-app`）下，创建一个新文件
2. 文件名为：`.env.local`（注意前面有点）
3. 复制以下内容到文件中：

```env
# Supabase 配置
# 从 Supabase Dashboard 获取这些值：https://app.supabase.com/project/_/settings/api

# Supabase 项目 URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase 匿名密钥 (Anon/Public Key)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI API 配置（可选）
# 用于 AI 任务生成和 AI 导师功能

# AI API URL (支持 OpenAI 兼容的 API)
AI_API_URL=https://api.openai.com/v1/chat/completions

# AI API Key
AI_API_KEY=your-api-key-here

# AI Model (可选，默认为 gpt-3.5-turbo)
AI_MODEL=gpt-3.5-turbo
```

## 方法 2：使用命令行

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env.local
```

**Mac/Linux:**
```bash
cp env.example .env.local
```

## 为什么看不到文件？

`.env.local` 文件在 `.gitignore` 中，所以：
- ✅ 文件确实存在（已创建）
- ⚠️ 某些 IDE 可能默认隐藏以点开头的文件
- ⚠️ 文件资源管理器可能默认隐藏隐藏文件

## 如何显示隐藏文件

### VS Code
- 文件资源管理器 → 点击右上角三个点 → 勾选 "Show Hidden Files"

### Windows 文件资源管理器
- 查看 → 选项 → 查看 → 勾选 "显示隐藏的文件、文件夹和驱动器"

### 验证文件是否存在
在项目根目录运行：
```powershell
Test-Path .env.local
```
如果返回 `True`，说明文件存在。

## 下一步

1. 打开 `.env.local` 文件
2. 替换 `your-project-id` 和 `your-anon-key-here` 为你的实际 Supabase 配置
3. 如果需要 AI 功能，配置 AI API 密钥
4. 保存文件
5. 重启开发服务器：`npm run dev`















