/**
 * 检查并创建用户
 * 使用方法: npx tsx scripts/check-and-create-user.ts
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
  console.error('❌ 请先配置环境变量: NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.log('请在 .env.local 文件中配置这些变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAndCreateUser() {
  console.log('🔍 检查数据库连接...')
  
  // 检查表是否存在
  const { data: tables, error: tableError } = await supabase
    .from('users')
    .select('username')
    .limit(1)

  if (tableError) {
    console.error('❌ 无法访问 users 表:', tableError.message)
    console.log('\n📝 请先在 Supabase Dashboard 中执行 database/users-table.sql 文件中的 SQL 语句')
    console.log('   1. 打开 Supabase Dashboard')
    console.log('   2. 进入 SQL Editor')
    console.log('   3. 复制 database/users-table.sql 的内容')
    console.log('   4. 粘贴并执行 SQL')
    process.exit(1)
  }

  console.log('✅ users 表存在')

  // 检查用户是否存在
  const username = 'zzh'
  console.log(`\n🔍 检查用户 "${username}" 是否存在...`)
  
  const { data: existingUser, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (userError && userError.code !== 'PGRST116') {
    console.error('❌ 查询用户时出错:', userError.message)
    process.exit(1)
  }

  if (existingUser) {
    console.log('✅ 用户已存在')
    console.log('   用户名:', existingUser.username)
    console.log('   姓名:', existingUser.name)
    console.log('   等级:', existingUser.level)
    console.log('\n💡 如果无法登录，可能是密码哈希不正确')
    console.log('   可以删除用户后重新创建，或直接使用注册功能')
    return
  }

  // 创建用户
  console.log('📝 用户不存在，正在创建...')
  const password = '147369'
  
  // 哈希密码
  const salt = await bcrypt.genSalt(10)
  const password_hash = await bcrypt.hash(password, salt)

  const { data: newUser, error: insertError } = await supabase
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

  if (insertError) {
    console.error('❌ 创建用户失败:', insertError.message)
    console.error('详细错误:', insertError)
    process.exit(1)
  }

  console.log('✅ 用户创建成功!')
  console.log('   用户名:', newUser.username)
  console.log('   密码:', password)
  console.log('   姓名:', newUser.name)
  console.log('\n🎉 现在可以使用以下信息登录:')
  console.log('   用户名: zzh')
  console.log('   密码: 147369')
}

checkAndCreateUser().then(() => {
  console.log('\n完成!')
  process.exit(0)
}).catch((error) => {
  console.error('发生错误:', error)
  process.exit(1)
})

