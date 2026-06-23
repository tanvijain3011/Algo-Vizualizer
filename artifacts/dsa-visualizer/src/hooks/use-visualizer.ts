import { useState, useEffect, useRef, useCallback } from 'react';

export function useVisualizer<T>(steps: T[], initialSpeed: number = 500) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const play = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) return;
    setIsPlaying(true);
  }, [currentStepIndex, steps.length]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, []);

  const stepForward = useCallback(() => {
    pause();
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, steps.length, pause]);

  const stepBack = useCallback(() => {
    pause();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex, pause]);

  const reset = useCallback(() => {
    pause();
    setCurrentStepIndex(0);
  }, [pause]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            clearTimer();
            return prev;
          }
          return prev + 1;
        });
      }, speed);
    }
    return clearTimer;
  }, [isPlaying, speed, steps.length]);

  return {
    currentStepIndex,
    currentStep: steps[currentStepIndex] || null,
    isPlaying,
    play,
    pause,
    stepForward,
    stepBack,
    reset,
    speed,
    setSpeed,
    progress: steps.length > 0 ? currentStepIndex / (steps.length - 1) : 0,
  };
}