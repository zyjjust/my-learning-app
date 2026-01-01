"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

interface PetCompanionProps {
    level: number
    streak: number
    tasksCompletedToday: number
}

// Pet Stages configuration
const PET_STAGES = [
    { minLevel: 0, maxLevel: 3, icon: "🥚", name: "神秘蛋", desc: "正在孵化中..." },
    { minLevel: 4, maxLevel: 9, icon: "🐣", name: "小黄鸡", desc: "刚刚破壳而出！" },
    { minLevel: 10, maxLevel: 19, icon: "🐥", name: "活泼小鸟", desc: "正在学习飞翔！" },
    { minLevel: 20, maxLevel: 29, icon: "🦅", name: "勇敢之鹰", desc: "翱翔天际！" },
    { minLevel: 30, maxLevel: 999, icon: "🦄", name: "传说独角兽", desc: "智慧的象征！" },
]

export function PetCompanion({ level, streak, tasksCompletedToday }: PetCompanionProps) {
    const [mood, setMood] = useState<'sleeping' | 'neutral' | 'happy' | 'excited'>('neutral')
    const [currentStage, setCurrentStage] = useState(PET_STAGES[0])
    const [showSpeech, setShowSpeech] = useState(false)
    const [speechText, setSpeechText] = useState("")

    // Determine Pet Stage
    useEffect(() => {
        const stage = PET_STAGES.find(s => level >= s.minLevel && level <= s.maxLevel) || PET_STAGES[0]
        setCurrentStage(stage)
    }, [level])

    // Determine Mood
    useEffect(() => {
        const hour = new Date().getHours()

        if (tasksCompletedToday > 0) {
            setMood('happy')
        } else if (hour < 7 || hour > 21) {
            setMood('sleeping')
        } else if (streak > 2) {
            setMood('excited')
        } else {
            setMood('neutral')
        }
    }, [tasksCompletedToday, streak])

    // Random Speech
    const handleInteraction = () => {
        if (mood === 'sleeping') {
            setSpeechText("Zzz...")
            setShowSpeech(true)
            setTimeout(() => setShowSpeech(false), 2000)
            return
        }

        const messages = [
            "一起加油！",
            "你好呀！",
            `哇！你已经${level}级了！`,
            "今天要学什么呢？",
            "我是你最好的朋友！"
        ]
        const randomMsg = messages[Math.floor(Math.random() * messages.length)]

        setSpeechText(randomMsg)
        setShowSpeech(true)

        // Bounce effect
        setMood('excited')
        setTimeout(() => {
            setMood(tasksCompletedToday > 0 ? 'happy' : 'neutral')
            setShowSpeech(false)
        }, 2000)

        // Mini confetti
        confetti({
            particleCount: 15,
            spread: 30,
            origin: { y: 0.8 },
            colors: ['#FFE082', '#FFD54F'] // Yellow feathers/glitter
        })
    }

    // Animation variants
    const variants = {
        sleeping: { scale: 0.9, rotate: [0, 5, 0, -5, 0], transition: { repeat: Infinity, duration: 3 } },
        neutral: { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } },
        happy: { scale: [1, 1.1, 1], rotate: [0, 10, -10, 0], transition: { repeat: Infinity, duration: 1 } },
        excited: { y: [0, -20, 0], scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 0.5 } }
    }

    return (
        <div className="relative group cursor-pointer" onClick={handleInteraction}>
            {/* Halo/Background Effect */}
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl group-hover:bg-yellow-400/40 transition-all duration-500" />

            {/* Speech Bubble */}
            <AnimatePresence>
                {showSpeech && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.8 }}
                        animate={{ opacity: 1, y: -40, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 bg-white rounded-2xl p-3 shadow-lg border-2 border-yellow-400 z-10 text-center"
                    >
                        <p className="text-sm font-bold text-gray-700">{speechText}</p>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 bg-white border-br-2 border-yellow-400"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pet Character */}
            <motion.div
                variants={variants}
                animate={mood}
                className="relative text-7xl md:text-8xl drop-shadow-xl select-none"
            >
                {currentStage.icon}
            </motion.div>

            {/* Status Indicators */}
            {mood === 'sleeping' && (
                <span className="absolute top-0 right-0 text-2xl animate-pulse">💤</span>
            )}
            {mood === 'happy' && (
                <span className="absolute bottom-0 right-0 text-2xl animate-bounce">❤️</span>
            )}

            {/* Name Tag */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/90 px-3 py-1 rounded-full shadow-md border-b-4 border-gray-200 whitespace-nowrap">
                <p className="text-xs font-bold text-gray-600">{currentStage.name}</p>
            </div>
        </div>
    )
}
