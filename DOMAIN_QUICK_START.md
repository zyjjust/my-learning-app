# 域名配置快速指南

## 🚀 最快方式：使用 Vercel 免费子域名

您的项目已经有一个免费域名了！

**当前域名：** `https://my-learning-app-ten.vercel.app`

✅ **无需任何配置，立即可用！**
✅ **自动 HTTPS**
✅ **完全免费**

---

## 📝 如果需要自定义域名

### 步骤 1：注册免费域名（Freenom）

1. 访问：https://www.freenom.com
2. 注册账号
3. 搜索域名（例如：`mylearningapp`）
4. 选择免费后缀：`.tk`、`.ml`、`.ga` 或 `.cf`
5. 完成注册（免费）

### 步骤 2：在 Vercel 中添加域名

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目 `my-learning-app`
3. 进入 **Settings** → **Domains**
4. 输入您的域名（例如：`mylearningapp.tk`）
5. 点击 **Add**

### 步骤 3：配置 DNS

Vercel 会显示需要配置的 DNS 记录：

**在 Freenom 中配置：**

1. 登录 Freenom
2. 进入域名管理
3. 选择 "Management Tools" → "Manage Freenom DNS"
4. 添加以下记录：

```
类型: A
名称: @
目标: 76.76.21.21
TTL: 3600
```

或者：

```
类型: CNAME
名称: @
目标: cname.vercel-dns.com
TTL: 3600
```

5. 保存并等待 5-60 分钟生效

### 步骤 4：验证

返回 Vercel Dashboard，查看域名状态：
- ✅ **Valid Configuration** = 配置成功
- ⏳ **Pending** = 等待 DNS 传播

---

## 💡 推荐方案对比

| 方案 | 时间 | 成本 | 稳定性 |
|------|------|------|--------|
| **Vercel 子域名** | 0 分钟 | 免费 | ⭐⭐⭐⭐⭐ |
| **Freenom 免费域名** | 30-60 分钟 | 免费 | ⭐⭐⭐ |
| **付费域名** | 30-60 分钟 | $8-15/年 | ⭐⭐⭐⭐⭐ |

---

## 📚 详细文档

查看 `DOMAIN_SETUP.md` 获取完整指南。

---

**建议：** 先使用 Vercel 免费子域名，如果需要更专业的域名，再考虑注册自定义域名。



















