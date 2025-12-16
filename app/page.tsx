"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import confetti from "canvas-confetti"
import {
  ShoppingBag,
  Star,
  Trophy,
  Zap,
  X,
  Sparkles,
  Gift,
  Gamepad2,
  BookOpen,
  IceCream,
  Flame,
  Coins,
  MessageCircle,
  User,
  Sword,
  Shield,
  Target,
  Crown,
  RefreshCw,
  Upload,
  Moon,
  Sun,
  Palette,
  Send,
  Loader2,
  Package,
  CheckCircle2,
  TrendingUp,
} from "lucide-react"

// 4年级学习任务池（备用，AI生成失败时使用）
const grade4TaskPool = [
  { text: "数学：完成10道加减法混合运算", coins: 10, difficulty: "简单" as const },
  { text: "数学：完成5道乘法练习题（2位数×1位数）", coins: 12, difficulty: "简单" as const },
  { text: "数学：完成3道除法练习题", coins: 14, difficulty: "中等" as const },
  { text: "数学：完成5道分数练习题", coins: 15, difficulty: "中等" as const },
  { text: "数学：完成2道应用题", coins: 16, difficulty: "中等" as const },
  { text: "语文：朗读课文《观潮》3遍", coins: 8, difficulty: "简单" as const },
  { text: "语文：背诵古诗《静夜思》", coins: 10, difficulty: "简单" as const },
  { text: "语文：完成生字练习（10个生字）", coins: 12, difficulty: "中等" as const },
  { text: "语文：写一篇150字的日记", coins: 14, difficulty: "中等" as const },
  { text: "语文：阅读课外书30分钟", coins: 11, difficulty: "简单" as const },
  { text: "英语：背诵10个新单词", coins: 12, difficulty: "中等" as const },
  { text: "英语：跟读英语课文5遍", coins: 10, difficulty: "简单" as const },
  { text: "英语：完成英语练习册1页", coins: 13, difficulty: "中等" as const },
  { text: "英语：听英语故事15分钟", coins: 9, difficulty: "简单" as const },
  { text: "科学：观察植物生长并记录", coins: 14, difficulty: "中等" as const },
  { text: "科学：完成科学实验报告", coins: 17, difficulty: "困难" as const },
  { text: "科学：学习天气变化知识", coins: 11, difficulty: "简单" as const },
  { text: "科学：制作一个简单的手工作品", coins: 15, difficulty: "中等" as const },
  { text: "美术：画一幅风景画", coins: 12, difficulty: "中等" as const },
  { text: "美术：完成手工作业", coins: 14, difficulty: "中等" as const },
  { text: "音乐：学唱一首新歌", coins: 10, difficulty: "简单" as const },
  { text: "音乐：练习乐器20分钟", coins: 13, difficulty: "中等" as const },
  { text: "阅读：阅读课外书30分钟", coins: 11, difficulty: "简单" as const },
  { text: "阅读：完成阅读笔记", coins: 14, difficulty: "中等" as const },
]

type Task = {
  id: number
  text: string
  completed: boolean
  coins: number
  difficulty: "简单" | "中等" | "困难"
}

// 生成固定任务
function generateFixedTasks(): Task[] {
  return [
    {
      id: 1,
      text: "课后作业：完成今日所有科目的作业",
      completed: false,
      coins: 20,
      difficulty: "困难",
    },
    {
      id: 2,
      text: "运动打卡：完成30分钟运动（跑步/跳绳/打球等）",
      completed: false,
      coins: 10,
      difficulty: "简单",
    },
  ]
}

// 调用通义千问AI生成3个任务
async function generateAITasks(): Promise<Task[]> {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "generate-tasks",
        prompt: "请生成3个适合4年级学生的今日学习任务，要求多样化，涵盖不同学科。",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to generate tasks")
    }

    const data = await response.json()
    const aiTasks = data.tasks || []

    // 确保返回3个任务，如果AI返回的任务数量不足，使用备用任务池补充
    const formattedTasks = aiTasks.slice(0, 3).map((task: any, index: number) => ({
      id: index + 3,
      text: task.text,
      completed: false,
      coins: task.coins || 12,
      difficulty: task.difficulty || "中等",
    }))

    // 如果AI返回的任务少于3个，使用备用任务池补充
    if (formattedTasks.length < 3) {
      const shuffled = [...grade4TaskPool].sort(() => Math.random() - 0.5)
      const neededCount = 3 - formattedTasks.length
      const backupTasks = shuffled.slice(0, neededCount).map((task, index) => ({
        id: formattedTasks.length + index + 3,
        text: task.text,
        completed: false,
        coins: task.coins,
        difficulty: task.difficulty,
      }))
      return [...formattedTasks, ...backupTasks]
    }

    return formattedTasks
  } catch (error) {
    console.error("Error generating AI tasks:", error)
    // 如果AI调用失败，使用备用任务池生成3个任务
    const shuffled = [...grade4TaskPool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, 3).map((task, index) => ({
      id: index + 3,
      text: task.text,
      completed: false,
      coins: task.coins,
      difficulty: task.difficulty,
    }))
  }
}

export default function GamifiedDashboard() {
  const { theme, setTheme } = useTheme()
  const { user, loading: authLoading, signOut, refreshUser, setUser } = useAuth()
  const [level, setLevel] = useState(1)
  const [currentLevelXP, setCurrentLevelXP] = useState(0)
  const [totalXP, setTotalXP] = useState(0) // 累计积分
  const [goldCoins, setGoldCoins] = useState(0)
  const [streak, setStreak] = useState(0)
  const [title, setTitle] = useState("学习新星") // 称号
  const [purchasedItems, setPurchasedItems] = useState<number[]>([])
  const [showPurchasedItems, setShowPurchasedItems] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false)
  const [showThemeMenu, setShowThemeMenu] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const backgroundInputRef = useRef<HTMLInputElement>(null)

  // AI导师相关状态
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)

  // 加载用户数据
  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  // 加载背景图（在组件挂载时和用户状态变化时）
  useEffect(() => {
    loadBackgroundImage()
  }, [user])

  // 加载背景图
  const loadBackgroundImage = () => {
    // 优先从 localStorage 加载
    const savedBg = localStorage.getItem('backgroundImageUrl')
    if (savedBg) {
      setBackgroundImageUrl(savedBg)
      return
    }
    // 如果已登录，尝试从 Supabase 加载
    if (user) {
      loadBackgroundFromSupabase()
    } else {
      // 默认使用哆啦A梦背景图（如果 localStorage 中没有保存的图片）
      // 使用哆啦A梦相关的背景图片作为默认背景
      // 备选URL列表，如果第一个不可用会自动尝试下一个
      const doraemonBackgrounds = [
        'https://wallpaperaccess.com/full/9503999.jpg', // 哆啦A梦壁纸
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&q=80', // 备用1
        'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=1920&q=80', // 备用2
      ]
      const defaultDoraemonBg = doraemonBackgrounds[0]
      setBackgroundImageUrl(defaultDoraemonBg)
    }
  }

  // 从 Supabase 加载背景图
  const loadBackgroundFromSupabase = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("users")
        .select("background_image_url")
        .eq("id", user.id)
        .single()

      if (!error && data?.background_image_url) {
        setBackgroundImageUrl(data.background_image_url)
        localStorage.setItem('backgroundImageUrl', data.background_image_url)
      }
    } catch (error) {
      console.error("Error loading background image:", error)
    }
  }

  // 根据累计积分计算等级和称号
  const calculateLevelAndTitle = (totalXP: number) => {
    // 等级计算公式：每100积分升一级
    const calculatedLevel = Math.floor(totalXP / 100) + 1
    
    // 当前等级的积分进度（0-100）
    const currentXP = totalXP % 100
    
    // 根据等级计算称号
    let calculatedTitle = "学习新星"
    if (calculatedLevel >= 20) {
      calculatedTitle = "知识王者"
    } else if (calculatedLevel >= 15) {
      calculatedTitle = "智慧大师"
    } else if (calculatedLevel >= 10) {
      calculatedTitle = "学习达人"
    } else if (calculatedLevel >= 5) {
      calculatedTitle = "进步之星"
    }
    
    return { level: calculatedLevel, title: calculatedTitle, currentXP }
  }

  // 播放音效
  const playSound = (soundType: 'complete' | 'coin' | 'levelup') => {
    try {
      // 使用 Web Audio API 生成音效
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (soundType === 'complete') {
        // 完成任务音效：叮咚声
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1)
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.3)
      } else if (soundType === 'coin') {
        // 金币音效
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.05)
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.2)
      } else if (soundType === 'levelup') {
        // 升级音效：上升音调
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2)
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.4)
      }
    } catch (error) {
      console.log("Audio not supported or user interaction required")
    }
  }

  // 触发五彩纸屑特效
  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'],
        particleCount,
      })
    }, 250)
  }

  // 从数据库加载用户数据
  const loadUserData = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error loading user data:", error)
        return
      }

      if (data) {
        const totalXPValue = data.total_xp || 0
        setTotalXP(totalXPValue)
        
        // 根据累计积分计算等级和称号
        const { level: calculatedLevel, title: calculatedTitle, currentXP } = calculateLevelAndTitle(totalXPValue)
        setLevel(calculatedLevel)
        setCurrentLevelXP(currentXP)
        setTitle(calculatedTitle)
        
        setGoldCoins(data.gold_coins || 0)
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }
        if (data.background_image_url) {
          setBackgroundImageUrl(data.background_image_url)
          localStorage.setItem('backgroundImageUrl', data.background_image_url)
        }

        // 处理连续登录天数
        await updateLoginStreak(data.last_login_date, data.streak || 0)

        // 加载已兑换商品
        await loadPurchasedItems()
        await loadAllPurchasedItems()
      }
    } catch (error) {
      console.error("Error in loadUserData:", error)
    }
  }

  // 更新连续登录天数
  const updateLoginStreak = async (lastLoginDate: string | null, currentStreak: number) => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    let newStreak = currentStreak

    if (!lastLoginDate) {
      // 首次登录
      newStreak = 1
    } else if (lastLoginDate === today) {
      // 今天已登录，不增加
      newStreak = currentStreak
    } else if (lastLoginDate === yesterday) {
      // 昨天登录，今天继续，累加
      newStreak = currentStreak + 1
    } else {
      // 中断了，重置为1
      newStreak = 1
    }

    setStreak(newStreak)

    // 更新数据库
    await supabase
      .from("users")
      .update({
        streak: newStreak,
        last_login_date: today,
      })
      .eq("id", user.id)
  }

  // 加载已兑换商品（今天已兑换的商品ID列表）
  const loadPurchasedItems = async () => {
    if (!user) return

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from("purchased_items")
        .select("item_id")
        .eq("user_id", user.id)
        .eq("purchased_date", today)

      if (error) {
        console.error("Error loading purchased items:", error)
        return
      }

      if (data) {
        setPurchasedItems(data.map(item => item.item_id))
      }
    } catch (error) {
      console.error("Error in loadPurchasedItems:", error)
    }
  }

  // 加载所有已兑换商品（用于显示数量）
  const [allPurchasedItems, setAllPurchasedItems] = useState<Array<{ item_id: number; count: number; item_name: string }>>([])

  const loadAllPurchasedItems = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("purchased_items")
        .select("item_id, item_name")
        .eq("user_id", user.id)
        .order("purchased_at", { ascending: false })

      if (error) {
        console.error("Error loading all purchased items:", error)
        return
      }

      if (data) {
        // 统计每个商品的兑换次数
        const itemCounts = new Map<number, { count: number; item_name: string }>()
        data.forEach(item => {
          const existing = itemCounts.get(item.item_id)
          if (existing) {
            existing.count++
          } else {
            itemCounts.set(item.item_id, { count: 1, item_name: item.item_name })
          }
        })
        setAllPurchasedItems(Array.from(itemCounts.values()).map(({ count, item_name }, item_id) => ({
          item_id: Array.from(itemCounts.keys())[Array.from(itemCounts.values()).findIndex(v => v.item_name === item_name)],
          count,
          item_name
        })))
      }
    } catch (error) {
      console.error("Error in loadAllPurchasedItems:", error)
    }
  }

  // 同步数据到数据库
  const syncUserData = async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("users")
        .update({
          level,
          current_xp: currentLevelXP,
          total_xp: totalXP,
          gold_coins: goldCoins,
          streak,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error syncing user data:", error)
      } else {
        // 更新本地用户信息
        setUser({
          ...user,
          level,
          current_xp: currentLevelXP,
          gold_coins: goldCoins,
          streak,
          avatar_url: avatarUrl || undefined,
        })
      }
    } catch (error) {
      console.error("Error in syncUserData:", error)
    }
  }

  // 当数据变化时同步到数据库
  useEffect(() => {
    if (user && (level || currentLevelXP || totalXP || goldCoins || streak || avatarUrl)) {
      const timer = setTimeout(() => {
        syncUserData()
      }, 1000) // 防抖，1秒后同步

      return () => clearTimeout(timer)
    }
  }, [user, level, currentLevelXP, totalXP, goldCoins, streak, avatarUrl])

  // 从localStorage加载头像（兼容旧数据）
  useEffect(() => {
    if (!user) {
      const savedAvatar = localStorage.getItem("avatarUrl")
      if (savedAvatar) {
        setAvatarUrl(savedAvatar)
      }
    }
  }, [user])

  // 在组件加载时生成任务
  useEffect(() => {
    loadTasks()
  }, [])

  // 加载任务：2个固定任务（课后作业、运动打卡）+ 3个AI生成任务
  const loadTasks = async () => {
    setIsGeneratingTasks(true)
    try {
      // 生成2个固定任务：课后作业、运动打卡
      const fixedTasks = generateFixedTasks()
      // 调用通义千问API生成3个任务
      const aiTasks = await generateAITasks()
      // 组合任务：固定任务在前，AI任务在后
      setTasks([...fixedTasks, ...aiTasks])
    } catch (error) {
      console.error("Error loading tasks:", error)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  // 刷新任务函数：重新生成AI任务，固定任务保持不变
  const refreshTasks = async () => {
    setIsGeneratingTasks(true)
    try {
      // 保持2个固定任务不变
      const fixedTasks = generateFixedTasks()
      // 重新调用通义千问API生成3个新任务
      const aiTasks = await generateAITasks()
      const newTasks = [...fixedTasks, ...aiTasks]
      // 保留已完成的任务状态
      const updatedTasks = newTasks.map((newTask) => {
        const existingTask = tasks.find((t) => t.text === newTask.text)
        return existingTask ? { ...newTask, completed: existingTask.completed } : newTask
      })
      setTasks(updatedTasks)
    } catch (error) {
      console.error("Error refreshing tasks:", error)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  // 处理头像上传
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过5MB")
      return
    }

    try {
      // 上传到 Supabase Storage
      if (user) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          // 如果上传失败，使用 base64 作为备用
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            setAvatarUrl(result)
          }
          reader.readAsDataURL(file)
          return
        }

        // 获取公共 URL
        const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
        setAvatarUrl(data.publicUrl)
      } else {
        // 未登录用户使用 base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          setAvatarUrl(result)
          localStorage.setItem("avatarUrl", result)
        }
        reader.readAsDataURL(file)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      // 备用方案：使用 base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarUrl(result)
        if (!user) {
          localStorage.setItem("avatarUrl", result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 处理背景图上传
  const handleBackgroundUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert("请上传图片文件")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过10MB")
      return
    }

    try {
      let imageUrl: string

      // 上传到 Supabase Storage
      if (user) {
        const fileExt = file.name.split(".").pop()
        const fileName = `bg-${user.id}-${Date.now()}.${fileExt}`
        const filePath = `backgrounds/${fileName}`

        // 确保 backgrounds bucket 存在（如果不存在，会在上传时创建，但需要先在 Supabase 中创建）
        const { error: uploadError } = await supabase.storage
          .from("backgrounds")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) {
          // 如果上传失败，使用 base64 作为备用
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            imageUrl = result
            setBackgroundImageUrl(result)
            localStorage.setItem('backgroundImageUrl', result)
            // 保存到数据库
            saveBackgroundToSupabase(result)
          }
          reader.readAsDataURL(file)
          return
        }

        // 获取公共 URL
        const { data } = supabase.storage.from("backgrounds").getPublicUrl(filePath)
        imageUrl = data.publicUrl
      } else {
        // 未登录用户使用 base64
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          imageUrl = result
          setBackgroundImageUrl(result)
          localStorage.setItem('backgroundImageUrl', result)
        }
        reader.readAsDataURL(file)
        return
      }

      // 更新状态和本地存储
      setBackgroundImageUrl(imageUrl)
      localStorage.setItem('backgroundImageUrl', imageUrl)
      
      // 保存到数据库
      if (user) {
        await saveBackgroundToSupabase(imageUrl)
      }
    } catch (error) {
      console.error("Error uploading background:", error)
      // 备用方案：使用 base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setBackgroundImageUrl(result)
        localStorage.setItem('backgroundImageUrl', result)
        if (user) {
          saveBackgroundToSupabase(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 保存背景图到 Supabase 数据库
  const saveBackgroundToSupabase = async (imageUrl: string) => {
    if (!user) return
    try {
      await supabase
        .from("users")
        .update({ background_image_url: imageUrl })
        .eq("id", user.id)
    } catch (error) {
      console.error("Error saving background to database:", error)
    }
  }

  // 发送AI导师消息
  const sendChatMessage = async () => {
    if (!chatInput.trim() || isChatting) return

    const userMessage = chatInput.trim()
    const newUserMessage = { role: "user" as const, content: userMessage }
    
    // 先更新UI，显示用户消息
    setChatMessages((prev) => [...prev, newUserMessage])
    setChatInput("")
    setIsChatting(true)

    try {
      // 使用最新的消息列表（包含刚添加的用户消息）
      const currentMessages = [...chatMessages, newUserMessage]
      
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "chat",
          messages: currentMessages,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "未知错误" }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setChatMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.content || "抱歉，我暂时无法回答这个问题。" 
      }])
    } catch (error: any) {
      console.error("Error sending chat message:", error)
      let errorMessage = "抱歉，发生了错误。"
      
      if (error.message) {
        if (error.message.includes("DashScope API key")) {
          errorMessage = "AI API 未配置。请在环境变量中设置 DASHSCOPE_API_KEY。"
        } else if (error.message.includes("Failed to call AI API")) {
          errorMessage = "AI API 调用失败。请检查网络连接和 API 配置。"
        } else {
          errorMessage = `错误：${error.message}`
        }
      }
      
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ])
    } finally {
      setIsChatting(false)
    }
  }

  const [showShop, setShowShop] = useState(false)
  const [showAITutor, setShowAITutor] = useState(false)
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState<{ itemId: number; itemName: string; cost: number } | null>(null)

  const shopItems = [
    { id: 1, name: "看电视一小时", icon: Gamepad2, cost: 200, color: "text-blue-500" },
    { id: 2, name: "零食一份", icon: IceCream, cost: 150, color: "text-cyan-500" },
    { id: 3, name: "新玩具一个", icon: Gift, cost: 300, color: "text-yellow-500" },
    { id: 4, name: "新图书一本", icon: BookOpen, cost: 250, color: "text-blue-500" },
    { id: 5, name: "户外游戏一次", icon: Sparkles, cost: 400, color: "text-green-500" },
  ]

  const toggleTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const newCompleted = !task.completed
    let newGoldCoins = goldCoins
    let newTotalXP = totalXP
    let levelUp = false
    let calculatedLevel = level
    let calculatedTitle = title

    if (newCompleted && !task.completed) {
      // 完成任务时增加金币和累计积分
      newGoldCoins = goldCoins + task.coins
      newTotalXP = totalXP + task.coins
      
      // 检查是否升级
      const oldLevel = Math.floor(totalXP / 100) + 1
      const newLevel = Math.floor(newTotalXP / 100) + 1
      levelUp = newLevel > oldLevel
      
      // 播放音效和特效
      playSound('complete')
      playSound('coin')
      triggerConfetti()
      
      // 如果升级，播放升级音效和特效
      if (levelUp) {
        setTimeout(() => {
          playSound('levelup')
          triggerConfetti()
        }, 300)
      }
    } else if (!newCompleted && task.completed) {
      // 取消完成时减少金币和累计积分（但不能小于0）
      newGoldCoins = Math.max(0, goldCoins - task.coins)
      newTotalXP = Math.max(0, totalXP - task.coins)
    }

    // 更新状态
    if (newGoldCoins !== goldCoins || newTotalXP !== totalXP) {
      setGoldCoins(newGoldCoins)
      setTotalXP(newTotalXP)
      
      // 重新计算等级和称号
      const levelData = calculateLevelAndTitle(newTotalXP)
      calculatedLevel = levelData.level
      calculatedTitle = levelData.title
      setLevel(calculatedLevel)
      setCurrentLevelXP(levelData.currentXP)
      setTitle(calculatedTitle)
      
      // 立即同步到数据库
      if (user) {
        try {
          await supabase
            .from("users")
            .update({ 
              gold_coins: newGoldCoins,
              total_xp: newTotalXP,
              level: calculatedLevel,
              current_xp: levelData.currentXP
            })
            .eq("id", user.id)
        } catch (error) {
          console.error("Error updating user data:", error)
          // 如果更新失败，回滚
          setGoldCoins(goldCoins)
          setTotalXP(totalXP)
          return
        }
      }
    }

    // 更新任务状态
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    
    // 如果升级，显示提示
    if (levelUp) {
      setTimeout(() => {
        alert(`🎉 恭喜升级！你现在是 ${calculatedTitle} (等级 ${calculatedLevel})！`)
      }, 500)
    }
  }

  const purchaseItem = async (itemId: number, cost: number, itemName: string) => {
    if (!user) return

    if (goldCoins < cost) {
      alert("金币不足！")
      return
    }

    // 检查今天是否已兑换
    const today = new Date().toISOString().split('T')[0]
    if (purchasedItems.includes(itemId)) {
      alert("你今天已经兑换过这个商品了！明天可以再次兑换。")
      return
    }

    try {
      // 更新金币
      const newGoldCoins = goldCoins - cost
      setGoldCoins(newGoldCoins)

      // 添加到已购买列表（今天的）
      const newPurchasedItems = [...purchasedItems, itemId]
      setPurchasedItems(newPurchasedItems)

      // 保存到数据库
      const { error: purchaseError } = await supabase
        .from("purchased_items")
        .insert({
          user_id: user.id,
          item_id: itemId,
          item_name: itemName,
          item_cost: cost,
          purchased_date: today,
        })

      if (purchaseError) {
        console.error("Error saving purchased item:", purchaseError)
        // 回滚
        setGoldCoins(goldCoins)
        setPurchasedItems(purchasedItems)
        if (purchaseError.code === '23505') {
          alert("你今天已经兑换过这个商品了！明天可以再次兑换。")
        } else {
          alert("购买失败，请重试")
        }
        return
      }

      // 同步用户数据
      await supabase
        .from("users")
        .update({ gold_coins: newGoldCoins })
        .eq("id", user.id)

      // 播放音效
      playSound('coin')
      
      // 重新加载所有已购买商品
      await loadAllPurchasedItems()

      setShowPurchaseConfirm(null)
    } catch (error) {
      console.error("Error purchasing item:", error)
      alert("购买失败，请重试")
    }
  }

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const progressPercent = Math.round((completedTasks / totalTasks) * 100)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return "bg-green-500/20 text-green-700 border-green-500/50"
      case "中等":
        return "bg-orange-500/20 text-orange-700 border-orange-500/50"
      case "困难":
        return "bg-red-500/20 text-red-700 border-red-500/50"
      default:
        return "bg-gray-500/20 text-gray-700 border-gray-500/50"
    }
  }

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "简单":
        return Shield
      case "中等":
        return Target
      case "困难":
        return Sword
      default:
        return Star
    }
  }

  // 如果正在加载认证状态，显示加载界面
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  // 如果未登录，显示登录界面
  if (!user) {
    return (
      <div className="relative min-h-screen overflow-hidden flex items-center justify-center p-4">
        {/* 登录页面背景图片 - 哆啦A梦 */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: backgroundImageUrl 
              ? `url(${backgroundImageUrl})` 
              : 'url(https://wallpaperaccess.com/full/9503999.jpg)',
            backgroundAttachment: 'fixed',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-cyan-900/40 to-green-900/50 dark:from-gray-900/80 dark:via-gray-800/80 dark:to-gray-900/80"></div>
        </div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-[10%] top-[15%] h-32 w-32 animate-pulse rounded-full bg-yellow-200 blur-3xl"></div>
          <div className="absolute right-[15%] top-[25%] h-40 w-40 animate-pulse rounded-full bg-blue-200 blur-3xl"></div>
          <div className="absolute bottom-[20%] left-[20%] h-36 w-36 animate-pulse rounded-full bg-cyan-200 blur-3xl"></div>
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="text-center mb-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">学习英雄</h1>
            <p className="text-gray-600 dark:text-gray-400">开始你的游戏化学习之旅</p>
          </div>
          <LoginForm onSuccess={() => refreshUser()} setUser={setUser} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="mx-auto max-w-7xl">
        {/* Google Material Design Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* 等级和积分卡片 - Material Design */}
          <Card className="material-card bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-yellow-100 p-2.5">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">等级 {level}</p>
                  <p className="text-lg font-semibold text-gray-900">{title}</p>
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">累计积分: {totalXP}</span>
                      <span className="text-xs text-gray-500">{currentLevelXP}/100</span>
                    </div>
                    {/* 等级进度条 */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${(currentLevelXP / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 标题和标语 - Material Design */}
          <Card className="material-card bg-white border-0 shadow-sm flex-1 min-w-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="rounded-full bg-blue-100 p-1.5">
                  <Zap className="h-4 w-4 text-blue-600" />
                </div>
                <h1 className="text-2xl font-medium text-gray-900">智慧少年学习助手</h1>
              </div>
              <p className="text-sm text-gray-600">坚持就是胜利,你做得太棒了!</p>
            </CardContent>
          </Card>

          {/* 连续登录卡片 - Material Design */}
          <Card className="material-card bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2.5">
                  <Flame className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">连续登录</p>
                  <p className="text-2xl font-semibold text-gray-900">{streak}天</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 用户菜单 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowThemeMenu(!showThemeMenu)}
                className="h-9 w-9 p-0"
              >
                <Palette className="h-4 w-4" />
              </Button>
              {showThemeMenu && (
                <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg z-50">
                  <button
                    onClick={() => {
                      setTheme("light")
                      setShowThemeMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-t-lg"
                  >
                    <Sun className="h-4 w-4" />
                    <span>浅色</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme("dark")
                      setShowThemeMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Moon className="h-4 w-4" />
                    <span>深色</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme("system")
                      setShowThemeMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                  >
                    <Palette className="h-4 w-4" />
                    <span>跟随系统</span>
                  </button>
                  <div className="border-t border-gray-200"></div>
                  <button
                    onClick={() => {
                      backgroundInputRef.current?.click()
                      setShowThemeMenu(false)
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-b-lg"
                  >
                    <Upload className="h-4 w-4" />
                    <span>更换背景</span>
                  </button>
                </div>
              )}
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
              />
            </div>
            <div className="relative group">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-9 w-9 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* 左侧：每日任务 */}
          <div>
            {/* 任务标题栏 - Material Design */}
            <div className="mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 p-4 material-card-elevated shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/20 p-1.5">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-medium text-white">每日任务</h2>
                </div>
                <span className="rounded-full bg-white/20 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  完成 {completedTasks}/{totalTasks}
                </span>
              </div>
            </div>

            {/* 任务列表 - Google风格卡片 */}
            <div className="space-y-3">
              {tasks.map((task) => {
                const DifficultyIcon = getDifficultyIcon(task.difficulty)
                const taskType = task.id <= 2 ? "固定任务" : "AI 任务"
                
                // 根据任务类型选择图标
                let TaskIcon = BookOpen
                if (task.id === 1) {
                  TaskIcon = BookOpen // 每日课后作业
                } else if (task.id === 2) {
                  TaskIcon = Zap // 运动健康打卡
                } else {
                  TaskIcon = BookOpen // AI任务
                }

                return (
                  <Card
                    key={task.id}
                    className={`material-card bg-white border-0 shadow-sm hover:shadow-md transition-shadow ${
                      task.completed ? "opacity-60" : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* 任务图标 - Material Design */}
                        <div className={`mt-0.5 rounded-lg p-2.5 ${task.completed ? "bg-green-50" : "bg-blue-50"}`}>
                          <TaskIcon className={`h-5 w-5 ${task.completed ? "text-green-700" : "text-blue-700"}`} />
                        </div>

                        {/* 任务内容 */}
                        <div className="flex-1 min-w-0">
                          <h3
                            className={`mb-2 text-sm font-medium leading-snug ${
                              task.completed ? "text-gray-400 line-through" : "text-gray-800"
                            }`}
                          >
                            {task.text}
                          </h3>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {taskType}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              +{task.coins} 积分
                            </span>
                          </div>
                        </div>

                        {/* 完成按钮 - Material Design Radio Button */}
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
                            task.completed
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300 hover:border-gray-400 bg-white"
                          }`}
                          aria-label={task.completed ? "取消完成" : "完成任务"}
                        >
                          {task.completed && (
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* 刷新AI任务按钮 - Material Design */}
            <Button
              onClick={refreshTasks}
              variant="outline"
              className="mt-4 w-full border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 font-medium rounded-lg shadow-sm"
              disabled={isGeneratingTasks}
            >
              {isGeneratingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新 AI 任务
                </>
              )}
            </Button>

          </div>

          {/* 右侧：兑换商店和AI助手 */}
          <div className="space-y-4">
            {/* 兑换商店 - Material Design */}
            <Card className="material-card bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-orange-100 p-1.5">
                      <ShoppingBag className="h-4 w-4 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">兑换商店</h3>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1.5 border border-yellow-200">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">余额: {goldCoins}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto">
                  {shopItems.map((item) => {
                    const ItemIcon = item.icon
                    const isPurchased = purchasedItems.includes(item.id)
                    const canAfford = goldCoins >= item.cost
                    const purchasedCount = allPurchasedItems.find(p => p.item_id === item.id)?.count || 0

                    return (
                      <Card
                        key={item.id}
                        className={`material-card bg-white border-0 shadow-sm hover:shadow-md transition-shadow ${
                          isPurchased ? "opacity-60" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex flex-col">
                            <div className="flex items-start gap-3 mb-2">
                              <div className="mt-0.5 rounded-lg p-2 bg-gray-100">
                                <ItemIcon className="h-5 w-5 text-gray-700" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium mb-1 ${isPurchased ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                  {item.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">已兑换: {purchasedCount}次</span>
                              <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                                ☆{item.cost} 积分
                              </span>
                            </div>
                            <Button
                              onClick={() => {
                                if (isPurchased) {
                                  alert("你今天已经兑换过这个商品了！明天可以再次兑换。")
                                } else if (!canAfford) {
                                  alert("金币不足！")
                                } else {
                                  setShowPurchaseConfirm({ itemId: item.id, itemName: item.name, cost: item.cost })
                                }
                              }}
                              disabled={isPurchased || !canAfford}
                              className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                              {isPurchased ? "今日已兑换" : canAfford ? "立即兑换" : "积分不足"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* AI学习助手 - Material Design */}
            <Card className="material-card bg-white border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="mb-4 flex items-center justify-between border-b border-gray-200 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-blue-100 p-1.5">
                      <MessageCircle className="h-4 w-4 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">AI 学习助手</h3>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">在线</span>
                </div>

                {/* 聊天消息列表 - Material Design */}
                <div className="mb-4 space-y-2 max-h-[300px] overflow-y-auto">
                  {chatMessages.length === 0 ? (
                    <div className="rounded-lg bg-blue-50 p-4 border-l-4 border-blue-500 shadow-sm">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium text-gray-900">AI 老师</span>: 你好!我是你的AI学习助手。准备好开始今天的学习了吗?
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            msg.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatting && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 输入框 - Material Design */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="输入你的问题..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !isChatting && chatInput.trim()) {
                        sendChatMessage()
                      }
                    }}
                    disabled={isChatting}
                    className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={isChatting || !chatInput.trim()}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChatting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Shop Modal - Material Design */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-white material-card-elevated rounded-lg">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-6 w-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">兑换商店</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShop(false)}
                  className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Gold Coins Display - Material Design */}
              <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-yellow-100 p-1.5">
                      <Coins className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">当前余额</span>
                  </div>
                  <span className="text-2xl font-medium text-gray-900">{goldCoins.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                {shopItems.map((item) => {
                  const isPurchased = purchasedItems.includes(item.id)
                  const canAfford = goldCoins >= item.cost
                  const ItemIcon = item.icon
                  const purchasedCount = allPurchasedItems.find(p => p.item_id === item.id)?.count || 0

                  return (
                    <Card
                      key={item.id}
                      className={`material-card bg-white border border-gray-200 ${
                        isPurchased ? "opacity-60" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-full p-2 bg-gray-100">
                            <ItemIcon className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium mb-1 ${isPurchased ? "text-gray-400 line-through" : "text-gray-800"}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.id === 1 && "看你最喜欢的动画片。"}
                              {item.id === 2 && "享受美味的零食时光。"}
                              {item.id === 3 && "获得一个新玩具奖励。"}
                              {item.id === 4 && "从书店买一本新图书。"}
                              {item.id === 5 && "在外面玩飞盘或捉迷藏。"}
                            </p>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-gray-500">已兑换: {purchasedCount}次</span>
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">☆{item.cost} 积分</span>
                            </div>
                            <Button
                              onClick={() => {
                                if (isPurchased) {
                                  alert("你今天已经兑换过这个商品了！明天可以再次兑换。")
                                } else if (!canAfford) {
                                  alert("积分不足！")
                                } else {
                                  setShowPurchaseConfirm({ itemId: item.id, itemName: item.name, cost: item.cost })
                                }
                              }}
                              disabled={isPurchased || !canAfford}
                              className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isPurchased ? "今日已兑换" : canAfford ? "立即兑换" : "积分不足"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <p className="mt-6 text-center text-xs text-gray-500">完成更多任务来赚取积分解锁奖励！</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Tutor Modal - Google Style */}
      {showAITutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white shadow-lg">
            <CardContent className="p-6 flex flex-col flex-1 overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">AI 学习助手</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600 font-medium">在线</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowAITutor(false)
                      setChatMessages([])
                      setChatInput("")
                    }}
                    className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] max-h-[400px]">
                {chatMessages.length === 0 ? (
                  <div className="rounded-lg bg-purple-50 p-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">AI 老师</span>: 你好!我是你的AI学习助手。准备好开始今天的学习了吗?
                    </p>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-purple-500 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                  placeholder="输入你的问题..."
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  disabled={isChatting}
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatting}
                  className="rounded-lg bg-purple-500 px-4 py-2 text-white hover:bg-purple-600 disabled:opacity-50"
                >
                  {isChatting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Confirmation Modal - Google Style */}
      {showPurchaseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="relative w-full max-w-md bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">确认兑换</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPurchaseConfirm(null)}
                  className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-6 text-center">
                <Gift className="mx-auto mb-4 h-12 w-12 text-purple-500" />
                <p className="mb-3 text-lg font-semibold text-gray-800">
                  {showPurchaseConfirm.itemName}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    需要花费 <span className="font-semibold text-lg text-purple-600">{showPurchaseConfirm.cost}</span> 积分
                  </p>
                  <p className="text-sm text-gray-600">
                    当前余额: <span className="font-semibold text-base text-gray-800">{goldCoins}</span>
                  </p>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  每个商品每天只能兑换一次，明天可以再次兑换
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseConfirm(null)}
                  className="flex-1 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  取消
                </Button>
                <Button
                  onClick={() => purchaseItem(showPurchaseConfirm.itemId, showPurchaseConfirm.cost, showPurchaseConfirm.itemName)}
                  className="flex-1 rounded-lg bg-purple-500 text-white hover:bg-purple-600"
                >
                  确认兑换
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchased Items Modal - Google Style */}
      {showPurchasedItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-800">我的商品</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPurchasedItems(false)}
                  className="h-8 w-8 text-gray-600 hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {allPurchasedItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-base text-gray-600">还没有购买任何商品</p>
                  <p className="mt-2 text-sm text-gray-500">
                    完成更多任务来赚取积分，然后在商店中兑换奖励吧！
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPurchasedItems.map((purchasedItem) => {
                    const shopItem = shopItems.find(item => item.id === purchasedItem.item_id)
                    if (!shopItem) return null
                    const ItemIcon = shopItem.icon
                    return (
                      <Card
                        key={purchasedItem.item_id}
                        className="bg-white border hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-lg p-2 bg-gray-100">
                              <ItemIcon className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-800 mb-1">
                                {purchasedItem.item_name}
                              </p>
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-gray-500">已兑换</span>
                                <span className="text-sm font-semibold text-gray-800">{purchasedItem.count}</span>
                                <span className="text-xs text-gray-500">次</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
