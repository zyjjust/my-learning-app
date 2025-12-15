# 免费域名注册与 Vercel 绑定指南

## 📋 目录

1. [免费域名选项](#免费域名选项)
2. [推荐方案：使用 Vercel 免费子域名](#推荐方案使用-vercel-免费子域名)
3. [方案一：Freenom 免费域名](#方案一freenom-免费域名)
4. [方案二：其他免费域名服务](#方案二其他免费域名服务)
5. [在 Vercel 中配置自定义域名](#在-vercel-中配置自定义域名)
6. [DNS 配置说明](#dns-配置说明)
7. [验证域名配置](#验证域名配置)

---

## 免费域名选项

### 方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **Vercel 免费子域名** | 完全免费、自动配置、HTTPS | 域名较长 | ⭐⭐⭐⭐⭐ |
| **Freenom** | 完全免费、.tk/.ml/.ga/.cf | 可能不稳定、部分服务商限制 | ⭐⭐⭐ |
| **付费域名** | 稳定、专业、选择多 | 需要付费（约 $10-15/年） | ⭐⭐⭐⭐ |

---

## 推荐方案：使用 Vercel 免费子域名

### 最简单的方式

Vercel 已经为您的项目提供了免费的子域名，格式为：
- `your-project-name.vercel.app`
- 或者 `your-project-name-xxx.vercel.app`

**优点：**
- ✅ 完全免费
- ✅ 自动配置 HTTPS
- ✅ 无需额外配置
- ✅ 稳定可靠

**如果您的项目已经部署，您已经有了一个这样的域名！**

---

## 方案一：Freenom 免费域名

### 注册步骤

1. **访问 Freenom**
   - 网址：https://www.freenom.com
   - 点击右上角 "Sign In" 或 "Register"

2. **注册账号**
   - 填写邮箱、用户名、密码
   - 验证邮箱

3. **搜索可用域名**
   - 在首页搜索框输入您想要的域名（例如：`mylearningapp`）
   - 选择后缀：`.tk`、`.ml`、`.ga`、`.cf` 或 `.gq`
   - 点击 "Get it now!"

4. **选择注册时长**
   - 免费域名可以注册 3 个月、6 个月或 12 个月
   - 选择最长的时间（12 个月）
   - 点击 "Checkout"

5. **完成注册**
   - 确认订单（免费）
   - 域名注册成功

### 注意事项

⚠️ **重要提示：**
- Freenom 的免费域名可能在某些地区被限制
- 部分邮箱服务商可能无法接收验证邮件
- 免费域名可能不如付费域名稳定
- 建议作为测试使用，生产环境考虑付费域名

---

## 方案二：其他免费域名服务

### 1. Dot TK (https://www.dot.tk)
- 提供 `.tk` 免费域名
- 需要一定流量要求才能保持免费

### 2. InfinityFree (https://www.infinityfree.net)
- 提供免费域名和托管
- 适合小型项目

### 3. 推荐：使用便宜的付费域名

如果免费域名不可用，可以考虑这些便宜的选项：

- **Namecheap**: $8-12/年（.com 域名）
- **Cloudflare Registrar**: $8-10/年（.com 域名）
- **GoDaddy**: 首年优惠价 $1-2（续费较贵）

---

## 在 Vercel 中配置自定义域名

### 步骤 1：进入项目设置

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择您的项目 `my-learning-app`
3. 点击 **Settings** 标签
4. 在左侧菜单中点击 **Domains**

### 步骤 2：添加域名

1. 在 "Domains" 页面，找到 "Add Domain" 输入框
2. 输入您的域名（例如：`mylearningapp.tk`）
3. 点击 **Add** 按钮

### 步骤 3：查看 DNS 配置

Vercel 会显示需要配置的 DNS 记录，通常包括：

**选项 A：使用 A 记录（推荐）**
```
类型: A
名称: @
值: 76.76.21.21
TTL: 3600
```

**选项 B：使用 CNAME 记录**
```
类型: CNAME
名称: @
值: cname.vercel-dns.com
TTL: 3600
```

**选项 C：使用 CNAME 记录（子域名）**
```
类型: CNAME
名称: www
值: cname.vercel-dns.com
TTL: 3600
```

---

## DNS 配置说明

### 在 Freenom 中配置 DNS

1. **登录 Freenom**
   - 访问 https://www.freenom.com
   - 登录您的账号

2. **进入域名管理**
   - 点击 "Services" → "My Domains"
   - 找到您的域名，点击 "Manage Domain"

3. **配置 DNS 记录**
   - 点击 "Management Tools" → "Nameservers"
   - 选择 "Use custom nameservers"
   - 或者选择 "Use Freenom DNS" 然后配置记录

4. **添加 DNS 记录**
   - 点击 "Management Tools" → "Manage Freenom DNS"
   - 添加以下记录：

   **主域名（根域名）配置：**
   ```
   类型: A
   名称: @
   目标: 76.76.21.21
   TTL: 3600
   ```

   **或者使用 CNAME：**
   ```
   类型: CNAME
   名称: @
   目标: cname.vercel-dns.com
   TTL: 3600
   ```

   **WWW 子域名配置：**
   ```
   类型: CNAME
   名称: www
   目标: cname.vercel-dns.com
   TTL: 3600
   ```

5. **保存配置**
   - 点击 "Save Changes"
   - 等待 DNS 传播（通常 5 分钟到 48 小时）

---

## 验证域名配置

### 在 Vercel 中验证

1. 返回 Vercel Dashboard
2. 进入项目的 **Settings** → **Domains**
3. 查看域名状态：
   - ✅ **Valid Configuration** - 配置正确
   - ⏳ **Pending** - 等待 DNS 传播
   - ❌ **Invalid Configuration** - 需要检查 DNS 设置

### 使用命令行验证

```bash
# 检查 DNS 记录
nslookup your-domain.tk

# 或者使用 dig（如果可用）
dig your-domain.tk
```

### 检查 HTTPS 证书

Vercel 会自动为您的域名配置 SSL 证书（Let's Encrypt），通常需要：
- DNS 配置正确后
- 等待 5-60 分钟
- 证书会自动生成和配置

---

## 常见问题

### Q1: DNS 配置后多久生效？

**A:** 通常 5 分钟到 48 小时，大多数情况下 1-2 小时内生效。

### Q2: 如何知道 DNS 是否配置正确？

**A:** 
1. 在 Vercel Dashboard 中查看域名状态
2. 使用在线工具检查：https://dnschecker.org
3. 等待 Vercel 显示 "Valid Configuration"

### Q3: 可以使用子域名吗？

**A:** 可以！例如：
- `app.yourdomain.tk`
- `www.yourdomain.tk`
- `learn.yourdomain.tk`

在 Vercel 中添加子域名时，输入完整子域名即可。

### Q4: 免费域名会过期吗？

**A:** 
- Freenom 免费域名需要定期续期（3-12 个月）
- 建议设置提醒，及时续期
- 或者考虑购买付费域名（更稳定）

### Q5: Vercel 的免费子域名可以自定义吗？

**A:** 
- 可以修改项目名称来改变子域名
- 但无法完全自定义（格式固定为 `project-name.vercel.app`）
- 如果需要完全自定义，需要绑定自己的域名

---

## 推荐配置流程

### 快速开始（推荐）

1. ✅ **使用 Vercel 免费子域名**（最简单）
   - 您的项目已经有：`my-learning-app-ten.vercel.app`
   - 无需额外配置，立即可用

2. 如果需要自定义域名：
   - 注册 Freenom 免费域名
   - 在 Vercel 中添加域名
   - 配置 DNS 记录
   - 等待生效

### 生产环境建议

对于生产环境，建议：
- 使用付费域名（更稳定、更专业）
- 推荐：Namecheap 或 Cloudflare Registrar
- 价格：约 $8-15/年

---

## 下一步

配置完成后：

1. ✅ 访问您的自定义域名
2. ✅ 确认 HTTPS 证书已配置
3. ✅ 测试所有功能是否正常
4. ✅ 更新您的应用中的链接（如果需要）

---

## 有用的链接

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Freenom**: https://www.freenom.com
- **DNS Checker**: https://dnschecker.org
- **Namecheap**: https://www.namecheap.com
- **Cloudflare Registrar**: https://www.cloudflare.com/products/registrar/

---

**提示：** 如果您只是想快速测试，建议先使用 Vercel 提供的免费子域名。如果需要更专业的域名，再考虑注册自定义域名。

