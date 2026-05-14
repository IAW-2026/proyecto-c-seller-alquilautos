"use client";
import { useState, useEffect } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);
  const node = msg ? <div className="toast">{msg}</div> : null;
  return [node, setMsg] as const;
}