# 快速开始指南

## 已实现的功能

✅ **登录/注册功能**
- 使用 Supabase 认证
- 支持邮箱密码登录和注册
- 自动创建用户资料

✅ **数据同步**
- 用户数据自动同步到 Supabase
- 支持经验值、金币、连续天数等数据
- 头像上传到 Supabase Storage

✅ **数据持久化**
- 所有用户数据保存在 Supabase 数据库
- 跨设备同步
- 自动保存和加载

## 快速配置步骤

### 1. 安装依赖（已完成）
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2. 创建 Supabase 项目
1. 访问 https://supabase.com
2. 创建新项目
3. 记录项目 URL 和 Anon Key

### 3. 配置环境变量
创建 `.env.local` 文件：
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. 设置数据库
在 Supabase Dashboard 的 SQL Editor 中执行 `SUPABASE_SETUP.md` 中的 SQL 语句。

### 5. 配置 Storage
1. 在 Supabase Dashboard 中创建 `avatars` bucket
2. 设置为 Public
3. 配置存储策略（见 `SUPABASE_SETUP.md`）

### 6. 启动应用
```bash
npm run dev
```

## 功能说明

### 登录/注册
- 未登录用户会看到登录界面
- 支持注册新账户
- 注册时自动创建用户资料

### 数据同步
- 用户数据（等级、经验值、金币等）自动同步到数据库
- 防抖机制：数据变化后 1 秒自动保存
- 页面加载时自动从数据库加载数据

### 头像上传
- 登录用户：上传到 Supabase Storage
- 未登录用户：使用 localStorage（临时）

### 登出功能
- 点击右上角"登出"按钮
- 清除本地会话
- 返回登录界面

## 数据库表结构

### user_profiles
- `id`: UUID (主键，关联 auth.users)
- `email`: 邮箱
- `name`: 姓名
- `level`: 等级
- `current_xp`: 当前经验值
- `gold_coins`: 金币数量
- `streak`: 连续天数
- `avatar_url`: 头像 URL
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 安全特性

- Row Level Security (RLS) 已启用
- 用户只能访问自己的数据
- 自动更新触发器
- 安全的头像上传策略

## 故障排除

### 无法登录
- 检查环境变量是否正确
- 确认 Supabase 项目正常运行
- 查看浏览器控制台错误

### 数据未同步
- 检查 RLS 策略是否正确
- 确认用户已登录
- 查看 Supabase 日志

### 头像上传失败
- 检查 Storage bucket 是否存在
- 确认存储策略已配置
- 检查文件大小限制（5MB）

## 下一步

- [ ] 添加任务历史记录
- [ ] 实现数据导出功能
- [ ] 添加社交功能
- [ ] 实现成就系统








