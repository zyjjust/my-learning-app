# 通义千问 API 设置指南

## 概述

本项目使用阿里云 DashScope 服务的通义千问（Qwen）模型来提供 AI 任务生成和 AI 导师对话功能。

## 获取 API Key

### 步骤 1：注册/登录阿里云账户

1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 注册新账户或登录现有账户

### 步骤 2：开通 DashScope 服务

1. 访问 [DashScope 控制台](https://dashscope.console.aliyun.com/)
2. 点击"开通服务"或"立即使用"
3. 按照提示完成服务开通

### 步骤 3：创建 API Key

1. 在 DashScope 控制台中，进入 **API-KEY 管理** 页面
2. 点击 **创建新的 API Key**
3. 复制生成的 API Key（注意：API Key 只显示一次，请妥善保存）

### 步骤 4：配置环境变量

1. 在项目根目录找到 `.env.local` 文件（如果不存在，从 `env.example` 复制）
2. 添加以下配置：

```env
# 通义千问 DashScope API 配置
DASHSCOPE_API_KEY=你的API_Key_在这里
QWEN_MODEL=qwen-turbo
```

## 模型选择

### qwen-turbo（推荐）
- **特点**：快速响应，适合实时对话
- **适用场景**：AI 导师对话、快速任务生成
- **免费额度**：新用户有免费额度

### qwen-plus
- **特点**：更强的理解能力，响应稍慢
- **适用场景**：复杂问题解答、高质量内容生成
- **免费额度**：新用户有免费额度

## API 使用说明

### 功能 1：AI 任务生成
- 自动生成 3 个适合 4 年级学生的学习任务
- 任务包含学科类型、难度等级、金币奖励
- 使用 `qwen-turbo` 模型，响应速度快

### 功能 2：AI 导师对话
- 提供学习辅导和问题解答
- 语言亲切友好，适合小学生
- 支持数学、语文、英语、科学等各科目

## 费用说明

### 免费额度
- 新用户注册后通常有免费额度
- 具体额度请查看 DashScope 控制台的费用说明

### 付费标准
- 超出免费额度后按量付费
- 价格相对实惠，适合个人项目使用
- 详细价格请参考 [DashScope 定价页面](https://help.aliyun.com/zh/dashscope/product-overview/billing-overview)

## 常见问题

### Q1: API Key 在哪里找到？
A: 登录 DashScope 控制台 → API-KEY 管理 → 创建或查看 API Key

### Q2: 如何查看 API 调用情况？
A: 在 DashScope 控制台的"用量统计"页面可以查看调用次数和费用

### Q3: API 调用失败怎么办？
A: 
1. 检查 API Key 是否正确配置
2. 确认账户余额充足（如果超出免费额度）
3. 查看控制台的错误日志
4. 检查网络连接是否正常

### Q4: 可以更换模型吗？
A: 可以，在 `.env.local` 中修改 `QWEN_MODEL` 的值即可，支持 `qwen-turbo` 和 `qwen-plus`

### Q5: 如何提高 API 响应速度？
A: 
1. 使用 `qwen-turbo` 模型（比 `qwen-plus` 更快）
2. 减少 `max_tokens` 参数值
3. 优化提示词，使其更简洁

## 安全建议

1. **不要提交 API Key 到代码仓库**
   - 确保 `.env.local` 在 `.gitignore` 中
   - 不要在代码中硬编码 API Key

2. **定期更换 API Key**
   - 如果怀疑 API Key 泄露，立即在控制台删除并创建新的

3. **设置使用限额**
   - 在 DashScope 控制台可以设置 API 调用限额，防止意外超支

## 技术支持

- [DashScope 官方文档](https://help.aliyun.com/zh/dashscope/)
- [通义千问模型文档](https://help.aliyun.com/zh/dashscope/developer-reference/model-introduction)
- [API 参考文档](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)

## 更新日志

- 2024: 从 Google AI Studio 迁移到通义千问 DashScope API















