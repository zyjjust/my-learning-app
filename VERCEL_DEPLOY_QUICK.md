# Vercel 快速部署指南

## 🚀 5 分钟快速部署

### 第一步：准备环境变量值

在开始之前，请准备好以下 4 个环境变量的值：

| 变量名 | 获取位置 | 说明 |
|--------|---------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | [Supabase Dashboard](https://app.supabase.com) → Settings → API | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | [Supabase Dashboard](https://app.supabase.com) → Settings → API | Supabase 匿名密钥 |
| `DASHSCOPE_API_KEY` | [DashScope 控制台](https://dashscope.console.aliyun.com/) → API-KEY 管理 | 通义千问 API Key |
| `QWEN_MODEL` | - | 使用默认值：`qwen-turbo` |

---

### 第二步：在 Vercel 部署

1. **访问 Vercel**
   ```
   https://vercel.com
   ```

2. **登录**
   - 点击 **Sign Up** 或 **Log In**
   - 选择 **Continue with GitHub**

3. **导入项目**
   - 点击 **Add New Project**
   - 找到并选择 `zyjjust/my-learning-app`
   - 点击 **Import**

4. **添加环境变量** ⚠️ 必须完成！
   
   在 **Environment Variables** 部分，点击 **Add** 添加：
   
   ```
   NEXT_PUBLIC_SUPABASE_URL = [您的值]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [您的值]
   DASHSCOPE_API_KEY = [您的值]
   QWEN_MODEL = qwen-turbo
   ```
   
   **重要提示：**
   - 每个变量都要单独添加
   - 选择环境：勾选 **Production, Preview, Development**（全选）

5. **部署**
   - 点击 **Deploy** 按钮
   - 等待 2-5 分钟构建完成

6. **完成！**
   - 点击 **Visit** 查看您的网站
   - 您的网站 URL：`https://my-learning-app-xxx.vercel.app`

---

## ✅ 部署后检查

访问您的网站，测试以下功能：

- [ ] 网站可以正常打开
- [ ] 可以注册/登录
- [ ] AI 任务生成功能正常
- [ ] AI 导师对话功能正常
- [ ] 其他功能正常

---

## 🔧 如果遇到问题

### 问题 1：环境变量未生效
**解决：** 在 Vercel 项目设置中重新添加环境变量，然后重新部署

### 问题 2：构建失败
**解决：** 
1. 进入 Vercel 项目 → **Deployments**
2. 点击失败的部署
3. 查看 **Build Logs** 查找错误

### 问题 3：功能不工作
**解决：**
1. 检查浏览器控制台（F12）的错误信息
2. 确认环境变量已正确配置
3. 检查 Supabase 和 DashScope API 是否正常

---

## 📝 更新网站

以后要更新网站，只需：

```bash
git add .
git commit -m "更新描述"
git push
```

Vercel 会自动检测并部署新版本！

---

**需要详细步骤？** 查看 `DEPLOY_STEPS.md`












