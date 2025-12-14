/**
 * 在 Supabase users 表中创建用户
 * 使用方法: npx tsx scripts/create-user-db.ts zzh 147369
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// 加载 .env.local 文件
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('请先配置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function createUser(username: string, password: string) {
  console.log(`正在创建用户: ${username}...`)

  try {
    // 检查用户是否已存在
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      console.log('⚠️  用户已存在:', username)
      return
    }

    // 哈希密码
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // 插入用户
    const { data, error } = await supabase
      .from('users')
      .insert({
        username,
        password_hash,
        name: username,
        level: 1,
        current_xp: 0,
        gold_coins: 0,
        streak: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('❌ 创建用户失败:', error.message)
      console.error('详细错误:', error)
      return
    }

    console.log('✅ 用户创建成功!')
    console.log('用户信息:')
    console.log('  ID:', data.id)
    console.log('  用户名:', data.username)
    console.log('  姓名:', data.name)
    console.log('  等级:', data.level)
  } catch (error: any) {
    console.error('❌ 发生错误:', error.message)
  }
}

// 执行创建用户
const username = process.argv[2] || 'zzh'
const password = process.argv[3] || '147369'

if (!username || !password) {
  console.error('使用方法: npx tsx scripts/create-user-db.ts <username> <password>')
  process.exit(1)
}

createUser(username, password).then(() => {
  console.log('\n完成!')
  process.exit(0)
})

