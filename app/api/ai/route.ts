import { NextRequest, NextResponse } from 'next/server'

// 通义千问 DashScope API 配置（兼容模式）
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || ''
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-turbo'

export async function POST(request: NextRequest) {
  try {
    const { type, prompt, messages } = await request.json()

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: 'DashScope API key not configured. Please set DASHSCOPE_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    let systemPrompt = ''
    let userPrompt = ''

    if (type === 'generate-tasks') {
      // 生成任务 - 添加随机性确保每次生成不同的任务
      const subjects = ['数学', '语文', '英语', '科学', '美术', '音乐', '体育', '阅读', '写作', '历史', '地理']
      const shuffledSubjects = subjects.sort(() => Math.random() - 0.5).slice(0, 3)
      const randomSeed = Math.floor(Math.random() * 10000)
      const timeHint = new Date().toLocaleTimeString('zh-CN')
      
      systemPrompt = '你是一个专门为4年级学生设计学习任务的AI助手。请根据要求生成3个适合4年级学生的学习任务。每个任务应该：1) 适合4年级学生的认知水平 2) 有明确的完成标准 3) 包含学科类型 4) 任务描述简洁明了（不超过30字）5) 每次生成的任务必须与之前不同，要有创意和变化。请以JSON格式返回，格式为：[{"text": "任务描述", "coins": 金币数(10-16), "difficulty": "简单/中等/困难"}]'
      userPrompt = prompt || `请生成3个全新的适合4年级学生的学习任务。要求：1) 任务要有创意，不要重复常见的任务 2) 本次重点关注这些学科：${shuffledSubjects.join('、')} 3) 随机种子：${randomSeed}，时间：${timeHint}。请生成与以往完全不同的新任务。`
    } else if (type === 'chat') {
      // AI导师对话
      systemPrompt = '你是一个专门为4年级学生提供学习辅导的AI导师。你的特点是：1) 语言亲切友好，像朋友一样 2) 用简单易懂的方式解释复杂概念 3) 鼓励学生，给予正面反馈 4) 根据4年级学生的认知水平调整回答难度 5) 可以辅导数学、语文、英语、科学等各科目。请用中文回答。'
      userPrompt = prompt || messages?.[messages.length - 1]?.content || ''
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    // 构建通义千问 DashScope API 请求体（兼容模式使用 OpenAI 格式）
    let requestBody: any
    
    if (type === 'chat' && messages && messages.length > 0) {
      // 聊天模式：使用完整的消息历史
      requestBody = {
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((msg: any) => ({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          })),
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }
    } else {
      // 其他模式：使用单条消息
      requestBody = {
        model: QWEN_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: type === 'generate-tasks' ? 0.95 : 0.7,
        max_tokens: type === 'generate-tasks' ? 500 : 1000,
      }
    }

    // 调用通义千问 DashScope API
    const response = await fetch(DASHSCOPE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      let errorData: any
      try {
        errorData = await response.json()
      } catch {
        errorData = await response.text()
      }
      console.error('AI API Error:', errorData)
      return NextResponse.json(
        { 
          error: 'Failed to call AI API', 
          details: typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
          status: response.status 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // 兼容模式响应格式：data.choices[0].message.content（OpenAI 兼容格式）
    let content = ''
    
    if (data.choices && data.choices.length > 0) {
      content = data.choices[0]?.message?.content || ''
    } else if (data.content) {
      // 备用格式
      content = data.content
    }
    
    if (!content && type === 'chat') {
      console.error('AI API returned empty content:', data)
      return NextResponse.json(
        { 
          error: 'AI API returned empty response', 
          details: JSON.stringify(data).substring(0, 200) 
        },
        { status: 500 }
      )
    }

    // 如果是生成任务，尝试解析JSON
    if (type === 'generate-tasks') {
      try {
        // 尝试提取JSON部分
        const jsonMatch = content.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const tasks = JSON.parse(jsonMatch[0])
          // 确保每个任务都有 coins 字段
          const formattedTasks = tasks.map((task: any) => ({
            text: task.text,
            coins: task.coins || 12,
            difficulty: task.difficulty || '中等',
          }))
          return NextResponse.json({ tasks: formattedTasks })
        }
        // 如果无法解析，返回默认任务
        return NextResponse.json({
          tasks: [
            { text: '数学：完成10道加减法练习题', coins: 12, difficulty: '简单' },
            { text: '语文：朗读课文并完成课后练习', coins: 14, difficulty: '中等' },
            { text: '英语：背诵并默写5个新单词', coins: 13, difficulty: '中等' },
          ],
        })
      } catch (parseError) {
        console.error('Failed to parse tasks:', parseError)
        // 返回默认任务
        return NextResponse.json({
          tasks: [
            { text: '数学：完成10道加减法练习题', coins: 12, difficulty: '简单' },
            { text: '语文：朗读课文并完成课后练习', coins: 14, difficulty: '中等' },
            { text: '英语：背诵并默写5个新单词', coins: 13, difficulty: '中等' },
          ],
        })
      }
    }

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}





