-- 添加每日任务生成日期字段到 users 表
-- 如果字段已存在，此脚本不会报错

-- 添加 last_tasks_date 字段（上次生成任务的日期）
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_tasks_date DATE;

-- 添加注释说明字段用途
COMMENT ON COLUMN public.users.last_tasks_date IS '上次生成每日任务的日期，用于判断今天是否已生成任务';
