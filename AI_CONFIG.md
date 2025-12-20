# AI API 配置说明

## 环境变量配置

为了使用AI任务生成和AI导师功能，需要配置以下环境变量：

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件，添加以下配置：

```env
# AI API URL (支持OpenAI兼容的API)
AI_API_URL=https://api.openai.com/v1/chat/completions

# AI API Key
AI_API_KEY=your-api-key-here

# AI Model (可选，默认为 gpt-3.5-turbo)
AI_MODEL=gpt-3.5-turbo
```

### 2. 支持的API服务

- **OpenAI**: `https://api.openai.com/v1/chat/completions`
- **其他兼容OpenAI格式的API服务**（如：Azure OpenAI、Anthropic Claude等）

### 3. 获取API密钥

- **OpenAI**: 访问 https://platform.openai.com/api-keys 获取
- **其他服务**: 请参考对应服务的文档

### 4. 功能说明

配置完成后，以下功能将自动启用：

- ✅ **AI任务生成**: 除"课后作业"和"运动打卡"外的3个任务将由AI生成
- ✅ **AI导师对话**: 点击"召唤AI导师"按钮，可以与AI进行实时对话

### 5. 注意事项

- 如果未配置API密钥，系统会使用备用任务池生成任务
- AI导师功能需要API密钥才能正常工作
- 建议在生产环境中妥善保管API密钥，不要提交到代码仓库



















