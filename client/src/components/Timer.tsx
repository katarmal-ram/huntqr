import { useEffect, useState } from "react";

interface TimerProps {
  endAt: Date | null;
  timerSeconds: number;
  status: string;
}

export function Timer({ endAt, timerSeconds, status }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);

  useEffect(() => {
    if (status !== "active" || !endAt) {
      setTimeLeft(timerSeconds);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const end = new Date(endAt).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
    }, 100);

    return () => clearInterval(interval);
  }, [endAt, status, timerSeconds]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    const percentage = (timeLeft / timerSeconds) * 100;
    if (percentage > 50) return "text-success";
    if (percentage > 20) return "text-yellow-500";
    return "text-destructive";
  };

  const shouldPulse = timeLeft < 120 && timeLeft > 0;

  return (
    <div
      className={`font-mono text-2xl font-bold ${getTimerColor()} ${
        shouldPulse ? "animate-pulse" : ""
      }`}
      data-testid="text-timer"
    >
      {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
