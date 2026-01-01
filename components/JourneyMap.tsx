"use client"

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface JourneyMapProps {
    currentLevel: number
    totalLevels?: number
}

// Generate map nodes positions (simple zig-zag or curve logic)
const generateNodes = (count: number) => {
    return Array.from({ length: count }, (_, i) => {
        const level = i + 1
        // Zig-zag pattern
        // x varies between 20% and 80%
        const x = 50 + 35 * Math.sin(i * 0.8)
        const y = (count - i) * 80 + 50 // Start from bottom up or top down? Let's go Top Down for scrolling 
        // Actually for levels, usually lvl 1 is at bottom? Let's do scroll down to advance. 
        // So lvl 1 is at top.

        return { level, x, y: i * 100 + 50 }
    })
}

export function JourneyMap({ currentLevel, totalLevels = 20 }: JourneyMapProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    // Create a limited window of levels to show based on current level to save rendering
    // Or just render a reasonable chunk. Let's do 50 levels.
    const nodes = generateNodes(totalLevels)
    const pathLength = nodes[nodes.length - 1].y + 100

    // Scroll to current level on mount
    useEffect(() => {
        if (scrollRef.current) {
            // Find current node y
            const currentNode = nodes.find(n => n.level === currentLevel)
            if (currentNode) {
                // Center it
                scrollRef.current.scrollTop = currentNode.y - 150
            }
        }
    }, [currentLevel])

    return (
        <div className="w-full h-full bg-blue-50/50 rounded-3xl border-4 border-blue-200 overflow-hidden relative">
            <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border-2 border-blue-100">
                <h3 className="text-lg font-extrabold text-blue-500">🗺️ 冒险地图</h3>
            </div>

            <div
                ref={scrollRef}
                className="h-[300px] w-full overflow-y-auto overflow-x-hidden scroll-smooth custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                <div className="relative w-full" style={{ height: pathLength }}>

                    {/* Connecting Path */}
                    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        <path
                            d={nodes.map((n, i) =>
                                i === 0 ? `M ${n.x}% ${n.y}` : `L ${n.x}% ${n.y}`
                            ).join(" ")}
                            fill="none"
                            stroke="#DBEAFE"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray="20 10"
                        />
                    </svg>

                    {/* Nodes */}
                    {nodes.map((node) => {
                        const isCompleted = node.level < currentLevel
                        const isCurrent = node.level === currentLevel
                        const isLocked = node.level > currentLevel
                        const isBoss = node.level % 5 === 0

                        return (
                            <motion.div
                                key={node.level}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                style={{ left: `${node.x}%`, top: node.y }}
                            >
                                <div className={`
                  relative flex items-center justify-center w-12 h-12 rounded-full border-4 shadow-lg transition-all duration-300
                  ${isCurrent ? 'w-16 h-16 bg-yellow-300 border-yellow-500 scale-110 z-20' : ''}
                  ${isCompleted ? 'bg-green-400 border-green-600' : ''}
                  ${isLocked ? 'bg-gray-200 border-gray-300 contrast-50' : ''}
                `}>

                                    {isCurrent && (
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute inset-0 rounded-full border-4 border-white opacity-50"
                                        />
                                    )}

                                    <span className={`font-black text-white ${isCurrent ? 'text-2xl' : 'text-lg'}`}>
                                        {node.level}
                                    </span>

                                    {/* Boss Marker */}
                                    {isBoss && !isLocked && (
                                        <div className="absolute -top-6 text-2xl animate-bounce">🎁</div>
                                    )}
                                    {isBoss && isLocked && (
                                        <div className="absolute -top-6 text-2xl grayscale">🔒</div>
                                    )}

                                </div>

                                {/* Level Label for Current */}
                                {isCurrent && (
                                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                                        当前位置
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
