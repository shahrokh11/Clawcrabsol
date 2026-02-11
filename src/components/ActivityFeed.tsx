"use client";

import { useEffect, useState } from "react";

export default function ActivityFeed() {
  const [events, setEvents] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [index, setIndex] = useState(0);
  const [char, setChar] = useState(0);

  // Fetch events every 3 seconds
  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setEvents(data.events || []);
    };

    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, []);

  // Typing animation
  useEffect(() => {
    if (!events.length) return;

    const full = events[index];

    if (char < full.length) {
      const t = setTimeout(() => {
        setCurrent((p) => p + full[char]);
        setChar((c) => c + 1);
      }, 30);

      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setCurrent("");
        setChar(0);
        setIndex((i) => (i + 1) % events.length);
      }, 2500);

      return () => clearTimeout(t);
    }
  }, [char, events, index]);

  return (
    <div className="text-white text-lg">
      {current}
    </div>
  );
}
