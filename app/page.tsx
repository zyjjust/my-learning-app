"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase/client"
import { LoginForm } from "@/components/auth/login-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  const [goldCoins, setGoldCoins] = useState(0)
  const [streak, setStreak] = useState(0)
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
        setLevel(data.level || 1)
        setCurrentLevelXP(data.current_xp || 0)
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
    if (user && (level || currentLevelXP || goldCoins || streak || avatarUrl)) {
      const timer = setTimeout(() => {
        syncUserData()
      }, 1000) // 防抖，1秒后同步

      return () => clearTimeout(timer)
    }
  }, [user, level, currentLevelXP, goldCoins, streak, avatarUrl])

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
    setChatInput("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsChatting(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "chat",
          messages: [...chatMessages, { role: "user", content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()
      setChatMessages((prev) => [...prev, { role: "assistant", content: data.content || "抱歉，我暂时无法回答这个问题。" }])
    } catch (error) {
      console.error("Error sending chat message:", error)
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "抱歉，发生了错误。请检查AI API配置是否正确。" },
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

    if (newCompleted && !task.completed) {
      // 完成任务时增加金币
      newGoldCoins = goldCoins + task.coins
    } else if (!newCompleted && task.completed) {
      // 取消完成时减少金币（但不能小于0）
      newGoldCoins = Math.max(0, goldCoins - task.coins)
    }

    // 如果金币有变化，更新状态并同步到数据库
    if (newGoldCoins !== goldCoins) {
      setGoldCoins(newGoldCoins)
      
      // 立即同步金币到数据库
      if (user) {
        try {
          await supabase
            .from("users")
            .update({ gold_coins: newGoldCoins })
            .eq("id", user.id)
        } catch (error) {
          console.error("Error updating gold coins:", error)
          // 如果更新失败，回滚金币
          setGoldCoins(goldCoins)
          return // 如果数据库更新失败，不更新任务状态
        }
      }
    }

    // 更新任务状态
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
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
    <div className="relative min-h-screen overflow-hidden p-4 md:p-8">
      {/* 哆啦A梦背景图片 */}
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
        {/* 背景遮罩层，确保内容可读性 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-cyan-900/40 to-green-900/50 dark:from-gray-900/75 dark:via-gray-800/75 dark:to-gray-900/75"></div>
      </div>
      
      {/* 儿童风格装饰背景 */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        {/* 大号彩色圆圈 */}
        <div className="absolute left-[5%] top-[10%] h-40 w-40 animate-bounce rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-3xl animation-delay-1000"></div>
        <div className="absolute right-[10%] top-[20%] h-48 w-48 animate-bounce rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 blur-3xl animation-delay-2000"></div>
        <div className="absolute bottom-[15%] left-[15%] h-44 w-44 animate-bounce rounded-full bg-gradient-to-br from-green-400 to-emerald-400 blur-3xl animation-delay-3000"></div>
        <div className="absolute bottom-[25%] right-[8%] h-36 w-36 animate-bounce rounded-full bg-gradient-to-br from-blue-500 to-indigo-400 blur-3xl animation-delay-4000"></div>
        <div className="absolute top-[40%] left-[50%] h-32 w-32 animate-bounce rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 blur-3xl animation-delay-5000"></div>
      </div>

      {/* 可爱的浮动图标 */}
      <div className="pointer-events-none absolute inset-0">
        <Star className="absolute left-[8%] top-[12%] h-12 w-12 animate-bounce text-yellow-400 opacity-80 drop-shadow-lg animation-delay-1000" />
        <Star className="absolute right-[12%] top-[25%] h-10 w-10 animate-bounce text-orange-400 opacity-70 drop-shadow-lg animation-delay-2000" />
        <Sparkles className="absolute bottom-[20%] left-[18%] h-14 w-14 animate-bounce text-blue-400 opacity-70 drop-shadow-lg animation-delay-3000" />
        <Trophy className="absolute bottom-[18%] right-[18%] h-12 w-12 animate-bounce text-cyan-400 opacity-80 drop-shadow-lg animation-delay-4000" />
        <Zap className="absolute left-[30%] top-[35%] h-10 w-10 animate-bounce text-cyan-400 opacity-70 drop-shadow-lg animation-delay-5000" />
        <Crown className="absolute right-[25%] bottom-[30%] h-11 w-11 animate-bounce text-yellow-500 opacity-75 drop-shadow-lg animation-delay-6000" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Card with colorful child-friendly design */}
        <Card className="mb-6 border-4 border-blue-400 bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-blue-900 dark:via-cyan-900 dark:to-indigo-900 shadow-2xl rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                {/* Avatar with upload functionality */}
                <div className="relative group">
                  <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 p-1 shadow-lg overflow-hidden">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                        <User className="h-8 w-8 text-orange-500" />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="上传头像"
                  >
                    <Upload className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow-lg z-10">
                    {level}
                  </div>
                </div>
                <div>
                  {/* Title with dark text for better readability */}
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 bg-clip-text text-transparent drop-shadow-lg">
                    🚀 超级学习小英雄 🚀
                  </h1>
                  <p className="text-base font-bold text-orange-600 dark:text-orange-300">⭐ 第 {level} 级学习英雄 ⭐</p>
                </div>
              </div>

              {/* Theme Switcher and Logout */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowThemeMenu(!showThemeMenu)}
                    className="flex items-center gap-2"
                  >
                    <Palette className="h-4 w-4" />
                    <span>主题</span>
                  </Button>
                  {showThemeMenu && (
                    <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white dark:bg-gray-800 shadow-lg z-50">
                      <button
                        onClick={() => {
                          setTheme("light")
                          setShowThemeMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                      >
                        <Sun className="h-4 w-4" />
                        <span>浅色</span>
                      </button>
                      <button
                        onClick={() => {
                          setTheme("dark")
                          setShowThemeMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Moon className="h-4 w-4" />
                        <span>深色</span>
                      </button>
                      <button
                        onClick={() => {
                          setTheme("system")
                          setShowThemeMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Palette className="h-4 w-4" />
                        <span>跟随系统</span>
                      </button>
                      <div className="border-t border-gray-200 dark:border-gray-700"></div>
                      <button
                        onClick={() => {
                          backgroundInputRef.current?.click()
                          setShowThemeMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                  className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                  <span>登出</span>
                </Button>
              </div>

              {/* 金币显示区域 - 儿童风格 */}
              <div className="flex-1 md:mx-8">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-yellow-600 dark:text-yellow-400">💰 我的金币 💰</span>
                  <span className="text-2xl font-extrabold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    {goldCoins.toLocaleString()}
                  </span>
                </div>
                <div className="relative h-12 overflow-hidden rounded-full bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 shadow-lg border-2 border-yellow-300">
                  <div className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 animate-gradient-x bg-[length:200%_100%]">
                    <div className="h-full w-full animate-pulse bg-white/30"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-white drop-shadow-lg">
                    <Coins className="h-5 w-5 mr-2 animate-bounce" />
                    ✨ 金币多多 ✨
                  </div>
                </div>
              </div>

              {/* 连续登录天数 - 儿童风格 */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-blue-800 dark:to-cyan-800 px-5 py-3 shadow-xl border-2 border-blue-300">
                  <Flame className="h-7 w-7 text-orange-600 dark:text-orange-300 animate-pulse" />
                  <div>
                    <div className="text-xs font-bold text-orange-700 dark:text-orange-200">🔥 连续登录</div>
                    <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-300">{streak} 天</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Trophy className="h-10 w-10 text-yellow-500 animate-bounce" />
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 bg-clip-text text-transparent drop-shadow-lg">
                🎯 今日任务 🎯
              </h2>
              <span className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-base font-extrabold text-white shadow-lg animate-pulse">
                {completedTasks}/{totalTasks}
              </span>
              <Button
                onClick={refreshTasks}
                variant="outline"
                size="sm"
                className="ml-auto flex items-center gap-2"
                title="刷新任务"
                disabled={isGeneratingTasks}
              >
                {isGeneratingTasks ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span>{isGeneratingTasks ? "生成中..." : "刷新任务"}</span>
              </Button>
            </div>

            <div className="space-y-3">
              {tasks.map((task) => {
                const DifficultyIcon = getDifficultyIcon(task.difficulty)

                return (
                  <Card
                    key={task.id}
                    className={`border-4 transition-all duration-300 hover:scale-[1.03] rounded-3xl ${
                      task.completed
                        ? "border-green-500 bg-gradient-to-br from-green-100 to-emerald-100 shadow-2xl shadow-green-300"
                        : "border-blue-400 bg-gradient-to-br from-white via-blue-50 to-cyan-50 shadow-2xl hover:border-blue-500 hover:shadow-blue-300"
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon with bright background - 儿童风格 */}
                        <div className={`mt-1 rounded-2xl p-3 shadow-lg ${task.completed ? "bg-gradient-to-br from-green-300 to-emerald-300" : "bg-gradient-to-br from-blue-300 to-cyan-300"}`}>
                          <BookOpen className={`h-8 w-8 ${task.completed ? "text-green-700" : "text-blue-600"}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3
                            className={`mb-2 text-xl font-extrabold leading-relaxed ${
                              task.completed ? "text-green-700 line-through" : "text-gray-800 dark:text-gray-100"
                            }`}
                          >
                            {task.text}
                          </h3>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Difficulty Badge */}
                            <span
                              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${getDifficultyColor(task.difficulty)}`}
                            >
                              <DifficultyIcon className="h-3 w-3" />
                              {task.difficulty}
                            </span>

                            {/* Rewards with darker text */}
                            <div className="flex items-center gap-1 text-sm font-bold text-yellow-600">
                              <Coins className="h-4 w-4" />+{task.coins} 金币
                            </div>
                          </div>
                        </div>

                        {/* Complete Button - 儿童风格 */}
                        <Button
                          onClick={() => toggleTask(task.id)}
                          size="lg"
                          className={`h-auto px-8 py-4 text-lg font-extrabold shadow-2xl transition-all rounded-2xl ${
                            task.completed
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-2 border-green-600"
                              : "bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 hover:from-blue-600 hover:via-cyan-600 hover:to-green-600 text-white border-2 border-blue-600"
                          }`}
                        >
                          {task.completed ? (
                            <>
                              <Zap className="mr-2 h-6 w-6" />
                              ✅ 已完成
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-5 w-5" />
                              🎯 完成任务
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Progress Summary with white background */}
            <Card className="mt-6 border-2 border-orange-400 bg-white dark:bg-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">今日完成进度</p>
                    <p className="text-4xl font-bold text-gray-800">{progressPercent}%</p>
                  </div>
                  <div className="relative">
                    <svg className="h-24 w-24 -rotate-90 transform">
                      <circle
                        cx="50%"
                        cy="50%"
                        r="40%"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50%"
                        cy="50%"
                        r="40%"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercent / 100)}`}
                        strokeLinecap="round"
                        className="text-orange-500 transition-all duration-500"
                      />
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 lg:w-72">
            {/* Rewards Shop with white background */}
            <Card className="border-2 border-orange-400 bg-white dark:bg-gray-800 shadow-2xl">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-orange-500" />
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">奖励商店</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPurchasedItems(true)}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>我的商品</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {shopItems.slice(0, 3).map((item) => {
                    const ItemIcon = item.icon
                    const isPurchased = purchasedItems.includes(item.id)
                    const canAfford = goldCoins >= item.cost

                    return (
                      <div
                        key={item.id}
                        // Shop Item with bright background
                        className={`rounded-lg border p-3 ${
                          isPurchased
                            ? "border-green-400 bg-green-50"
                            : canAfford
                              ? "border-orange-300 bg-orange-50"
                              : "border-gray-300 bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <ItemIcon className={`h-5 w-5 ${item.color}`} />
                          <div className="flex-1">
                            <p
                              className={`text-sm font-semibold ${isPurchased ? "text-gray-500 line-through" : "text-gray-800"}`}
                            >
                              {item.name}
                            </p>
                            <p className="flex items-center gap-1 text-xs text-yellow-600">
                              <Coins className="h-3 w-3" />
                              {item.cost}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Button
                  onClick={() => setShowShop(true)}
                  className="mt-4 w-full bg-gradient-to-r from-blue-500 to-cyan-500 font-bold text-white hover:from-blue-600 hover:to-cyan-600"
                >
                  查看全部
                </Button>
              </CardContent>
            </Card>

            <Button
              onClick={() => setShowAITutor(true)}
              size="lg"
              className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 py-10 text-white shadow-2xl transition-all hover:scale-105 hover:from-blue-600 hover:via-cyan-600 hover:to-green-600 rounded-3xl border-4 border-blue-300"
            >
              <div className="flex flex-col items-center gap-3">
                <MessageCircle className="h-12 w-12 transition-transform group-hover:scale-125 animate-bounce" />
                <span className="text-2xl font-extrabold">🤖 召唤AI导师 🤖</span>
                <span className="text-sm font-bold text-blue-100">作业辅导小助手</span>
              </div>
              <div className="absolute inset-0 -z-10 animate-pulse bg-gradient-to-r from-blue-400/30 via-cyan-400/30 to-green-400/30"></div>
            </Button>
          </div>
        </div>
      </div>

      {/* Shop Modal with white background */}
      {showShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-auto border-2 border-orange-400 bg-white shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-8 w-8 text-orange-500" />
                  <h2 className="text-3xl font-bold text-gray-800">奖励商店</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowShop(false)}
                  className="h-10 w-10 text-gray-800 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Gold Coins Display - 儿童风格 */}
              <div className="mb-6 rounded-3xl bg-gradient-to-br from-yellow-200 via-orange-200 to-yellow-200 p-6 text-center border-4 border-yellow-300 shadow-xl">
                <p className="text-lg font-extrabold text-yellow-700 mb-2">💰 我的金币 💰</p>
                <p className="flex items-center justify-center gap-3 text-5xl font-extrabold text-yellow-600">
                  <Coins className="h-10 w-10 animate-bounce" />
                  {goldCoins.toLocaleString()}
                </p>
              </div>

              <div className="space-y-3">
                {shopItems.map((item) => {
                  const isPurchased = purchasedItems.includes(item.id)
                  const canAfford = goldCoins >= item.cost
                  const ItemIcon = item.icon

                  return (
                    <div
                      key={item.id}
                      // Shop Item List with bright background
                      className={`flex items-center justify-between rounded-xl border-2 p-4 transition-all ${
                        isPurchased
                          ? "border-green-400 bg-green-50"
                          : canAfford
                            ? "border-orange-300 bg-orange-50 hover:border-orange-400"
                            : "border-gray-300 bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <ItemIcon className={`h-10 w-10 ${item.color}`} />
                        <div>
                          <p
                            className={`text-lg font-semibold ${isPurchased ? "line-through text-gray-500" : "text-gray-800"}`}
                          >
                            {item.name}
                          </p>
                          <p className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                            <Coins className="h-4 w-4" />
                            {item.cost} 金币
                          </p>
                        </div>
                      </div>
                      <Button
                        disabled={!canAfford || isPurchased}
                        onClick={() => setShowPurchaseConfirm({ itemId: item.id, itemName: item.name, cost: item.cost })}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 font-extrabold text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 rounded-xl text-base px-6 py-3 shadow-lg"
                      >
                        {isPurchased ? "✅ 今日已兑换" : canAfford ? "🛒 立即兑换" : "💰 金币不足"}
                      </Button>
                    </div>
                  )
                })}
              </div>

              <p className="mt-6 text-center text-sm text-orange-600">完成更多任务来赚取金币解锁奖励！</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Tutor Modal with white background */}
      {showAITutor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-cyan-400 bg-white dark:bg-gray-800 shadow-2xl">
            <CardContent className="p-6 flex flex-col flex-1 overflow-hidden">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-8 w-8 text-cyan-500" />
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">AI学习助手</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAITutor(false)
                    setChatMessages([])
                    setChatInput("")
                  }}
                  className="h-10 w-10 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] max-h-[400px]">
                {chatMessages.length === 0 ? (
                  <div className="rounded-xl bg-cyan-50 dark:bg-cyan-900/20 p-6 text-center">
                    <Sparkles className="mx-auto mb-4 h-16 w-16 text-cyan-500" />
                    <p className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">你好，小英雄！</p>
                    <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                      我是你的AI学习助手，随时准备帮助你解答作业问题、讲解难题，陪伴你的学习之旅！
                    </p>
                    <div className="mt-6 space-y-3">
                      <Button
                        onClick={() => setChatInput("我想问数学问题")}
                        className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        数学作业辅导
                      </Button>
                      <Button
                        onClick={() => setChatInput("我想问语文问题")}
                        className="w-full justify-start bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
                      >
                        <Star className="mr-2 h-5 w-5" />
                        语文阅读理解
                      </Button>
                      <Button
                        onClick={() => setChatInput("我想问科学问题")}
                        className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                      >
                        <Zap className="mr-2 h-5 w-5" />
                        科学实验指导
                      </Button>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-cyan-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendChatMessage()}
                  placeholder="输入你的问题..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isChatting}
                />
                <Button
                  onClick={sendChatMessage}
                  disabled={!chatInput.trim() || isChatting}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  {isChatting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-md border-2 border-orange-400 bg-white dark:bg-gray-800 shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">确认购买</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPurchaseConfirm(null)}
                  className="h-10 w-10 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="mb-6 rounded-3xl bg-gradient-to-br from-blue-100 via-cyan-100 to-green-100 dark:from-blue-900/30 dark:via-cyan-900/30 dark:to-green-900/30 p-8 text-center border-4 border-blue-300 shadow-xl">
                <Gift className="mx-auto mb-4 h-20 w-20 text-blue-500 animate-bounce" />
                <p className="mb-3 text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                  🎁 {showPurchaseConfirm.itemName} 🎁
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  需要花费 <span className="font-extrabold text-2xl text-orange-600 dark:text-orange-400">{showPurchaseConfirm.cost}</span> 金币
                </p>
                <p className="text-base text-gray-600 dark:text-gray-400">
                  当前金币: <span className="font-extrabold text-xl text-yellow-600 dark:text-yellow-400">{goldCoins}</span>
                </p>
                <p className="mt-3 text-sm text-blue-600 dark:text-blue-400 font-bold">
                  💡 每个商品每天只能兑换一次，明天可以再次兑换哦！
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPurchaseConfirm(null)}
                  className="flex-1 rounded-xl border-2 border-gray-300 font-extrabold text-base py-3"
                >
                  ❌ 取消
                </Button>
                <Button
                  onClick={() => purchaseItem(showPurchaseConfirm.itemId, showPurchaseConfirm.cost, showPurchaseConfirm.itemName)}
                  className="flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 font-extrabold text-white hover:from-blue-600 hover:via-cyan-600 hover:to-green-600 rounded-xl text-base py-3 shadow-lg"
                >
                  ✅ 确认兑换
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Purchased Items Modal */}
      {showPurchasedItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-auto border-2 border-green-400 bg-white dark:bg-gray-800 shadow-2xl">
            <CardContent className="p-8">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-8 w-8 text-green-500" />
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">我的商品</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPurchasedItems(false)}
                  className="h-10 w-10 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              {allPurchasedItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">还没有购买任何商品</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                    完成更多任务来赚取金币，然后在商店中购买奖励吧！
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allPurchasedItems.map((purchasedItem) => {
                    const shopItem = shopItems.find(item => item.id === purchasedItem.item_id)
                    if (!shopItem) return null
                    const ItemIcon = shopItem.icon
                    return (
                      <div
                        key={purchasedItem.item_id}
                        className="flex items-center justify-between rounded-3xl border-4 border-green-400 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 p-5 shadow-xl"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-2xl bg-white dark:bg-gray-700 p-3 shadow-lg">
                            <ItemIcon className={`h-12 w-12 ${shopItem.color}`} />
                          </div>
                          <div>
                            <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mb-1">
                              {purchasedItem.item_name}
                            </p>
                            <p className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-300">
                              <CheckCircle2 className="h-5 w-5 text-green-500 animate-pulse" />
                              <span className="font-bold">已兑换</span>
                              <span className="font-extrabold text-2xl text-green-600 dark:text-green-400">{purchasedItem.count}</span>
                              <span className="font-bold">次</span>
                            </p>
                          </div>
                        </div>
                      </div>
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
