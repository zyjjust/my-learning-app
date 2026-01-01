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
  Volume2,
  Play,
  Pause,
  Mic,
  MicOff,
  Edit3,
} from "lucide-react"
import { PetCompanion } from "@/components/PetCompanion"
import { JourneyMap } from "@/components/JourneyMap"

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
    // 不传递固定的prompt，让后端API生成随机的任务请求
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "generate-tasks",
        // 传递时间戳作为额外的随机性来源
        timestamp: Date.now(),
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
  const [isDataLoaded, setIsDataLoaded] = useState(false) // 标记数据是否已从数据库加载
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

  // 语音讲故事相关状态
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [currentStory, setCurrentStory] = useState<string | null>(null)
  const [isPlayingStory, setIsPlayingStory] = useState(false)

  // 语音输入相关状态
  const [isListening, setIsListening] = useState(false)
  const [storyPrompt, setStoryPrompt] = useState("")
  const [showStoryInput, setShowStoryInput] = useState(false)
  const recognitionRef = useRef<any>(null)

  // 加载用户数据
  useEffect(() => {
    if (user) {
      loadUserData()
    } else {
      // 用户登出时重置数据加载状态
      setIsDataLoaded(false)
      setTotalXP(0)
      setGoldCoins(0)
      setLevel(1)
      setCurrentLevelXP(0)
      setStreak(0)
      console.log("用户登出，重置所有数据状态")
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

    const interval: any = setInterval(function () {
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
        // 确保total_xp是数字类型，防止字符串拼接问题
        const totalXPValue = typeof data.total_xp === 'number' ? data.total_xp : parseInt(String(data.total_xp || 0), 10) || 0
        const goldCoinsValue = typeof data.gold_coins === 'number' ? data.gold_coins : parseInt(String(data.gold_coins || 0), 10) || 0

        setTotalXP(totalXPValue)
        console.log("✅ 从数据库加载用户数据:", {
          total_xp: totalXPValue,
          total_xp_raw: data.total_xp,
          total_xp_type: typeof data.total_xp,
          gold_coins: goldCoinsValue,
          gold_coins_raw: data.gold_coins,
          gold_coins_type: typeof data.gold_coins,
          level: data.level,
          current_xp: data.current_xp,
          streak: data.streak,
          user_id: user.id
        })

        // 数据一致性检查：如果金币大于累计积分，说明数据不一致
        // 这种情况可能发生在历史数据迁移或数据修复时
        if (goldCoinsValue > totalXPValue && totalXPValue > 0) {
          console.warn("⚠️ 数据不一致：金币余额大于累计积分", {
            累计积分: totalXPValue,
            金币余额: goldCoinsValue,
            差值: goldCoinsValue - totalXPValue
          })
          // 可以选择：1) 将金币调整为累计积分 2) 将累计积分调整为金币
          // 这里我们选择将金币调整为累计积分（因为累计积分是更准确的记录）
          // 但考虑到用户可能已经兑换过商品，我们只记录警告，不自动修复
          console.warn("⚠️ 建议：如果用户没有兑换过商品，金币应该等于累计积分。如果兑换过商品，金币应该小于累计积分。")
        }

        // 如果数据库中的total_xp为null或undefined，初始化为0并保存
        if (data.total_xp === null || data.total_xp === undefined) {
          console.warn("⚠️ 数据库中的total_xp为null/undefined，初始化为0并保存")
          setTotalXP(0)
          // 立即保存初始值
          setTimeout(() => {
            syncUserData()
          }, 500)
        }

        // 根据累计积分计算等级和称号
        const { level: calculatedLevel, title: calculatedTitle, currentXP } = calculateLevelAndTitle(totalXPValue)
        setLevel(calculatedLevel)
        setCurrentLevelXP(currentXP)
        setTitle(calculatedTitle)

        // 确保gold_coins是数字类型（已在上面设置）
        setGoldCoins(goldCoinsValue)
        console.log("从数据库加载金币:", goldCoinsValue, "类型:", typeof goldCoinsValue)
        if (data.avatar_url) {
          setAvatarUrl(data.avatar_url)
        }
        if (data.background_image_url) {
          setBackgroundImageUrl(data.background_image_url)
          localStorage.setItem('backgroundImageUrl', data.background_image_url)
        }

        // 处理连续登录天数（确保streak是数字类型）
        const streakValue = typeof data.streak === 'number' ? data.streak : parseInt(String(data.streak || 0), 10) || 0
        await updateLoginStreak(data.last_login_date, streakValue)

        // 检查每日宝箱状态
        checkChestStatus(data.last_chest_date)

        // 加载已兑换商品
        await loadPurchasedItems()
        await loadAllPurchasedItems()

        // 标记数据已加载完成
        setIsDataLoaded(true)
        console.log("✅ 用户数据加载完成，isDataLoaded = true")
      } else {
        // 没有数据，也标记为已加载（新用户）
        setIsDataLoaded(true)
        console.log("✅ 新用户，初始化数据，isDataLoaded = true")
      }
    } catch (error) {
      console.error("Error in loadUserData:", error)
      // 加载失败也标记为已加载，避免阻塞
      setIsDataLoaded(true)
    }
  }

  // 检查每日宝箱是否可以开启
  const checkChestStatus = (lastChestDate: string | null) => {
    if (!lastChestDate) {
      // 从未开启过宝箱，可以开启
      setCanOpenChest(true)
      return
    }

    const today = new Date().toISOString().split('T')[0]
    const lastDate = new Date(lastChestDate).toISOString().split('T')[0]

    // 如果上次开启日期不是今天，则可以开启
    setCanOpenChest(today !== lastDate)
  }

  // 开启每日宝箱
  const openDailyChest = async () => {
    if (!user || !canOpenChest || isOpeningChest) return

    setIsOpeningChest(true)

    // 生成随机积分（10-50分）
    const reward = Math.floor(Math.random() * 41) + 10 // 10-50

    // 播放音效
    playSound('coin')

    // 延迟显示奖励（模拟开箱动画）
    setTimeout(async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        // 确保使用数字类型进行计算
        const currentTotalXP = typeof totalXP === 'number' ? totalXP : parseInt(String(totalXP || 0), 10)
        const currentGoldCoins = typeof goldCoins === 'number' ? goldCoins : parseInt(String(goldCoins || 0), 10)
        const rewardValue = typeof reward === 'number' ? reward : parseInt(String(reward || 0), 10)

        const newTotalXP = currentTotalXP + rewardValue
        const newGoldCoins = currentGoldCoins + rewardValue

        // 更新数据库（确保所有值都是数字类型）
        const levelData = calculateLevelAndTitle(newTotalXP)
        const updateData = {
          total_xp: typeof newTotalXP === 'number' ? newTotalXP : parseInt(String(newTotalXP || 0), 10),
          gold_coins: typeof newGoldCoins === 'number' ? newGoldCoins : parseInt(String(newGoldCoins || 0), 10),
          last_chest_date: today,
          level: typeof levelData.level === 'number' ? levelData.level : parseInt(String(levelData.level || 1), 10),
          current_xp: typeof levelData.currentXP === 'number' ? levelData.currentXP : parseInt(String(levelData.currentXP || 0), 10),
        }

        const { error, data: updateResult } = await supabase
          .from("users")
          .update(updateData)
          .eq("id", user.id)
          .select()

        if (error) {
          console.error("Error updating chest reward:", error)
          alert(`保存宝箱奖励失败：${error.message || "未知错误"}`)
          setIsOpeningChest(false)
          return
        }

        // 验证数据是否成功保存
        if (updateResult && updateResult.length > 0) {
          console.log("宝箱奖励已成功保存到数据库:", {
            total_xp: updateResult[0].total_xp,
            gold_coins: updateResult[0].gold_coins
          })
        }

        // 更新本地状态
        setTotalXP(newTotalXP)
        setGoldCoins(newGoldCoins)
        setCanOpenChest(false)

        const { level: newLevel, title: newTitle, currentXP: newCurrentXP } = calculateLevelAndTitle(newTotalXP)
        setLevel(newLevel)
        setCurrentLevelXP(newCurrentXP)
        setTitle(newTitle)

        // 显示奖励
        setShowChestReward({ reward })

        // 触发五彩纸屑特效
        triggerConfetti()

        // 检查是否升级
        if (newLevel > level) {
          playSound('levelup')
          setTimeout(() => {
            alert(`🎉 恭喜升级！你现在是 ${newTitle}（等级 ${newLevel}）！`)
          }, 500)
        }
      } catch (error) {
        console.error("Error opening chest:", error)
      } finally {
        setIsOpeningChest(false)
      }
    }, 800) // 开箱动画延迟
  }

  // 更新累计登录天数（每天登录+1，不管是否连续）
  const updateLoginStreak = async (lastLoginDate: string | null, currentStreak: number) => {
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    // 确保currentStreak是数字类型
    const streakValue = typeof currentStreak === 'number' ? currentStreak : parseInt(String(currentStreak || 0), 10) || 0

    let newStreak = streakValue

    if (!lastLoginDate) {
      // 首次登录，设置为1天
      newStreak = 1
    } else if (lastLoginDate === today) {
      // 今天已登录过（可能是刷新页面），保持当前天数
      // 但如果当前天数是0或null，说明是首次登录，应该设置为1
      newStreak = streakValue > 0 ? streakValue : 1
    } else {
      // 不是今天登录的，说明是新的一天，累计天数+1
      newStreak = streakValue + 1
    }

    setStreak(newStreak)

    // 更新数据库（只在日期变化时更新，或者首次登录时）
    if (!lastLoginDate || lastLoginDate !== today) {
      const { error } = await supabase
        .from("users")
        .update({
          streak: newStreak,
          last_login_date: today,
        })
        .eq("id", user.id)

      if (error) {
        console.error("Error updating login days:", error)
      } else {
        console.log(`累计登录天数已更新: ${newStreak}天`)
      }
    }
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
    if (!user || !user.id) {
      console.log("syncUserData: 用户未登录，跳过同步")
      return
    }

    try {
      // 确保所有值都是数字类型，即使为0也要保存
      const updateData = {
        level: typeof level === 'number' ? level : parseInt(String(level || 1), 10),
        current_xp: typeof currentLevelXP === 'number' ? currentLevelXP : parseInt(String(currentLevelXP || 0), 10),
        total_xp: typeof totalXP === 'number' ? totalXP : parseInt(String(totalXP || 0), 10),
        gold_coins: typeof goldCoins === 'number' ? goldCoins : parseInt(String(goldCoins || 0), 10),
        streak: typeof streak === 'number' ? streak : parseInt(String(streak || 0), 10),
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      }

      console.log("准备同步用户数据到数据库:", updateData)
      console.log("用户ID:", user.id)

      const { error, data } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id)
        .select()

      if (error) {
        console.error("❌ 同步用户数据失败:", error)
        console.error("失败的数据:", updateData)
        console.error("错误详情:", JSON.stringify(error, null, 2))
        // 不抛出错误，避免影响用户体验，但记录详细日志
      } else if (data && data.length > 0) {
        const savedData = data[0]
        console.log("✅ 用户数据已同步到数据库:", {
          total_xp: savedData.total_xp,
          total_xp_type: typeof savedData.total_xp,
          gold_coins: savedData.gold_coins,
          level: savedData.level,
          current_xp: savedData.current_xp,
          user_id: user.id
        })

        // 验证保存的数据
        if (savedData.total_xp !== updateData.total_xp) {
          console.warn("⚠️ 同步的积分与预期不一致:", {
            预期: updateData.total_xp,
            实际: savedData.total_xp,
            预期类型: typeof updateData.total_xp,
            实际类型: typeof savedData.total_xp
          })
        } else {
          console.log("✅ 积分验证通过，数据已正确保存")
        }

        // 更新本地用户信息
        if (setUser) {
          setUser({
            ...user,
            level: updateData.level,
            current_xp: updateData.current_xp,
            gold_coins: updateData.gold_coins,
            streak: updateData.streak,
            avatar_url: avatarUrl || undefined,
          })
        }
      } else {
        console.warn("⚠️ 数据库更新成功但没有返回数据，可能用户不存在")
      }
    } catch (error: any) {
      console.error("Error in syncUserData:", error)
      console.error("错误堆栈:", error.stack)
    }
  }

  // 当数据变化时同步到数据库
  useEffect(() => {
    // 必须确保：1) 用户已登录 2) 数据已从数据库加载完成
    // 这样可以防止用初始值(0)覆盖数据库中的真实数据
    if (user && user.id && isDataLoaded) {
      console.log("检测到数据变化，准备同步到数据库:", {
        level,
        totalXP,
        goldCoins,
        currentLevelXP,
        streak,
        isDataLoaded
      })

      const timer = setTimeout(() => {
        syncUserData()
      }, 1000) // 防抖，1秒后同步

      return () => clearTimeout(timer)
    } else if (user && user.id && !isDataLoaded) {
      console.log("数据尚未从数据库加载，跳过同步:", {
        level,
        totalXP,
        goldCoins,
        isDataLoaded
      })
    }
  }, [user, level, currentLevelXP, totalXP, goldCoins, streak, avatarUrl, isDataLoaded])

  // 在组件卸载或用户登出前保存数据
  useEffect(() => {
    return () => {
      // 组件卸载时立即同步数据（不等待防抖）
      if (user && user.id) {
        console.log("组件卸载，立即同步数据到数据库")
        syncUserData()
      }
    }
  }, []) // 只在组件卸载时执行

  // 从localStorage加载头像（兼容旧数据）
  useEffect(() => {
    if (!user) {
      const savedAvatar = localStorage.getItem("avatarUrl")
      if (savedAvatar) {
        setAvatarUrl(savedAvatar)
      }
    }
  }, [user])

  // 在用户登录时检查是否需要生成任务（每天只生成一次）
  useEffect(() => {
    if (user) {
      // 使用 setTimeout 确保在 loadUserData 完成后再检查任务
      const timer = setTimeout(() => {
        checkAndLoadTasks()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user])

  // 检查是否需要生成任务（每天只生成一次）
  const checkAndLoadTasks = async () => {
    if (!user) return

    try {
      // 从数据库获取上次生成任务的日期
      const { data, error } = await supabase
        .from("users")
        .select("last_tasks_date")
        .eq("id", user.id)
        .single()

      const today = new Date().toISOString().split('T')[0]
      const lastTasksDate = data?.last_tasks_date

      // 如果字段不存在或今天还没有生成任务，则生成（包括AI任务）
      if (error || !lastTasksDate || lastTasksDate !== today) {
        await loadTasks(true) // 传入true表示需要更新数据库
      } else {
        // 如果今天已生成，从localStorage恢复任务状态
        const savedTasks = localStorage.getItem(`tasks_${user.id}_${today}`)
        if (savedTasks) {
          try {
            const parsedTasks = JSON.parse(savedTasks)
            // 确保任务数量正确（应该有5个任务：2个固定+3个AI）
            if (parsedTasks && parsedTasks.length >= 5) {
              setTasks(parsedTasks)
            } else {
              // 如果任务数量不对，重新生成
              console.log("任务数量不正确，重新生成")
              await loadTasks(true)
            }
          } catch (parseError) {
            console.error("解析任务失败，重新生成:", parseError)
            // 解析失败，重新生成
            await loadTasks(true)
          }
        } else {
          // localStorage中没有任务，重新生成
          console.log("localStorage中没有任务，重新生成")
          await loadTasks(true)
        }
      }
    } catch (error) {
      console.error("Error checking tasks:", error)
      // 出错时也生成任务
      await loadTasks(true)
    }
  }

  // 加载任务：2个固定任务（课后作业、运动打卡）+ 3个AI生成任务
  const loadTasks = async (updateDate: boolean = false) => {
    setIsGeneratingTasks(true)
    try {
      // 生成2个固定任务：课后作业、运动打卡
      const fixedTasks = generateFixedTasks()
      // 调用通义千问API生成3个任务
      const aiTasks = await generateAITasks()
      // 组合任务：固定任务在前，AI任务在后
      const allTasks = [...fixedTasks, ...aiTasks]

      // 先保存任务到localStorage（用于恢复状态）
      const today = new Date().toISOString().split('T')[0]
      if (user) {
        localStorage.setItem(`tasks_${user.id}_${today}`, JSON.stringify(allTasks))
      }

      // 设置任务状态（在保存localStorage之后）
      setTasks(allTasks)

      // 如果需要更新日期，更新数据库（在设置任务之后，避免被覆盖）
      if (updateDate && user) {
        // 立即更新数据库，但确保任务已经设置
        const updateResult = await supabase
          .from("users")
          .update({ last_tasks_date: today })
          .eq("id", user.id)

        if (updateResult.error) {
          console.error("Error updating last_tasks_date:", updateResult.error)
        }
      }
    } catch (error) {
      console.error("Error loading tasks:", error)
      // 如果AI任务生成失败，至少显示固定任务
      const fixedTasks = generateFixedTasks()
      setTasks(fixedTasks)
    } finally {
      setIsGeneratingTasks(false)
    }
  }

  // 获取AI任务（id >= 3 的任务）
  const getAITasks = () => tasks.filter((t) => t.id >= 3)

  // 检查是否所有AI任务都已完成
  const allAITasksCompleted = () => {
    const aiTasks = getAITasks()
    return aiTasks.length > 0 && aiTasks.every((t) => t.completed)
  }

  // 获取未完成的AI任务数量
  const getUncompletedAITasksCount = () => {
    return getAITasks().filter((t) => !t.completed).length
  }

  // 刷新任务函数：只刷新未完成的AI任务，固定任务和已完成的AI任务保持不变
  const refreshTasks = async () => {
    // 如果所有AI任务都已完成，不允许刷新
    if (allAITasksCompleted()) {
      return
    }

    setIsGeneratingTasks(true)
    try {
      // 获取当前未完成的AI任务数量
      const uncompletedCount = getUncompletedAITasksCount()

      // 保持固定任务和已完成的AI任务不变
      const fixedTasks = tasks.filter((t) => t.id <= 2)
      const completedAITasks = tasks.filter((t) => t.id >= 3 && t.completed)

      // 只生成需要的数量的新AI任务
      const newAITasks = await generateAITasks()
      // 取出需要的数量，并重新分配ID
      const neededNewTasks = newAITasks.slice(0, uncompletedCount).map((task, index) => {
        // 找到未被使用的ID（排除已完成任务的ID）
        const usedIds = completedAITasks.map((t) => t.id)
        let newId = 3
        while (usedIds.includes(newId) || index > 0 && newId <= 2 + index) {
          newId++
        }
        // 简单方式：按顺序分配ID 3, 4, 5，跳过已完成任务的ID
        const availableIds = [3, 4, 5].filter((id) => !usedIds.includes(id))
        return {
          ...task,
          id: availableIds[index] || 3 + index,
        }
      })

      // 组合所有任务
      const updatedTasks = [...fixedTasks, ...completedAITasks, ...neededNewTasks]
      // 按ID排序
      updatedTasks.sort((a, b) => a.id - b.id)

      setTasks(updatedTasks)

      // 保存到localStorage
      if (user) {
        const today = new Date().toISOString().split('T')[0]
        localStorage.setItem(`tasks_${user.id}_${today}`, JSON.stringify(updatedTasks))
      }
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
    if (!file) {
      // 重置input，允许再次选择同一文件
      if (event.target) {
        event.target.value = ''
      }
      return
    }

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert("请上传图片文件（JPG、PNG、WebP等格式）")
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("图片大小不能超过10MB，请选择较小的图片")
      event.target.value = ''
      return
    }

    // 显示上传提示
    const uploadMessage = user ? "正在上传背景图..." : "正在处理背景图..."
    console.log(uploadMessage)

    try {
      let imageUrl: string | null = null

      // 优先尝试上传到 Supabase Storage（如果已登录）
      if (user) {
        try {
          const fileExt = file.name.split(".").pop()?.toLowerCase() || 'jpg'
          const fileName = `bg-${user.id}-${Date.now()}.${fileExt}`
          const filePath = `backgrounds/${fileName}`

          // 尝试上传到 Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("backgrounds")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            })

          if (!uploadError && uploadData) {
            // 上传成功，获取公共 URL
            const { data: urlData } = supabase.storage.from("backgrounds").getPublicUrl(filePath)
            if (urlData && urlData.publicUrl) {
              imageUrl = urlData.publicUrl
              console.log("背景图已上传到 Supabase Storage:", imageUrl)
            }
          } else {
            console.warn("Supabase Storage 上传失败，使用 base64 备用方案:", uploadError?.message)
          }
        } catch (storageError) {
          console.warn("Supabase Storage 不可用，使用 base64 备用方案:", storageError)
        }
      }

      // 如果 Storage 上传失败或未登录，使用 base64
      if (!imageUrl) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const result = reader.result as string
            resolve(result)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        console.log("使用 base64 格式保存背景图")
      }

      // 更新状态和本地存储
      if (imageUrl) {
        setBackgroundImageUrl(imageUrl)
        localStorage.setItem('backgroundImageUrl', imageUrl)

        // 保存到数据库（如果已登录）
        if (user) {
          const saveResult = await saveBackgroundToSupabase(imageUrl)
          if (saveResult) {
            alert("背景图已成功更换！")
          }
        } else {
          alert("背景图已成功更换！（未登录状态，仅保存在本地）")
        }
      } else {
        throw new Error("无法处理图片文件")
      }
    } catch (error: any) {
      console.error("Error uploading background:", error)
      alert(`上传背景图失败：${error.message || "未知错误"}。请重试或选择其他图片。`)
    } finally {
      // 重置input，允许再次选择同一文件
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  // 保存背景图到 Supabase 数据库
  const saveBackgroundToSupabase = async (imageUrl: string): Promise<boolean> => {
    if (!user) return false
    try {
      const { error } = await supabase
        .from("users")
        .update({ background_image_url: imageUrl })
        .eq("id", user.id)

      if (error) {
        console.error("Error saving background to database:", error)
        return false
      } else {
        console.log("Background saved successfully to database")
        return true
      }
    } catch (error) {
      console.error("Error saving background to database:", error)
      return false
    }
  }

  // 开始语音输入
  const startListening = () => {
    if (typeof window === 'undefined') return

    // 检查浏览器是否支持语音识别
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert("您的浏览器不支持语音识别功能，请使用 Chrome 或 Edge 浏览器")
      return
    }

    // 创建语音识别实例
    const recognition = new SpeechRecognition()
    recognition.lang = 'zh-CN'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      if (finalTranscript) {
        setStoryPrompt(prev => prev + finalTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error("语音识别错误:", event.error)
      setIsListening(false)
      if (event.error === 'no-speech') {
        // 静默处理无语音错误
      } else if (event.error === 'not-allowed') {
        alert("请允许麦克风权限以使用语音输入功能")
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  // 停止语音输入
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
  }

  // 切换语音输入状态
  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // 生成并播放故事（使用浏览器内置的 Web Speech API）
  const generateAndPlayStory = async (customPrompt?: string) => {
    if (isGeneratingStory || isPlayingStory) return

    setIsGeneratingStory(true)
    setCurrentStory(null)

    // 停止当前播放的语音
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlayingStory(false)

    try {
      // 第一步：生成故事
      const promptToUse = customPrompt || storyPrompt || ""
      const storyResponse = await fetch("/api/ai/story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptToUse }),
      })

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json().catch(() => ({ error: "未知错误" }))
        throw new Error(errorData.error || "生成故事失败")
      }

      const storyData = await storyResponse.json()

      if (storyData.error) {
        throw new Error(storyData.error)
      }

      const story = storyData.story || "抱歉，无法生成故事。"
      setCurrentStory(story)

      // 第二步：使用浏览器内置的 Web Speech API 朗读故事
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(story)

        // 设置中文语音
        utterance.lang = 'zh-CN'
        utterance.rate = 0.9 // 语速稍慢，适合小学生听
        utterance.pitch = 1.1 // 音调稍高，更适合儿童故事

        // 尝试找到中文女声
        const voices = window.speechSynthesis.getVoices()
        const chineseVoice = voices.find(voice =>
          voice.lang.includes('zh') && voice.name.toLowerCase().includes('female')
        ) || voices.find(voice =>
          voice.lang.includes('zh')
        )

        if (chineseVoice) {
          utterance.voice = chineseVoice
        }

        utterance.onstart = () => {
          setIsPlayingStory(true)
        }

        utterance.onend = () => {
          setIsPlayingStory(false)
        }

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event)
          setIsPlayingStory(false)
          // 不显示错误提示，因为语音可能只是被用户停止了
        }

        // 开始朗读
        window.speechSynthesis.speak(utterance)
        setIsPlayingStory(true)
      } else {
        // 如果浏览器不支持语音合成，只显示故事文本
        console.warn("浏览器不支持语音合成功能")
        alert("您的浏览器不支持语音朗读功能，但故事已生成，请阅读下方文字。")
      }
    } catch (error: any) {
      console.error("Error generating or playing story:", error)
      alert(`生成故事失败：${error.message || "未知错误"}`)
      setCurrentStory(null)
    } finally {
      setIsGeneratingStory(false)
    }
  }

  // 停止播放故事
  const stopStory = () => {
    // 停止语音合成
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlayingStory(false)
  }

  // 清理语音资源
  useEffect(() => {
    return () => {
      // 停止语音合成
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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

  // 每日宝箱相关状态
  const [canOpenChest, setCanOpenChest] = useState(false)
  const [isOpeningChest, setIsOpeningChest] = useState(false)
  const [showChestReward, setShowChestReward] = useState<{ reward: number } | null>(null)

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

    // 如果任务已完成，不允许再次点击
    if (task.completed) {
      return
    }

    // 只能标记为完成，不能取消
    const newCompleted: boolean = true
    let newGoldCoins = goldCoins
    let newTotalXP = totalXP
    let levelUp = false
    let calculatedLevel = level
    let calculatedTitle = title

    // 完成任务时增加金币和累计积分（不设上限）
    // 确保使用数字类型进行计算，防止字符串拼接
    const taskCoins = typeof task.coins === 'number' ? task.coins : parseInt(String(task.coins || 0), 10)
    const currentTotalXP = typeof totalXP === 'number' ? totalXP : parseInt(String(totalXP || 0), 10)
    const currentGoldCoins = typeof goldCoins === 'number' ? goldCoins : parseInt(String(goldCoins || 0), 10)

    newGoldCoins = currentGoldCoins + taskCoins
    newTotalXP = currentTotalXP + taskCoins // 累计积分不设上限，可以无限累加

    // 检查是否升级
    const oldLevel = Math.floor(currentTotalXP / 100) + 1
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
          // 确保所有值都是数字类型
          const updateData = {
            gold_coins: typeof newGoldCoins === 'number' ? newGoldCoins : parseInt(String(newGoldCoins || 0), 10),
            total_xp: typeof newTotalXP === 'number' ? newTotalXP : parseInt(String(newTotalXP || 0), 10),
            level: typeof calculatedLevel === 'number' ? calculatedLevel : parseInt(String(calculatedLevel || 1), 10),
            current_xp: typeof levelData.currentXP === 'number' ? levelData.currentXP : parseInt(String(levelData.currentXP || 0), 10)
          }

          console.log("准备更新数据库，数据:", updateData)

          const { error, data: updateResult } = await supabase
            .from("users")
            .update(updateData)
            .eq("id", user.id)
            .select()

          if (error) {
            console.error("Error updating user data:", error)
            console.error("更新失败的数据:", updateData)
            alert(`保存积分失败：${error.message || "未知错误"}。请检查数据库字段是否存在。`)
            // 如果更新失败，回滚
            setGoldCoins(goldCoins)
            setTotalXP(totalXP)
            return
          }

          // 验证数据是否成功保存
          if (updateResult && updateResult.length > 0) {
            const savedData = updateResult[0]
            console.log("✅ 积分已成功保存到数据库:", {
              total_xp: savedData.total_xp,
              total_xp_type: typeof savedData.total_xp,
              gold_coins: savedData.gold_coins,
              level: savedData.level,
              current_xp: savedData.current_xp
            })

            // 验证保存的数据是否与预期一致
            if (savedData.total_xp !== updateData.total_xp) {
              console.warn("⚠️ 保存的积分与预期不一致:", {
                预期: updateData.total_xp,
                实际: savedData.total_xp
              })
            }
          } else {
            console.warn("⚠️ 数据库更新成功但没有返回数据")
          }

          // 保存任务状态到localStorage
          const today = new Date().toISOString().split('T')[0]
          const updatedTasks = tasks.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t))
          localStorage.setItem(`tasks_${user.id}_${today}`, JSON.stringify(updatedTasks))
        } catch (error: any) {
          console.error("Error updating user data:", error)
          alert(`保存积分失败：${error.message || "未知错误"}`)
          // 如果更新失败，回滚
          setGoldCoins(goldCoins)
          setTotalXP(totalXP)
          return
        }
      }
    }

    // 更新任务状态（因为任务只能从未完成变为完成，所以这里总是会更新）
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: newCompleted } : t)))

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
      <div className="flex items-center justify-center min-h-screen bg-background">
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
    <div className="min-h-screen bg-background p-4 md:p-6" style={{ fontFamily: 'Roboto, sans-serif' }}>
      <div className="mx-auto max-w-7xl">
        {/* Google Material Design Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* 等级和积分卡片 - Material Design */}
          <Card className="material-card bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {/* Pet replaces Trophy or sits next to it. Let's make it the main icon */}
                  <div className="scale-50 origin-left -ml-4 -mt-4">
                    <PetCompanion level={level} streak={streak} tasksCompletedToday={tasks.filter(t => t.completed).length} />
                  </div>
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

          {/* 累计登录卡片 - Material Design */}
          <Card className="material-card bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2.5">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">累计登录</p>
                  <p className="text-2xl font-semibold text-gray-900">{streak}天</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 每日宝箱卡片 - Material Design */}
          <Card className="material-card bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={openDailyChest}
                  disabled={!canOpenChest || isOpeningChest}
                  className={`relative rounded-full p-2.5 transition-all duration-300 ${canOpenChest
                      ? "bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 cursor-pointer transform hover:scale-110 animate-pulse"
                      : "bg-gray-100 cursor-not-allowed"
                    }`}
                >
                  <Gift className={`h-5 w-5 ${canOpenChest ? "text-white" : "text-gray-400"}`} />
                  {canOpenChest && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping"></div>
                  )}
                </button>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">每日宝箱</p>
                  {isOpeningChest ? (
                    <p className="text-sm font-semibold text-gray-900">开启中...</p>
                  ) : canOpenChest ? (
                    <p className="text-sm font-semibold text-green-600">点击开启</p>
                  ) : (
                    <p className="text-sm font-semibold text-gray-400">今日已开启</p>
                  )}
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
            {/* 用户信息区域 */}
            <div className="flex items-center gap-2">
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
              {/* 用户名称 */}
              <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                {user?.name || user?.username || "用户"}
              </span>
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

        {/* 冒险地图 */}
        <div className="mb-6 w-full">
          <JourneyMap currentLevel={level} totalLevels={50} />
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
                    className={`material-card bg-white border-0 shadow-sm transition-shadow ${task.completed ? "opacity-60 cursor-not-allowed" : "hover:shadow-md cursor-pointer"
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
                            className={`mb-2 text-sm font-medium leading-snug ${task.completed ? "text-gray-400 line-through" : "text-gray-800"
                              }`}
                          >
                            {task.text}
                          </h3>

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                              {taskType}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                              +{task.coins} 金币
                            </span>
                          </div>
                        </div>

                        {/* 完成按钮 - Material Design Radio Button */}
                        <button
                          onClick={() => !task.completed && toggleTask(task.id)}
                          disabled={task.completed}
                          className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${task.completed
                              ? "border-green-500 bg-green-500 cursor-not-allowed opacity-60"
                              : "border-gray-300 hover:border-gray-400 bg-white cursor-pointer"
                            }`}
                          aria-label={task.completed ? "已完成" : "完成任务"}
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
              className={`mt-4 w-full font-medium rounded-lg shadow-sm ${allAITasksCompleted()
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400"
                }`}
              disabled={isGeneratingTasks || allAITasksCompleted()}
            >
              {isGeneratingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : allAITasksCompleted() ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  今日 AI 任务已全部完成
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  刷新未完成的 AI 任务 ({getUncompletedAITasksCount()})
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
                        className={`material-card bg-white border-0 shadow-sm hover:shadow-md transition-shadow ${isPurchased ? "opacity-60" : ""
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
                                ☆{item.cost} 金币
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
                              {isPurchased ? "今日已兑换" : canAfford ? "立即兑换" : "金币不足"}
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
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setShowStoryInput(!showStoryInput)}
                      size="sm"
                      className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                    >
                      <Edit3 className="mr-1.5 h-3 w-3" />
                      定制故事
                    </Button>
                    <Button
                      onClick={() => isPlayingStory ? stopStory() : generateAndPlayStory()}
                      disabled={isGeneratingStory}
                      size="sm"
                      className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isGeneratingStory ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          生成中...
                        </>
                      ) : isPlayingStory ? (
                        <>
                          <Pause className="mr-1.5 h-3 w-3" />
                          暂停
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-1.5 h-3 w-3" />
                          讲故事
                        </>
                      )}
                    </Button>
                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 border border-green-200">在线</span>
                  </div>
                </div>

                {/* 语音输入故事提示区域 */}
                {showStoryInput && (
                  <div className="mb-4 rounded-lg bg-orange-50 p-4 border border-orange-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">定制你的故事</span>
                      </div>
                      <Button
                        onClick={() => setShowStoryInput(false)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600 mb-3">说出或输入你想听的故事类型和大纲，例如："讲一个关于太空探险的故事，主角是一只勇敢的小猫"</p>

                    <div className="flex gap-2 mb-3">
                      <textarea
                        value={storyPrompt}
                        onChange={(e) => setStoryPrompt(e.target.value)}
                        placeholder="输入故事类型和大纲..."
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        rows={2}
                      />
                      <Button
                        onClick={toggleListening}
                        size="sm"
                        className={`rounded-lg px-3 py-2 ${isListening
                            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                            : 'bg-blue-500 hover:bg-blue-600'
                          } text-white transition-colors`}
                      >
                        {isListening ? (
                          <MicOff className="h-5 w-5" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </Button>
                    </div>

                    {isListening && (
                      <div className="flex items-center gap-2 mb-3 text-sm text-red-600">
                        <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                        正在聆听...请说话
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setStoryPrompt("")
                          stopListening()
                        }}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        清空
                      </Button>
                      <Button
                        onClick={() => {
                          if (storyPrompt.trim()) {
                            generateAndPlayStory(storyPrompt)
                            setShowStoryInput(false)
                          } else {
                            alert("请先输入或说出你想听的故事内容")
                          }
                        }}
                        disabled={isGeneratingStory || !storyPrompt.trim()}
                        size="sm"
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                      >
                        {isGeneratingStory ? (
                          <>
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Volume2 className="mr-1.5 h-3 w-3" />
                            开始讲故事
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* 当前故事显示 */}
                {currentStory && (
                  <div className="mb-4 rounded-lg bg-purple-50 p-4 border-l-4 border-purple-500 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">正在播放故事</span>
                      </div>
                      {isPlayingStory && (
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse"></div>
                          <span className="text-xs text-purple-600">播放中...</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{currentStory}</p>
                  </div>
                )}

                {/* 聊天消息列表 - Material Design */}
                <div className="mb-4 space-y-2 max-h-[300px] overflow-y-auto">
                  {chatMessages.length === 0 && !currentStory ? (
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
                          className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === "user"
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
                <div className="flex items-center gap-3">
                  {/* 右上角显示累计积分 */}
                  <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 border border-blue-200">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">累计积分: {totalXP.toLocaleString()}</span>
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
              </div>

              {/* Gold Coins Display - Material Design */}
              <div className="mb-6 rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-yellow-100 p-1.5">
                      <Coins className="h-5 w-5 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">当前余额（金币）</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-medium text-gray-900">{goldCoins.toLocaleString()}</span>
                    {goldCoins > totalXP && totalXP > 0 && (
                      <span className="text-xs text-orange-600 mt-1">累计积分: {totalXP.toLocaleString()}</span>
                    )}
                  </div>
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
                      className={`material-card bg-white border border-gray-200 ${isPurchased ? "opacity-60" : ""
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
                              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">☆{item.cost} 金币</span>
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
                              className="w-full rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {isPurchased ? "今日已兑换" : canAfford ? "立即兑换" : "金币不足"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <p className="mt-6 text-center text-xs text-gray-500">完成更多任务来赚取金币解锁奖励！</p>
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
                  <Button
                    onClick={() => setShowStoryInput(!showStoryInput)}
                    size="sm"
                    className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors"
                  >
                    <Edit3 className="mr-1.5 h-3 w-3" />
                    定制
                  </Button>
                  <Button
                    onClick={() => isPlayingStory ? stopStory() : generateAndPlayStory()}
                    disabled={isGeneratingStory}
                    size="sm"
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isGeneratingStory ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        生成中...
                      </>
                    ) : isPlayingStory ? (
                      <>
                        <Pause className="mr-1.5 h-3 w-3" />
                        暂停
                      </>
                    ) : (
                      <>
                        <Volume2 className="mr-1.5 h-3 w-3" />
                        讲故事
                      </>
                    )}
                  </Button>
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

              {/* 语音输入故事提示区域（弹窗版） */}
              {showStoryInput && (
                <div className="mb-4 rounded-lg bg-orange-50 p-4 border border-orange-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">定制你的故事</span>
                    </div>
                    <Button
                      onClick={() => setShowStoryInput(false)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">说出或输入你想听的故事类型和大纲</p>

                  <div className="flex gap-2 mb-3">
                    <textarea
                      value={storyPrompt}
                      onChange={(e) => setStoryPrompt(e.target.value)}
                      placeholder="例如：讲一个关于太空探险的故事，主角是一只勇敢的小猫"
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                      rows={2}
                    />
                    <Button
                      onClick={toggleListening}
                      size="sm"
                      className={`rounded-lg px-3 py-2 ${isListening
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                          : 'bg-blue-500 hover:bg-blue-600'
                        } text-white transition-colors`}
                    >
                      {isListening ? (
                        <MicOff className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </Button>
                  </div>

                  {isListening && (
                    <div className="flex items-center gap-2 mb-3 text-sm text-red-600">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                      正在聆听...请说话
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setStoryPrompt("")
                        stopListening()
                      }}
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                    >
                      清空
                    </Button>
                    <Button
                      onClick={() => {
                        if (storyPrompt.trim()) {
                          generateAndPlayStory(storyPrompt)
                          setShowStoryInput(false)
                        } else {
                          alert("请先输入或说出你想听的故事内容")
                        }
                      }}
                      disabled={isGeneratingStory || !storyPrompt.trim()}
                      size="sm"
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs"
                    >
                      {isGeneratingStory ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-1.5 h-3 w-3" />
                          开始讲故事
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* 当前故事显示 */}
              {currentStory && (
                <div className="mb-4 rounded-lg bg-purple-50 p-4 border-l-4 border-purple-500 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">正在播放故事</span>
                    </div>
                    {isPlayingStory && (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse"></div>
                        <span className="text-xs text-purple-600">播放中...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{currentStory}</p>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 min-h-[300px] max-h-[400px]">
                {chatMessages.length === 0 && !currentStory ? (
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
                        className={`max-w-[80%] rounded-lg p-3 ${msg.role === "user"
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

      {/* Daily Chest Reward Modal */}
      {showChestReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="relative w-full max-w-md bg-white shadow-lg animate-in fade-in zoom-in duration-300">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <Gift className="h-20 w-20 text-yellow-500 animate-bounce" />
                    <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-pulse" />
                    <Sparkles className="absolute -bottom-2 -left-2 h-6 w-6 text-orange-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-800">🎉 恭喜获得！</h2>
                <div className="mb-4 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 p-6">
                  <p className="text-sm text-gray-600 mb-2">今日宝箱奖励</p>
                  <p className="text-4xl font-bold text-orange-600">
                    +{showChestReward.reward} 积分
                  </p>
                </div>
                <p className="mb-4 text-sm text-gray-500">
                  积分已自动添加到你的账户中
                </p>
                <Button
                  onClick={() => {
                    setShowChestReward(null)
                    triggerConfetti() // 再次触发特效
                  }}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-3 text-white hover:from-yellow-600 hover:to-orange-600 font-medium shadow-lg"
                >
                  太棒了！
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
                    需要花费 <span className="font-semibold text-lg text-purple-600">{showPurchaseConfirm.cost}</span> 金币
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
                    完成更多任务来赚取金币，然后在商店中兑换奖励吧！
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
