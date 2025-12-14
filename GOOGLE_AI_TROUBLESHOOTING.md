# Google AI Studio 故障排除指南

## 常见问题

### 1. API 调用失败

**可能原因：**
- API Key 未配置或配置错误
- 网络连接问题
- 地区限制（Google AI Studio 在中国大陆不可用）

**解决方案：**

#### 检查环境变量
确保 `.env.local` 文件中包含：
```env
GOOGLE_AI_MODEL=gemini-1.5-flash
GOOGLE_AI_API_KEY=your-actual-api-key-here
```

#### 获取 API Key
1. 访问 https://aistudio.google.com/app/apikey
2. 登录 Google 账号
3. 创建新的 API Key
4. 复制 API Key 到 `.env.local` 文件

#### 检查网络连接
- 如果在中国大陆，需要使用 VPN 连接到支持的地区
- 检查防火墙设置
- 尝试使用代理服务

### 2. 模型名称错误

**推荐使用的模型：**
- `gemini-1.5-flash` - 快速响应，适合大多数场景（推荐）
- `gemini-1.5-pro` - 更高质量，但响应较慢

**旧模型（可能已弃用）：**
- `gemini-pro` - 可能不再可用

### 3. 错误信息解读

#### "API key not configured"
- 检查 `.env.local` 文件中是否有 `GOOGLE_AI_API_KEY`
- 确保 API Key 格式正确（没有多余的空格或引号）
- 重启开发服务器：`npm run dev`

#### "Failed to call Google AI API"
- 检查网络连接
- 验证 API Key 是否有效
- 查看服务器控制台的详细错误信息

#### "网络连接失败"
- 可能需要使用 VPN
- 检查防火墙或代理设置
- 尝试在其他网络环境下测试

### 4. 调试步骤

1. **检查环境变量**
   ```bash
   # 在项目根目录检查
   cat .env.local
   ```

2. **查看服务器日志**
   - 打开终端查看 `npm run dev` 的输出
   - 查找 "Calling Google AI API" 和 "Google AI API Error" 日志

3. **测试 API 连接**
   - 打开浏览器开发者工具
   - 查看 Network 标签页中的 `/api/ai` 请求
   - 检查响应状态和错误信息

4. **验证 API Key**
   - 访问 Google AI Studio Dashboard
   - 确认 API Key 状态为 "Active"
   - 检查使用配额是否已用完

### 5. 备用方案

如果 Google AI Studio 无法使用，可以考虑：

1. **使用其他 AI 服务**
   - OpenAI API
   - 其他兼容的 AI 服务

2. **使用备用任务池**
   - 系统会自动使用预定义的任务池
   - 功能仍然可用，只是任务不是 AI 生成的

### 6. 联系支持

如果问题持续存在：
1. 检查 Google AI Studio 服务状态
2. 查看官方文档：https://ai.google.dev/docs
3. 联系 Google AI Studio 支持

## 快速检查清单

- [ ] `.env.local` 文件存在
- [ ] `GOOGLE_AI_API_KEY` 已配置
- [ ] API Key 格式正确（无多余空格）
- [ ] 已重启开发服务器
- [ ] 网络连接正常
- [ ] 如果在中国大陆，已使用 VPN
- [ ] 查看服务器日志中的错误信息
- [ ] 检查浏览器控制台的网络请求

