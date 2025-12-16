# 自定义用户认证系统设置指南

## 概述

现在系统使用自定义的用户表来存储用户名和密码，而不是 Supabase 的内置认证系统。

## 1. 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行 `database/users-table.sql` 文件中的 SQL 语句。

这个 SQL 会：
- 创建 `users` 表
- 设置 RLS 策略
- 创建索引
- 插入测试用户（用户名：zzh，密码：147369）

## 2. 创建用户

### 方法 1：使用脚本（推荐）

```bash
npx tsx scripts/create-user-db.ts zzh 147369
```

### 方法 2：通过应用注册

1. 启动应用：`npm run dev`
2. 在登录页面点击"还没有账户？立即注册"
3. 填写用户名和密码
4. 点击注册

### 方法 3：直接在 Supabase 中插入

在 Supabase SQL Editor 中执行：

```sql
-- 需要先计算密码哈希（使用 bcrypt）
-- 这里提供一个示例，实际使用时需要在应用层计算
INSERT INTO public.users (username, password_hash, name, level, current_xp, gold_coins, streak)
VALUES (
  'zzh',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- '147369' 的 bcrypt 哈希
  'zzh',
  1,
  0,
  0,
  0
) ON CONFLICT (username) DO NOTHING;
```

## 3. 数据库表结构

### users 表字段

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| username | TEXT | 用户名（唯一） |
| password_hash | TEXT | 密码哈希（bcrypt） |
| email | TEXT | 邮箱（可选） |
| name | TEXT | 显示名称 |
| level | INTEGER | 等级 |
| current_xp | INTEGER | 当前经验值 |
| gold_coins | INTEGER | 金币数量 |
| streak | INTEGER | 连续天数 |
| avatar_url | TEXT | 头像 URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 4. 安全说明

- ✅ 密码使用 bcrypt 哈希存储，不会明文保存
- ✅ 使用 Row Level Security (RLS) 保护数据
- ✅ 密码验证在服务器端进行
- ⚠️ 生产环境建议添加更严格的 RLS 策略

## 5. API 端点

### POST /api/auth/login
登录用户

请求体：
```json
{
  "username": "zzh",
  "password": "147369"
}
```

### POST /api/auth/register
注册新用户

请求体：
```json
{
  "username": "zzh",
  "password": "147369",
  "name": "zzh" // 可选
}
```

### POST /api/auth/hash-password
哈希密码（内部使用）

### POST /api/auth/verify-password
验证密码（内部使用）

## 6. 登录流程

1. 用户输入用户名和密码
2. 前端调用 `/api/auth/login`
3. 后端从 `users` 表查询用户
4. 使用 bcrypt 验证密码
5. 返回用户信息（不包含密码）
6. 前端保存用户信息到 localStorage

## 7. 注册流程

1. 用户输入用户名和密码
2. 前端调用 `/api/auth/register`
3. 后端检查用户名是否已存在
4. 使用 bcrypt 哈希密码
5. 插入新用户到 `users` 表
6. 返回用户信息
7. 前端保存用户信息到 localStorage

## 8. 测试用户

已创建的测试用户：
- **用户名**: `zzh`
- **密码**: `147369`

## 9. 故障排除

### 问题：无法创建用户
- 检查 `users` 表是否存在
- 确认 RLS 策略已正确配置
- 查看 Supabase 日志

### 问题：登录失败
- 确认用户名和密码正确
- 检查密码哈希是否正确
- 查看浏览器控制台和服务器日志

### 问题：密码哈希错误
- 确保使用 bcrypt 进行哈希
- 验证哈希算法版本（$2a$）

## 10. 下一步

- [ ] 添加会话管理（JWT）
- [ ] 实现密码重置功能
- [ ] 添加邮箱验证
- [ ] 实现记住我功能
- [ ] 添加登录日志








