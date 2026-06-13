"use client"

import { useState } from "react"
import type { Mode } from "@/lib/quiz-data"
import { PASS_THRESHOLD, TOTAL_LEVELS } from "@/lib/quiz-data"
import { useGame } from "@/lib/use-game"
import { StartScreen } from "@/components/start-screen"
import { LevelMap } from "@/components/level-map"
import { QuizScreen } from "@/components/quiz-screen"
import { ResultScreen } from "@/components/result-screen"

type Screen = "home" | "map" | "quiz" | "result"

export default function Page() {
  const game = useGame()
  const [screen, setScreen] = useState<Screen>("home")
  const [mode, setMode] = useState<Mode>("normal")
  const [level, setLevel] = useState(1)
  const [runKey, setRunKey] = useState(0)
  const [result, setResult] = useState({ correct: 0, coinsEarned: 0 })

  if (!game.hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <div className="font-heading text-lg font-bold text-muted-foreground">Loading…</div>
      </main>
    )
  }

  function startLevel(lvl: number) {
    setLevel(lvl)
    setRunKey((k) => k + 1)
    setScreen("quiz")
  }

  return (
    <main className="min-h-dvh">
      {screen === "home" && (
        <StartScreen
          coins={game.coins}
          normalUnlocked={game.progress.normal.unlocked}
          hardUnlocked={game.progress.hard.unlocked}
          onSelectMode={(m) => {
            setMode(m)
            setScreen("map")
          }}
        />
      )}

      {screen === "map" && (
        <LevelMap
          mode={mode}
          coins={game.coins}
          unlocked={game.progress[mode].unlocked}
          stars={game.progress[mode].stars}
          onSelectLevel={startLevel}
          onBack={() => setScreen("home")}
        />
      )}

      {screen === "quiz" && (
        <QuizScreen
          key={runKey}
          mode={mode}
          level={level}
          coins={game.coins}
          spendCoins={game.spendCoins}
          addCoins={game.addCoins}
          onQuit={() => setScreen("map")}
          onComplete={(correct, coinsEarned) => {
            game.recordResult(mode, level, correct, PASS_THRESHOLD)
            setResult({ correct, coinsEarned })
            setScreen("result")
          }}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          mode={mode}
          level={level}
          correct={result.correct}
          coinsEarned={result.coinsEarned}
          onRetry={() => startLevel(level)}
          onNext={() => startLevel(Math.min(TOTAL_LEVELS, level + 1))}
          onBackToMap={() => setScreen("map")}
        />
      )}
    </main>
  )
}
