-- 添加每日宝箱字段到 users 表
-- 如果字段已存在，此脚本不会报错

-- 添加 last_chest_date 字段（上次开启宝箱的日期）
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_chest_date DATE;

-- 添加注释说明字段用途
COMMENT ON COLUMN public.users.last_chest_date IS '上次开启每日宝箱的日期，用于判断今天是否已开启';
