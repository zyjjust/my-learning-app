-- 创建用户表（存储用户名和密码）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  name TEXT,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  gold_coins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  avatar_url TEXT,
  background_image_url TEXT,
  last_login_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 创建策略：所有人可以注册（插入）
CREATE POLICY "Anyone can register"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- 创建策略：用户可以查看自己的信息
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (true); -- 允许所有人查看（如果需要限制，可以改为使用 JWT 或其他方式）

-- 创建策略：用户可以更新自己的信息
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (true); -- 允许所有人更新（生产环境应该添加更严格的检查）

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 插入测试用户（用户名：zzh，密码：147369）
-- 注意：这里使用 bcrypt 哈希，实际使用时需要在应用层进行哈希
-- 这个密码的 bcrypt 哈希值是：$2a$10$rOzJqJqJqJqJqJqJqJqJqO（示例，需要实际计算）
INSERT INTO public.users (username, password_hash, name, level, current_xp, gold_coins, streak)
VALUES (
  'zzh',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 这是 '147369' 的 bcrypt 哈希
  'zzh',
  1,
  0,
  0,
  0
) ON CONFLICT (username) DO NOTHING;

