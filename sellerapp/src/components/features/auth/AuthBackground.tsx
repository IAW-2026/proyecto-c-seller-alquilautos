export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{
        background: "linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-neutral-900) 55%, #020617 100%)",
      }}
    >
      {/* Patrón de rayas diagonales */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 28px)",
        }}
      />

      {/* Velocímetro difuminado de fondo */}
      <img
        src="/auth/speedometer.webp"
        alt=""
        aria-hidden="true"
        className="absolute left-[-100px] top-1/2 -translate-y-1/2 w-[620px] max-w-none pointer-events-none select-none max-[900px]:hidden"
        style={{
          opacity: 0.3,
          filter: "grayscale(1)",
          mixBlendMode: "screen",
          maskImage: "radial-gradient(ellipse 65% 65% at 35% 50%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 35% 50%, black 30%, transparent 78%)",
        }}
      />

      {/* Auto difuminado de fondo */}
      <img
        src="/auth/car.webp"
        alt=""
        aria-hidden="true"
        className="absolute right-[-80px] bottom-[-40px] w-[680px] max-w-none pointer-events-none select-none max-[900px]:hidden"
        style={{
          opacity: 0.28,
          filter: "grayscale(1)",
          mixBlendMode: "screen",
          maskImage: "radial-gradient(ellipse 65% 65% at 65% 55%, black 30%, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 65% at 65% 55%, black 30%, transparent 78%)",
        }}
      />

      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
