# 环境变量配置指南

## 创建环境变量文件

### 方法 1：手动创建（推荐）

1. 在项目根目录创建 `.env.local` 文件
2. 复制以下内容到文件中：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# AI API 配置（可选）
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_API_KEY=your-api-key-here
AI_MODEL=gpt-3.5-turbo
```

### 方法 2：使用命令行

**Windows (PowerShell):**
```powershell
Copy-Item env.example .env.local
```

**Mac/Linux:**
```bash
cp env.example .env.local
```

## 获取配置值

### Supabase 配置

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Settings** > **API**
4. 复制以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### AI API 配置（可选）

如果你要使用 AI 功能：

1. **OpenAI**:
   - 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
   - 创建新的 API Key
   - 复制到 `AI_API_KEY`

2. **其他兼容 API**:
   - 根据你的 API 服务提供商获取 URL 和 Key
   - 更新 `AI_API_URL` 和 `AI_API_KEY`

## 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ 是 | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ 是 | Supabase 匿名密钥 |
| `AI_API_URL` | ❌ 否 | AI API 服务地址 |
| `AI_API_KEY` | ❌ 否 | AI API 密钥 |
| `AI_MODEL` | ❌ 否 | AI 模型名称（默认：gpt-3.5-turbo） |

## 验证配置

配置完成后，重启开发服务器：

```bash
npm run dev
```

检查控制台是否有错误信息。如果看到 Supabase 连接警告，说明环境变量未正确配置。

## 注意事项

- `.env.local` 文件已添加到 `.gitignore`，不会被提交到 Git
- 不要将真实的 API 密钥提交到代码仓库
- 生产环境需要在部署平台（如 Vercel）配置环境变量
- 环境变量修改后需要重启开发服务器才能生效

## 故障排除

### 问题：无法连接 Supabase
- ✅ 检查 `.env.local` 文件是否存在
- ✅ 确认环境变量名称正确（注意大小写）
- ✅ 验证 Supabase URL 和 Key 是否正确
- ✅ 重启开发服务器

### 问题：AI 功能不工作
- ✅ 检查 `AI_API_KEY` 是否已配置
- ✅ 确认 API Key 有效且有足够额度
- ✅ 查看浏览器控制台的错误信息















































