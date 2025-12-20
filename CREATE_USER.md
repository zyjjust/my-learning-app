# 在 Supabase 中创建用户

## 方法 1：使用脚本创建（推荐）

### 步骤 1：安装依赖（如果需要）
```bash
npm install tsx --save-dev
```

### 步骤 2：运行脚本
```bash
npx tsx scripts/create-user.ts zzh 147369
```

或者直接使用默认值（zzh / 147369）：
```bash
npx tsx scripts/create-user.ts
```

## 方法 2：通过 Supabase Dashboard 创建

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目
3. 进入 **Authentication** > **Users**
4. 点击 **Add User** 或 **Invite User**
5. 填写信息：
   - **Email**: `zzh@learning-app.local` (或任何有效的邮箱格式)
   - **Password**: `147369`
   - **Auto Confirm User**: 勾选（自动确认，无需邮箱验证）
6. 点击 **Create User**

## 方法 3：使用 API 创建

### 通过浏览器控制台

打开浏览器控制台（F12），在登录页面执行：

```javascript
// 替换为你的 Supabase URL 和 Key
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const { data, error } = await supabase.auth.signUp({
  email: 'zzh@learning-app.local',
  password: '147369',
  options: {
    data: {
      name: 'zzh',
    },
  },
})

if (error) {
  console.error('错误:', error.message)
} else {
  console.log('成功!', data.user)
}
```

## 方法 4：直接使用注册功能

1. 启动应用：`npm run dev`
2. 访问登录页面
3. 点击"还没有账户？立即注册"
4. 填写信息：
   - **姓名**: `zzh`
   - **邮箱**: `zzh@learning-app.local` (或任何邮箱格式)
   - **密码**: `147369`
5. 点击"注册"

## 重要说明

⚠️ **Supabase 使用邮箱登录，不是用户名**

- 用户名 `zzh` 会转换为邮箱格式：`zzh@learning-app.local`
- 或者你可以使用任何有效的邮箱格式，如：`zzh@gmail.com`
- 登录时使用邮箱和密码

## 登录信息

创建用户后，可以使用以下信息登录：

- **邮箱**: `zzh@learning-app.local` (或你设置的邮箱)
- **密码**: `147369`

## 验证用户是否创建成功

1. 在 Supabase Dashboard 中查看 **Authentication** > **Users**
2. 或者尝试使用上述登录信息登录应用

## 故障排除

### 问题：用户已存在
- 如果用户已存在，脚本会尝试登录
- 或者直接在登录页面使用邮箱和密码登录

### 问题：需要邮箱确认
- 在 Supabase Dashboard 中，进入 **Authentication** > **Users**
- 找到用户，点击 **Confirm Email** 或设置 **Auto Confirm**

### 问题：无法创建用户资料
- 确保已执行 `SUPABASE_SETUP.md` 中的 SQL 脚本
- 检查 `user_profiles` 表是否存在
- 查看 Supabase 日志中的错误信息















