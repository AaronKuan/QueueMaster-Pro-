import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

export const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-slate-300 font-mono text-xl md:text-2xl">
      <ClockIcon className="w-6 h-6" />
      <span>
        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  );
};