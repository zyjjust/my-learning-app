-- 创建已兑换商品表（支持每日兑换一次）
-- 注意：如果表已存在，请先执行 migrate-purchased-items.sql

-- 1. 如果表不存在，创建表（包含 purchased_date 列）
CREATE TABLE IF NOT EXISTS public.purchased_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  item_cost INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  purchased_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 2. 如果表已存在但没有 purchased_date 列，添加该列
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'purchased_items' 
    AND column_name = 'purchased_date'
  ) THEN
    ALTER TABLE public.purchased_items 
    ADD COLUMN purchased_date DATE NOT NULL DEFAULT CURRENT_DATE;
    
    -- 为现有数据填充 purchased_date（基于 purchased_at）
    UPDATE public.purchased_items 
    SET purchased_date = DATE(purchased_at) 
    WHERE purchased_date IS NULL;
  END IF;
END $$;

-- 3. 删除旧的唯一索引（如果存在）
DROP INDEX IF EXISTS public.idx_purchased_items_user_item;

-- 4. 创建唯一约束：每个用户每天每个商品只能兑换一次
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchased_items_user_item_date 
ON public.purchased_items(user_id, item_id, purchased_date);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_purchased_items_user_id ON public.purchased_items(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_items_purchased_at ON public.purchased_items(purchased_at);
CREATE INDEX IF NOT EXISTS idx_purchased_items_purchased_date ON public.purchased_items(purchased_date);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.purchased_items ENABLE ROW LEVEL SECURITY;

-- 删除旧策略（如果存在）
DROP POLICY IF EXISTS "Users can view own purchased items" ON public.purchased_items;
DROP POLICY IF EXISTS "Users can insert own purchased items" ON public.purchased_items;

-- 创建策略：用户可以查看自己的已兑换商品
CREATE POLICY "Users can view own purchased items"
  ON public.purchased_items
  FOR SELECT
  USING (true);

-- 创建策略：用户可以插入自己的已兑换商品
CREATE POLICY "Users can insert own purchased items"
  ON public.purchased_items
  FOR INSERT
  WITH CHECK (true);

-- 添加最后登录日期字段到 users 表（如果不存在）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'users' 
    AND column_name = 'last_login_date'
  ) THEN
    ALTER TABLE public.users 
    ADD COLUMN last_login_date DATE;
  END IF;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_last_login_date ON public.users(last_login_date);

