import { NextRequest, NextResponse } from 'next/server'

// 通义千问 DashScope API 配置
const DASHSCOPE_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || ''
const QWEN_MODEL = process.env.QWEN_MODEL || 'qwen-turbo'

export async function POST(request: NextRequest) {
  try {
    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: 'DashScope API key not configured. Please set DASHSCOPE_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // 解析用户输入的故事提示
    let userInput = ''
    try {
      const body = await request.json()
      userInput = body.prompt || ''
    } catch {
      // 如果没有请求体，使用默认提示
    }

    // 生成适合4年级学生的曲折离奇故事
    const systemPrompt = '你是一个专门为小学4年级学生创作故事的AI助手。请创作一个曲折离奇、引人入胜的故事。故事要求：1) 适合4年级学生的认知水平和理解能力 2) 情节曲折有趣，有悬念和转折 3) 主题积极向上，传递正能量 4) 语言生动有趣，容易理解 5) 故事长度控制在300-500字左右 6) 包含冒险、探索、友谊、勇气等元素 7) 用中文创作'
    
    // 根据用户输入构建提示
    let userPrompt = ''
    if (userInput && userInput.trim()) {
      userPrompt = `请根据以下要求创作一个适合4年级学生的故事：

用户的要求：${userInput}

请创作一个情节引人入胜、有悬念和转折、主题积极向上的故事。`
    } else {
      userPrompt = '请为我创作一个适合4年级学生的曲折离奇的故事，要求情节引人入胜，有悬念和转折，主题积极向上。'
    }

    // 构建通义千问 DashScope API 请求体
    const requestBody = {
      model: QWEN_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9, // 提高温度以获得更有创意的故事
      max_tokens: 1500, // 增加token数量以支持更长的故事
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
      console.error('Story API Error:', errorData)
      return NextResponse.json(
        { 
          error: 'Failed to generate story', 
          details: typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
          status: response.status 
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // 提取故事内容
    let storyContent = ''
    
    if (data.choices && data.choices.length > 0) {
      storyContent = data.choices[0]?.message?.content || ''
    } else if (data.content) {
      storyContent = data.content
    }
    
    if (!storyContent) {
      console.error('Story API returned empty content:', data)
      return NextResponse.json(
        { 
          error: 'Story API returned empty response', 
          details: JSON.stringify(data).substring(0, 200) 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ story: storyContent })
  } catch (error: any) {
    console.error('Story API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
