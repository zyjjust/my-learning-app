import { NextRequest, NextResponse } from 'next/server'

// 通义千问 TTS API 配置
// 使用 DashScope 语音合成 API
const DASHSCOPE_TTS_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts'
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || ''

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    if (!DASHSCOPE_API_KEY) {
      return NextResponse.json(
        { error: 'DashScope API key not configured. Please set DASHSCOPE_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    // 调用通义千问 TTS API
    // 使用女生语音模型（根据实际可用的模型调整）
    // 可用的模型包括：sambert-zhinan-v1, sambert-zhiqi-v1, sambert-zhichu-v1 等
    const requestBody = {
      model: 'sambert-zhinan-v1', // 使用可用的中文语音模型
      input: {
        text: text,
      },
      parameters: {
        format: 'mp3', // 输出格式
        sample_rate: 16000, // 采样率
        voice: 'Aixia', // 女生音色（根据模型支持的音色调整）
      },
    }
    
    console.log('TTS Request:', JSON.stringify(requestBody, null, 2))
    
    const response = await fetch(DASHSCOPE_TTS_API_URL, {
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
      console.error('TTS API Error:', errorData)
      return NextResponse.json(
        { 
          error: 'Failed to generate speech', 
          details: typeof errorData === 'string' ? errorData : JSON.stringify(errorData),
          status: response.status 
        },
        { status: response.status }
      )
    }

    // TTS API 返回的可能是音频流或JSON格式
    const contentType = response.headers.get('content-type') || ''
    
    if (contentType.includes('application/json')) {
      // 如果返回JSON，可能包含音频URL或任务ID
      const jsonData = await response.json()
      
      if (jsonData.output?.url) {
        // 如果返回音频URL
        return NextResponse.json({ 
          audio: jsonData.output.url,
          format: 'mp3',
          type: 'url'
        })
      } else if (jsonData.task_id) {
        // 如果是异步任务，返回任务ID（需要轮询）
        return NextResponse.json({ 
          task_id: jsonData.task_id,
          type: 'async'
        })
      } else {
        throw new Error('Unexpected TTS response format')
      }
    } else {
      // 如果返回音频流
      const audioBuffer = await response.arrayBuffer()
      
      // 将音频转换为 base64 以便前端使用
      const base64Audio = Buffer.from(audioBuffer).toString('base64')
      const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`

      return NextResponse.json({ 
        audio: audioDataUrl,
        format: 'mp3',
        type: 'base64'
      })
    }
  } catch (error: any) {
    console.error('TTS API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}














