"use client";

import { useEffect, useState } from "react";
import { agentMessages } from "@/data/agentMessages";

export default function LiveStatsCard() {
  const [message, setMessage] = useState("");
  const [fullMessage, setFullMessage] = useState(agentMessages[0]);
  const [index, setIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(-1);

  
  const pickNewMessage = () => {
    let random = Math.floor(Math.random() * agentMessages.length);

    
    while (random === lastIndex) {
      random = Math.floor(Math.random() * agentMessages.length);
    }

    setLastIndex(random);
    setFullMessage(agentMessages[random]);
    setMessage("");
    setIndex(0);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      pickNewMessage();
    }, 10000);

    return () => clearInterval(interval);
  }, [lastIndex]);

 
  useEffect(() => {
    if (index < fullMessage.length) {
      const timeout = setTimeout(() => {
        setMessage((prev) => prev + fullMessage[index]);
        setIndex(index + 1);
      }, 60);

      return () => clearTimeout(timeout);
    }
  }, [index, fullMessage]);

  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-black text-yellow-400">
      <div className="text-xs text-zinc-500 mb-3">Agent Console</div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {message}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
}
