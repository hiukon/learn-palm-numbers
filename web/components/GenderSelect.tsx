interface GenderSelectProps {
  onSelect: (gender: 'Nam' | 'Nữ') => void
}

export default function GenderSelect({ onSelect }: GenderSelectProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 safe-top safe-bottom bg-transparent">

      {/* Logo */}
      <div className="text-center fade-in-up">
        <div className="text-7xl mb-3 select-none">✋</div>
        <h1 className="text-4xl font-bold text-[#2c4318] tracking-widest">FALM</h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.28em] text-[#36591b]">
          Đọc Chỉ Tay AI
        </p>
      </div>

      {/* Tagline */}
      <p
        className="text-slate-400 text-center text-sm leading-relaxed max-w-[280px] fade-in-up"
        style={{ color: '#5d6b53', animationDelay: '0.1s' }}
      >
        Chọn giới tính để xác định bàn tay cần phân tích theo chiêm tinh học
      </p>

      {/* Gender buttons */}
      <div
        className="flex gap-4 w-full max-w-xs fade-in-up"
        style={{ animationDelay: '0.2s' }}
      >
        {([
          { value: 'Nam', icon: '♂', sub: 'Xem tay trái' },
          { value: 'Nữ',  icon: '♀', sub: 'Xem tay phải' },
        ] as const).map(({ value, icon, sub }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            className="
              flex-1 flex flex-col items-center gap-3 py-7 px-4
              rounded-2xl border border-[#d9e6cc] bg-[rgba(255,255,255,0.78)] backdrop-blur-xl
              hover:border-[#8ec15a] hover:bg-[rgba(246,250,240,0.95)]
              active:scale-95
              shadow-[0_16px_40px_rgba(103,139,58,0.10)] transition-all duration-150
            "
          >
            <span className="text-4xl select-none text-[#111111]">{icon}</span>
            <span className="text-[#2c4318] font-semibold text-lg">{value}</span>
            <span className="text-[#76826a] text-xs">{sub}</span>
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <p
        className="text-[#809072] text-xs text-center max-w-[260px] fade-in-up"
        style={{ animationDelay: '0.3s' }}
      >
        ⚠️ Ứng dụng giải trí & tham khảo. Không phải lời khuyên chuyên nghiệp.
      </p>
    </div>
  )
}
