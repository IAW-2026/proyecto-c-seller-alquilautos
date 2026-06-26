"use client";
import { useState, useEffect } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2400);
    return () => clearTimeout(t);
  }, [msg]);

  const node = msg
    ? (
      <div className="fixed bottom-6 right-6 bg-[var(--color-neutral-900)] text-white px-[18px] py-[12px] rounded-[var(--radius-md)] shadow-[var(--shadow-lg)] text-[13px] z-[200] animate-[slideUp_200ms_ease]">
        {msg}
      </div>
    )
    : null;

  return [node, setMsg] as const;
}