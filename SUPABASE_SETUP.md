# Supabase 数据库配置说明

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 创建新项目
3. 记录项目 URL 和 Anon Key

## 2. 配置环境变量

在项目根目录创建 `.env.local` 文件，添加以下配置：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. 创建数据库表

在 Supabase Dashboard 的 SQL Editor 中执行以下 SQL：

### 用户资料表 (user_profiles)

```sql
-- 创建用户资料表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  gold_coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看和更新自己的数据
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

### 任务表 (tasks) - 可选

如果需要保存任务历史，可以创建任务表：

```sql
-- 创建任务表
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  xp INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  difficulty TEXT CHECK (difficulty IN ('简单', '中等', '困难')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 启用 RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can view own tasks"
  ON public.tasks
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tasks"
  ON public.tasks
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tasks"
  ON public.tasks
  FOR DELETE
  USING (auth.uid() = user_id);
```

## 4. 创建 Storage Bucket（用于头像上传）

1. 在 Supabase Dashboard 中，进入 Storage
2. 创建新的 bucket，命名为 `avatars`
3. 设置为 Public bucket（如果需要公开访问）
4. 添加以下策略：

```sql
-- 允许用户上传自己的头像
CREATE POLICY "Users can upload own avatar"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 允许所有人查看头像
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');
```

## 5. 验证配置

1. 确保环境变量已正确设置
2. 启动开发服务器：`npm run dev`
3. 尝试注册/登录
4. 检查 Supabase Dashboard 中的表是否有数据

## 6. 注意事项

- 确保 RLS (Row Level Security) 已正确配置，保护用户数据
- 头像上传需要配置 Storage bucket 和策略
- 生产环境建议使用更强的安全策略
- 定期备份数据库

## 7. 故障排除

### 问题：无法连接 Supabase
- 检查环境变量是否正确
- 确认 Supabase 项目是否正常运行
- 检查网络连接

### 问题：无法插入数据
- 检查 RLS 策略是否正确配置
- 确认用户已登录
- 查看 Supabase 日志

### 问题：头像上传失败
- 检查 Storage bucket 是否存在
- 确认 Storage 策略已配置
- 检查文件大小限制






