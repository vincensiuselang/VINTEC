import { useEffect, useState } from "react";

const STORAGE_KEY = "visitor_count";
const CHANNEL = "visitor_realtime";
const BASE_COUNT = 500;

export default function VisitorCounter() {
  const [count, setCount] = useState(BASE_COUNT);

  useEffect(() => {
    const channel = new BroadcastChannel(CHANNEL);

    let current = Number(localStorage.getItem(STORAGE_KEY));

    // kalau belum ada atau nilainya lebih kecil dari 500 → reset
    if (!current || current < BASE_COUNT) {
      current = BASE_COUNT;
    }

    // refresh / buka = +1
    const newCount = current + 1;
    localStorage.setItem(STORAGE_KEY, String(newCount));
    setCount(newCount);

    // broadcast realtime
    channel.postMessage(newCount);

    // listen dari tab lain
    channel.onmessage = (e) => {
      setCount(e.data);
    };

    return () => channel.close();
  }, []);

  return (
    <div className="fixed top-4 right-4 px-4 py-2 rounded-xl bg-black text-white">
      👀 Visitors: <b>{count}</b>
    </div>
  );
}
