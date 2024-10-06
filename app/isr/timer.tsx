'use client';

import { useState, useEffect } from 'react';

export function FreshnessTimer({ generatedAt }: { generatedAt: number }) {
  const [secondsElapsed, setSecondsElapsed] = useState<number | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      setSecondsElapsed(Math.floor((Date.now() - generatedAt) / 1000));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [generatedAt]);

  return (
    <p>
      Data has been fresh for:{' '}
      {secondsElapsed !== null
        ? `${secondsElapsed} second${secondsElapsed !== 1 ? 's' : ''}`
        : ''}
    </p>
  );
}
