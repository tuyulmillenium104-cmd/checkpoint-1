'use client'

export function PixelDecoration({ className }: { className?: string }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="flex gap-0.5">
        <div className="w-2 h-2 bg-[#00fff7]" />
        <div className="w-2 h-2 bg-[#ff00ff]" />
        <div className="w-2 h-2 bg-[#39ff14]" />
      </div>
    </div>
  )
}
