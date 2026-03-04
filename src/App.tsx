import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Trophy, Play, RotateCcw, Flame } from 'lucide-react';

type Command = 'SIX' | 'SEVEN' | 'LAMELO' | 'SKRILLA';
const COMMANDS: Command[] = ['SIX', 'SEVEN', 'LAMELO', 'SKRILLA'];

const BUTTONS = [
  { id: 'SIX', label: '6️⃣', color: 'bg-[#FF3366]' },
  { id: 'SEVEN', label: '7️⃣', color: 'bg-[#33CCFF]' },
  { id: 'LAMELO', label: '🏀', color: 'bg-[#FF9933]' },
  { id: 'SKRILLA', label: '🎤', color: 'bg-[#CC33FF]' },
];

const EMOJIS = ['🏀', '🥶', '💯', '6️⃣', '7️⃣', '🔥', '💀', '🧢', '🐺', '🚽', '🍕', '📉', '✨'];

const BRAIN_ROT_TERMS = ["SKIBIDI", "GYATT", "RIZZ", "OHIO", "SIGMA", "MOGGED", "FANUM TAX", "AURA", "MEWING", "COOKED", "SUS", "WHAT THE SIGMA"];

const GAMEOVER_MESSAGES = [
  "Bro is definitely 5'9 😭",
  "Negative Aura detected 📉",
  "Bro got Fanum taxed 🍕",
  "Skibidi toilet reaction time 🚽",
  "You are NOT LaMelo 🏀",
  "Bro got mogged by the game 🤫",
  "Zero Rizz 🚫",
  "What the sigma was that? 🐺",
  "Cooked. Absolutely cooked. 🍳"
];

const FloatingEmojis = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-15">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl"
          initial={{ 
            left: `${Math.random() * 100}%`, 
            top: '110%',
            rotate: 0 
          }}
          animate={{ 
            top: '-10%',
            rotate: 360,
          }}
          transition={{ 
            duration: 4 + Math.random() * 8, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 5
          }}
        >
          {EMOJIS[Math.floor(Math.random() * EMOJIS.length)]}
        </motion.div>
      ))}
    </div>
  );
};

const Distractions = ({ score }: { score: number }) => {
  const [distractions, setDistractions] = useState<{id: number, text: string, x: number, y: number}[]>([]);
  
  useEffect(() => {
    if (score < 5) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const text = BRAIN_ROT_TERMS[Math.floor(Math.random() * BRAIN_ROT_TERMS.length)];
        const newDistraction = {
          id: Date.now() + Math.random(),
          text,
          x: Math.random() * 60 + 20,
          y: Math.random() * 60 + 20,
        };
        setDistractions(prev => [...prev, newDistraction]);
        setTimeout(() => {
          setDistractions(prev => prev.filter(d => d.id !== newDistraction.id));
        }, 800);
      }
    }, Math.max(300, 1500 - score * 50));
    
    return () => clearInterval(interval);
  }, [score]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {distractions.map(d => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, scale: 0, rotate: Math.random() * 40 - 20 }}
            animate={{ opacity: 1, scale: Math.random() * 1.5 + 1, rotate: Math.random() * 40 - 20 }}
            exit={{ opacity: 0, scale: 2 }}
            className="absolute font-black brain-rot-text text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] whitespace-nowrap text-4xl md:text-6xl"
            style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {d.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [currentCommand, setCurrentCommand] = useState<Command>('SIX');
  const [timeLeft, setTimeLeft] = useState(100);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [shake, setShake] = useState(false);
  const [gameOverMsg, setGameOverMsg] = useState(GAMEOVER_MESSAGES[0]);
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(2000);
  
  const speak = useCallback((text: string) => {
    if (!soundEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.8;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  }, [soundEnabled]);

  const nextCommand = useCallback((currentScore: number) => {
    let nextCmd;
    do {
      nextCmd = COMMANDS[Math.floor(Math.random() * COMMANDS.length)];
    } while (nextCmd === currentCommand && Math.random() > 0.3);
    
    setCurrentCommand(nextCmd);
    speak(nextCmd);
    
    // Gets faster as score increases
    durationRef.current = Math.max(400, 2000 - currentScore * 60);
    setTimeLeft(100);
    startTimeRef.current = performance.now();
  }, [currentCommand, speak]);

  const startGame = () => {
    setScore(0);
    setGameState('playing');
    setTimeout(() => {
      nextCommand(0);
    }, 100);
  };

  const gameOver = useCallback(() => {
    setGameState('gameover');
    if (score > highScore) {
      setHighScore(score);
    }
    setShake(true);
    setTimeout(() => setShake(false), 500);
    
    const randomMsg = GAMEOVER_MESSAGES[Math.floor(Math.random() * GAMEOVER_MESSAGES.length)];
    setGameOverMsg(randomMsg);
    speak("Game Over! " + randomMsg.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')); // remove emojis for TTS
    
    if (timerRef.current) cancelAnimationFrame(timerRef.current);
  }, [score, highScore, speak]);

  const handleButtonClick = (cmd: Command) => {
    if (gameState !== 'playing') return;
    
    if (cmd === currentCommand) {
      const newScore = score + 1;
      setScore(newScore);
      nextCommand(newScore);
    } else {
      gameOver();
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      const tick = (time: number) => {
        const elapsed = time - startTimeRef.current;
        const newTimeLeft = Math.max(0, 100 - (elapsed / durationRef.current) * 100);
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft <= 0) {
          gameOver();
        } else {
          timerRef.current = requestAnimationFrame(tick);
        }
      };
      timerRef.current = requestAnimationFrame(tick);
    }
    
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [gameState, currentCommand, gameOver]);

  // Dynamic background color based on score
  const bgColors = ['#050505', '#1a0505', '#051a05', '#05051a', '#1a1a05'];
  const currentBg = score > 10 ? bgColors[Math.floor(score / 5) % bgColors.length] : '#050505';

  return (
    <motion.div 
      animate={shake ? { x: [-20, 20, -20, 20, 0], y: [-20, 20, -20, 20, 0] } : { backgroundColor: currentBg }}
      transition={{ duration: shake ? 0.4 : 1 }}
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden font-sans text-white"
    >
      <FloatingEmojis />
      {gameState === 'playing' && <Distractions score={score} />}
      
      <button 
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-6 left-6 z-30 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors"
      >
        {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </button>

      <AnimatePresence mode="wait">
        {gameState === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center z-10 px-4 text-center"
          >
            <motion.div
              animate={{ rotate: [-3, 3, -3], scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <h1 className="text-8xl md:text-9xl font-black brain-rot-text text-transparent bg-clip-text bg-gradient-to-br from-[#FF3366] to-[#33CCFF] drop-shadow-[0_0_40px_rgba(51,204,255,0.4)] mb-2">
                6-7
              </h1>
            </motion.div>
            <p className="text-xl md:text-2xl font-bold text-gray-400 mb-2 brain-rot-text tracking-widest">
              ARE YOU 6'7? PROVE IT.
            </p>
            <p className="text-sm text-gray-500 mb-12 font-bold uppercase tracking-widest">
              +1000 Aura if you beat 20
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="group relative px-12 py-6 bg-white text-black rounded-full font-black text-3xl brain-rot-text overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#FF3366] to-[#33CCFF] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-3 group-hover:text-white transition-colors">
                <Play className="w-8 h-8 fill-current" />
                START
              </span>
            </motion.button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-between w-full h-full min-h-screen py-8 z-10"
          >
            <div className="w-full max-w-md px-6 flex justify-between items-center mt-16">
              <div className="w-full h-6 bg-gray-800/50 backdrop-blur-sm rounded-full overflow-hidden flex-1 mr-6 border border-white/10 relative">
                <motion.div 
                  className="h-full absolute left-0 top-0"
                  style={{ width: `${timeLeft}%` }}
                  animate={{ backgroundColor: timeLeft < 30 ? '#FF3366' : '#ffffff' }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <div className="flex items-center gap-2 text-4xl font-black brain-rot-text">
                <Flame className={`w-8 h-8 ${score > 10 ? 'text-red-500 fill-red-500' : 'text-yellow-400'}`} />
                {score}
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center w-full relative">
              <AnimatePresence mode="popLayout">
                <motion.h2 
                  key={currentCommand + score}
                  initial={{ scale: 2.5, opacity: 0, rotate: Math.random() * 40 - 20 }}
                  animate={{ scale: 1, opacity: 1, rotate: Math.random() * 10 - 5 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="text-8xl md:text-[160px] font-black brain-rot-text text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)] z-10"
                >
                  {currentCommand}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-md px-4 pb-8 z-30">
              {BUTTONS.map((btn) => (
                <motion.button
                  key={btn.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => handleButtonClick(btn.id as Command)}
                  className={`${btn.color} h-32 md:h-40 rounded-3xl flex items-center justify-center text-6xl md:text-7xl shadow-[0_8px_0_rgba(0,0,0,0.5)] active:shadow-[0_0px_0_rgba(0,0,0,0.5)] active:translate-y-2 transition-all border-4 border-white/20 font-black brain-rot-text overflow-hidden relative group`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 drop-shadow-lg">{btn.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === 'gameover' && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="flex flex-col items-center z-10 px-4 text-center w-full max-w-md"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.6 }}
              className="text-9xl mb-4 drop-shadow-[0_0_30px_rgba(255,0,0,0.5)]"
            >
              💀
            </motion.div>
            <h2 className="text-6xl md:text-7xl font-black brain-rot-text text-red-500 mb-4 uppercase drop-shadow-lg">
              COOKED
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 font-black brain-rot-text">
              {gameOverMsg}
            </p>
            
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-10 w-full border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold tracking-widest">SCORE</span>
                <span className="text-5xl font-black brain-rot-text text-white">{score}</span>
              </div>
              <div className="h-px w-full bg-white/10 mb-6" />
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold tracking-widest">HIGH SCORE</span>
                <span className="text-5xl font-black brain-rot-text text-yellow-400">{highScore}</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-10 py-5 bg-white text-black rounded-full font-black text-2xl brain-rot-text flex items-center gap-3 hover:bg-gray-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <RotateCcw className="w-6 h-6" />
              TRY AGAIN
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
