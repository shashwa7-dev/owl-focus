import React, { useState, useEffect, useRef } from "react";
import { ICONS, SOUNDS } from "./assets";

const PRESET_TIMER = {
  5: 300,
  30: 1800,
  60: 3600,
};
const Timer: React.FC = () => {
  const [time, setTime] = useState<number>(PRESET_TIMER[30]); // Initial time set to 1 minute (60 seconds)
  const [presetTimer, setPresetTimer] = useState({
    5: false,
    30: true,
    60: false,
  });
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [audioPlayCount, setAudioPlayCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const originalTitle = useRef<string>(document.title);
  // Format time to MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Update document title based on timer state
  useEffect(() => {
    if (isComplete) {
      document.title = "⏰ Timer Complete!";
    } else if (isRunning) {
      document.title = `⏳ ${formatTime(time)} - Running`;
    } else if (time < 60) {
      document.title = `⏸️ ${formatTime(time)} - Paused`;
    } else {
      document.title = originalTitle.current;
    }

    // Cleanup: restore original title when component unmounts
    return () => {
      document.title = originalTitle.current;
    };
  }, [time, isRunning, isComplete]);

  // Timer countdown effect
  useEffect(() => {
    let intervalId: any;

    if (isRunning && time > 0) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalId);
            setIsRunning(false);
            setIsComplete(true);

            // Play audio notification
            if (audioRef.current) {
              audioRef.current.play();
              setAudioPlayCount(1);
            }

            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRunning]);

  // Audio replay and auto-reset effect
  useEffect(() => {
    if (isComplete && audioRef.current) {
      const handleAudioEnded = () => {
        if (audioPlayCount < 3) {
          setAudioPlayCount((prev) => prev + 1);
          audioRef.current?.play();
        } else {
          // Auto reset after 3 audio plays
          handleReset();
        }
      };

      audioRef.current.addEventListener("ended", handleAudioEnded);

      return () => {
        audioRef.current?.removeEventListener("ended", handleAudioEnded);
      };
    }
  }, [isComplete, audioPlayCount]);

  const handleStart = () => {
    setIsRunning(true);
    setIsComplete(false);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setTime(presetTimer[30] ? PRESET_TIMER[30] : PRESET_TIMER[60]);
    setIsRunning(false);
    setIsComplete(false);
    setAudioPlayCount(0);

    // Stop audio if it's playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`grid place-items-center  min-h-screen font-grotesk transition-all duration-300 ${
        isComplete ? "bg-red-100 text-red-400" : "bg-blue-100 text-gray-700"
      }`}
    >
      <div className="p-8 rounded-lg  text-center">
        <div className={`text-[20vw] font-bold max-md:text-[30vw]`}>{formatTime(time)}</div>
        <audio ref={audioRef} src={SOUNDS.sound_chimes} className="hidden" />
      </div>
      <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full grid place-items-center">
        <div
          className={`flex justify-center space-x-3 border-4 w-fit mx-auto p-2 px-4 rounded-[2rem] transition-all duration-300 ${
            isComplete
              ? "bg-red-100 border-red-200"
              : "bg-blue-100 border-blue-200"
          }`}
        >
          <button
            onClick={() => {
              setTime(PRESET_TIMER[5]);
              setPresetTimer({ 5: true, 30: false, 60: false });
            }}
            className={`flex gap-1 items-center justify-center ${
              presetTimer[5] && "font-bold"
            }`}
          >
            <img
              src={ICONS.icon_hourglass}
              alt="start_timer"
              className="w-4 h-4"
            />
            <span>5 min</span>
          </button>
          <button
            onClick={() => {
              setTime(PRESET_TIMER[30]);
              setPresetTimer({ 5: false, 30: true, 60: false });
            }}
            className={`flex gap-1 items-center justify-center ${
              presetTimer[30] && "font-bold"
            }`}
          >
            <img
              src={ICONS.icon_hourglass}
              alt="start_timer"
              className="w-4 h-4"
            />
            <span>30 min</span>
          </button>
          <button
            onClick={() => {
              setTime(PRESET_TIMER[60]);
              setPresetTimer({ 5: false, 30: false, 60: true });
            }}
            className={`flex gap-1 items-center justify-center ${
              presetTimer[60] && "font-bold"
            }`}
          >
            <img
              src={ICONS.icon_hourglass}
              alt="start_timer"
              className="w-4 h-4"
            />
            <span>1 hr</span>
          </button>
          {!isRunning && time > 0 ? (
            <button onClick={handleStart} className="w-[1.35rem]">
              <img src={ICONS.icon_play} alt="start_timer" />
            </button>
          ) : (
            <button
              onClick={handlePause}
              disabled={time === 0}
              className="w-[1.35rem]"
            >
              <img src={ICONS.icon_pause} alt="pause_timer" />
            </button>
          )}

          <button onClick={handleReset} className="w-[1.35rem]">
            <img src={ICONS.icon_refresh} alt="refresh_timer" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Timer;
