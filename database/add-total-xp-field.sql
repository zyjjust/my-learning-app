-- 添加累计积分字段到 users 表
-- 如果字段已存在，此脚本不会报错

-- 添加 total_xp 字段（累计积分）
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;

-- 添加注释说明字段用途
COMMENT ON COLUMN public.users.total_xp IS '累计积分，用于计算等级和称号';

-- 如果已有用户数据，将 current_xp 的值复制到 total_xp（可选）
-- UPDATE public.users SET total_xp = COALESCE(current_xp, 0) WHERE total_xp = 0;
