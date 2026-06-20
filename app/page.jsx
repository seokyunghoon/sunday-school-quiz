"use client";

import { useState, useEffect } from "react";
import { questions } from "./quizData";

export default function RacingQuiz() {
  const [team, setTeam] = useState(null); // 'A' or 'B'
  const [gameState, setGameState] = useState("lobby"); // lobby, playing, finished
  const [localWinner, setLocalWinner] = useState(null);
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isShake, setIsShake] = useState(false);

  // 문제 섞기 함수
  useEffect(() => {
    if (gameState === "playing" && currentQIndex < questions.length) {
      const q = questions[currentQIndex];
      const choices = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
      setShuffledChoices(choices);
    }
  }, [currentQIndex, gameState]);

  // 정답 확인 로직
  const handleAnswer = (choice) => {
    if (isLocked) return;

    const correct = questions[currentQIndex].correct;
    
    if (choice === correct) {
      if (currentQIndex >= questions.length - 1) {
        // ⭐ [중요] 10문제를 모두 맞춘 순간 바로 게임 종료 화면으로!
        setLocalWinner(team);
        setGameState("finished");
      } else {
        setCurrentQIndex((prev) => prev + 1);
      }
    } else {
      // 오답 처리 (화면 흔들림 & 1.5초 락)
      setIsShake(true);
      setIsLocked(true);
      setTimeout(() => {
        setIsShake(false);
        setIsLocked(false);
      }, 1500);
    }
  };

  // 팀 선택 및 즉시 시작
  const handleReady = (selectedTeam) => {
    setTeam(selectedTeam);
    setGameState("playing");
  };

  // ================= UI 랜더링 =================

  // [화면 1] 대기실
  if (gameState === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50 px-4 text-center">
        <h1 className="text-4xl font-bold mb-10 text-blue-800">성경 레이싱 퀴즈 🚗</h1>
        <div className="space-y-4 w-full max-w-sm">
          <button 
            onClick={() => handleReady("A")} 
            className="w-full py-5 text-2xl font-bold text-white bg-red-500 rounded-2xl active:scale-95 shadow-md"
          >
            우리 조는 [ 팀 A ]
          </button>
          <button 
            onClick={() => handleReady("B")} 
            className="w-full py-5 text-2xl font-bold text-white bg-blue-500 rounded-2xl active:scale-95 shadow-md"
          >
            우리 조는 [ 팀 B ]
          </button>
        </div>
        <p className="mt-8 text-gray-500 text-sm break-keep">조 이름을 선택하면 즉시 퀴즈 레이싱이 시작됩니다!</p>
      </div>
    );
  }

  // [화면 2] 결과 화면 ⭐ (누가 봐도 확실하게 끝났음을 알 수 있도록 화려하게 수정!)
  if (gameState === "finished") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-yellow-400 via-orange-400 to-red-500 p-6 text-center text-white">
        <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl border-2 border-white/30 shadow-2xl w-full max-w-md space-y-6">
          <span className="text-8xl animate-bounce inline-block">🏁</span>
          <h1 className="text-5xl font-black tracking-wider text-yellow-100 drop-shadow-md">
            GAME OVER
          </h1>
          <div className="py-4 bg-white/10 rounded-2xl border border-white/20">
            <p className="text-2xl font-bold">🎉 축하합니다! 🎉</p>
            <p className="text-4xl font-black mt-2 text-yellow-200">
              팀 {localWinner} 미션 완료!!
            </p>
          </div>
          <p className="text-lg font-medium text-white/95 break-keep">
            10개의 성경 문제를 누구보다 빠르게 모두 풀어냈습니다! <br/>
            <span className="text-yellow-200 font-bold underline decoration-2">지금 즉시 선생님께 이 화면을 보여주고 1등을 인증하세요!</span> 🏃‍♂️💨
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-4 bg-white text-gray-900 rounded-2xl text-xl font-bold shadow-lg active:scale-95 transition-transform"
          >
            다시 도전하기 🔄
          </button>
        </div>
      </div>
    );
  }

  // [화면 3] 게임 룸
  return (
    <div className={`flex flex-col h-screen bg-gray-100 ${isShake ? "animate-shake" : ""}`}>
      {/* 상단: 레이싱 트랙 */}
      <div className="bg-white p-4 shadow-md rounded-b-3xl">
        <div>
          <div className="flex justify-between mb-1 font-bold text-gray-700">
            <span className={team === "A" ? "text-red-600" : "text-blue-600"}>
              [{team}팀] 나의 레이싱 진행도
            </span>
            <span>{currentQIndex} / 10 문제 완료</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-5 relative overflow-hidden">
            <div 
              className={`h-5 rounded-full transition-all duration-500 ${team === "A" ? "bg-red-500" : "bg-blue-500"}`} 
              style={{ width: `${(currentQIndex / 10) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 중앙: 퀴즈 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="text-center">
          <span className="text-gray-400 font-bold mb-1 block text-sm">QUESTION {currentQIndex + 1} / 10</span>
          <h2 className="text-2xl font-bold break-keep px-2 text-gray-800">
            {questions[currentQIndex]?.question}
          </h2>
        </div>

        {/* 4지선다 버튼 */}
        <div className="grid grid-cols-1 gap-4 w-full max-w-md">
          {shuffledChoices.map((choice, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(choice)}
              disabled={isLocked}
              className={`p-5 text-lg font-bold rounded-2xl shadow-sm transition-transform active:scale-95 ${
                isLocked ? "bg-gray-300 text-gray-500" : "bg-white text-gray-800 border-2 border-gray-200"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
        
        {isLocked && (
          <div className="text-center space-y-1">
            <p className="text-red-500 font-bold animate-pulse">앗! 오답입니다. ❌</p>
            <p className="text-xs text-gray-400">1.5초 후 다시 선택할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}