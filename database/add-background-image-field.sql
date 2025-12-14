-- 添加背景图片 URL 字段到 users 表
-- 如果字段已存在，此脚本不会报错

-- 添加 background_image_url 字段
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS background_image_url TEXT;

-- 添加 last_login_date 字段（如果代码中使用了但表中没有）
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login_date DATE;

-- 添加注释说明字段用途
COMMENT ON COLUMN public.users.background_image_url IS '用户自定义背景图片 URL';
COMMENT ON COLUMN public.users.last_login_date IS '用户最后登录日期，用于计算连续登录天数';
