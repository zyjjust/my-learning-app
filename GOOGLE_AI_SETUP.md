# Google AI Studio 配置指南

## 快速设置

### 1. 获取 API Key

1. 访问 https://aistudio.google.com/app/apikey
2. 使用 Google 账号登录
3. 点击 "Create API Key" 创建新的 API Key
4. 复制生成的 API Key

### 2. 配置环境变量

在项目根目录的 `.env.local` 文件中添加：

```env
# Google AI Studio 配置
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_API_KEY=你的API密钥
```

**注意：**
- 如果没有 `.env.local` 文件，请创建它
- 不要将 `.env.local` 提交到 Git（已在 .gitignore 中）
- API Key 不要包含引号或空格

### 3. 重启开发服务器

配置完成后，重启开发服务器：

```bash
npm run dev
```

## 模型选择

### 推荐模型

- **gemini-1.5-flash**（推荐）
  - 快速响应
  - 适合大多数场景
  - 免费配额充足

- **gemini-1.5-pro**
  - 更高质量
  - 响应较慢
  - 适合复杂任务

### 旧模型（不推荐）

- `gemini-pro` - 可能已弃用，不建议使用

## 故障排除

### 错误：500 Internal Server Error

**可能原因：**
1. API Key 未配置
2. API Key 格式错误
3. 网络连接问题

**解决方案：**

1. **检查环境变量**
   ```bash
   # 确保 .env.local 文件存在且包含正确的配置
   cat .env.local
   ```

2. **验证 API Key**
   - 确保 API Key 没有多余的空格
   - 确保 API Key 格式正确（通常以 `AIza` 开头）

3. **检查网络**
   - 如果在中国大陆，可能需要使用 VPN
   - 检查防火墙设置

4. **查看服务器日志**
   - 在运行 `npm run dev` 的终端中查看错误信息
   - 查找 "Google AI API Error" 日志

### 错误：API key not configured

**解决方案：**
1. 确保 `.env.local` 文件存在
2. 确保文件中包含 `GOOGLE_AI_API_KEY=你的密钥`
3. 重启开发服务器

### 错误：Failed to call Google AI API

**可能原因：**
- API Key 无效
- 网络连接问题
- 配额已用完

**解决方案：**
1. 在 Google AI Studio Dashboard 检查 API Key 状态
2. 检查使用配额
3. 尝试创建新的 API Key

## 备用方案

如果 Google AI Studio 无法使用，系统会自动使用备用任务池。功能仍然可用，只是任务不是 AI 生成的。

## 测试配置

配置完成后，可以：

1. 打开应用：http://localhost:3000
2. 点击"刷新任务"按钮
3. 查看是否成功生成 AI 任务
4. 如果失败，检查浏览器控制台和服务器日志

## 更多信息

- Google AI Studio 文档：https://ai.google.dev/docs
- API 参考：https://ai.google.dev/api

