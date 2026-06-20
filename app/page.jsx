"use client";

import { useState, useEffect } from "react";
import { questions } from "./quizData";
// import { database } from "./firebase"; // Firebase 설정 파일 불러오기
// import { ref, onValue, set, update } from "firebase/database"; 

export default function RacingQuiz() {
  const [team, setTeam] = useState(null); // 'A' or 'B'
  const [gameState, setGameState] = useState("lobby"); // lobby, playing, finished
  const [dbData, setDbData] = useState({
    A_ready: false,
    B_ready: false,
    A_score: 0,
    B_score: 0,
    winner: null,
  });
  
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [shuffledChoices, setShuffledChoices] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isShake, setIsShake] = useState(false);

  // 1. Firebase 실시간 동기화 (주석 해제 후 사용)
  /*
  useEffect(() => {
    const gameRef = ref(database, "quizGame");
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDbData(data);
        if (data.A_ready && data.B_ready && gameState === "lobby") setGameState("playing");
        if (data.winner && gameState !== "finished") setGameState("finished");
      }
    });
  }, [gameState]);
  */

  // 2. 문제 섞기 함수
  useEffect(() => {
    if (gameState === "playing" && currentQIndex < questions.length) {
      const q = questions[currentQIndex];
      const choices = [q.correct, ...q.wrong].sort(() => Math.random() - 0.5);
      setShuffledChoices(choices);
    }
  }, [currentQIndex, gameState]);

  // 3. 정답 확인 로직
  const handleAnswer = async (choice) => {
    if (isLocked) return;

    const correct = questions[currentQIndex].correct;
    
    if (choice === correct) {
      // 정답
      const newScore = dbData[`${team}_score`] + 1;
      
      // Firebase 점수 업데이트
      // await update(ref(database, "quizGame"), { [`${team}_score`]: newScore });

      if (newScore >= 10) {
        // 우승 처리
        // await update(ref(database, "quizGame"), { winner: team });
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

  // 4. 팀 준비 완료
  const handleReady = (selectedTeam) => {
    setTeam(selectedTeam);
    setGameState("playing"); // <--- 이 줄을 추가하세요!
  };

  // ================= UI 랜더링 =================

  // [화면 1] 대기실
  if (gameState === "lobby") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50">
        <h1 className="text-4xl font-bold mb-10 text-blue-800">성경 레이싱 퀴즈 🚗</h1>
        <div className="space-y-4 w-full max-w-sm px-6">
          <button 
            onClick={() => handleReady("A")} 
            className="w-full py-5 text-2xl font-bold text-white bg-red-500 rounded-2xl active:scale-95"
          >
            팀 A 선택 및 준비
          </button>
          <button 
            onClick={() => handleReady("B")} 
            className="w-full py-5 text-2xl font-bold text-white bg-blue-500 rounded-2xl active:scale-95"
          >
            팀 B 선택 및 준비
          </button>
        </div>
        <p className="mt-8 text-gray-500">양 팀이 모두 준비하면 시작됩니다!</p>
      </div>
    );
  }

  // [화면 2] 결과 화면
  if (gameState === "finished") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-yellow-100">
        <h1 className="text-6xl text-yellow-500 mb-6">🏆</h1>
        <h2 className="text-4xl font-bold mb-4">팀 {dbData.winner} 우승!</h2>
        <p className="text-xl mb-10">먼저 결승선을 통과했습니다!</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-8 py-4 bg-gray-800 text-white rounded-xl text-xl"
        >
          처음으로 돌아가기
        </button>
      </div>
    );
  }

  // [화면 3] 게임 룸
  return (
    <div className={`flex flex-col h-screen bg-gray-100 ${isShake ? "animate-shake" : ""}`}>
      {/* 상단: 레이싱 트랙 (프로그레스 바) */}
      <div className="bg-white p-4 shadow-md rounded-b-3xl">
        {/* 팀 A 트랙 */}
        <div className="mb-4">
          <div className="flex justify-between mb-1 font-bold text-red-600">
            <span>팀 A</span>
            <span>{dbData.A_score} / 10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 relative">
            <div 
              className="bg-red-500 h-6 rounded-full transition-all duration-500" 
              style={{ width: `${(dbData.A_score / 10) * 100}%` }}
            ></div>
            <span className="absolute text-xl transition-all duration-500" style={{ left: `calc(${(dbData.A_score / 10) * 100}% - 15px)`, top: "-4px" }}>🏃</span>
          </div>
        </div>

        {/* 팀 B 트랙 */}
        <div>
          <div className="flex justify-between mb-1 font-bold text-blue-600">
            <span>팀 B</span>
            <span>{dbData.B_score} / 10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-6 relative">
            <div 
              className="bg-blue-500 h-6 rounded-full transition-all duration-500" 
              style={{ width: `${(dbData.B_score / 10) * 100}%` }}
            ></div>
            <span className="absolute text-xl transition-all duration-500" style={{ left: `calc(${(dbData.B_score / 10) * 100}% - 15px)`, top: "-4px" }}>🏃‍♂️</span>
          </div>
        </div>
      </div>

      {/* 중앙: 퀴즈 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="text-center">
          <span className="text-gray-500 font-bold mb-2 block">문제 {currentQIndex + 1}</span>
          <h2 className="text-2xl font-bold break-keep">
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
              className={`p-6 text-xl font-bold rounded-2xl shadow-sm transition-transform active:scale-95 ${
                isLocked ? "bg-gray-300 text-gray-500" : "bg-white text-gray-800 border-2 border-gray-200"
              }`}
            >
              {choice}
            </button>
          ))}
        </div>
        
        {isLocked && <p className="text-red-500 font-bold animate-pulse">앗! 오답입니다. 1.5초 후 다시 시도하세요!</p>}
      </div>
    </div>
  );
}