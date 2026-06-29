interface ResultPanelProps {
  text: string
  loading: boolean
  loadingMessage?: string
  onRetry: () => void
}

/* Simple inline markdown renderer — no external dependencies */
function parseLine(line: string, key: number) {
  const trimmed = line.trim()

  if (!trimmed) return <div key={key} className="h-2" />

  if (trimmed.startsWith('### ')) {
    return (
      <h4 key={key} className="text-[#5f9d31] font-semibold text-sm mt-4 mb-1">
        {inlineBold(trimmed.slice(4))}
      </h4>
    )
  }

  if (trimmed.startsWith('## ')) {
    return (
      <h3 key={key} className="flex items-center gap-2 text-[#2c4318] font-semibold text-base mt-5 mb-1.5">
        <span className="w-1 h-5 bg-[#6cad39] rounded-full flex-none" />
        {inlineBold(trimmed.slice(3))}
      </h3>
    )
  }

  if (trimmed.startsWith('# ')) {
    return (
      <h2 key={key} className="text-[#2c4318] font-bold text-lg mt-5 mb-2">
        {inlineBold(trimmed.slice(2))}
      </h2>
    )
  }

  if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    return (
      <div key={key} className="flex gap-2 text-[#4f5d45] text-sm leading-relaxed">
        <span className="flex-none text-[#6cad39] mt-0.5">•</span>
        <span>{inlineBold(trimmed.slice(2))}</span>
      </div>
    )
  }

  return (
    <p key={key} className="text-[#4f5d45] text-sm leading-relaxed">
      {inlineBold(trimmed)}
    </p>
  )
}

function inlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="text-[#243617] font-semibold">{part.slice(2, -2)}</strong>
      : part
  )
}

/* ── Loading state ──────────────────────────────────────────────── */

function LoadingState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 fade-in-up">
      {/* Crystal ball */}
      <div
        className="orb w-24 h-24 rounded-full flex items-center justify-center text-5xl select-none"
        style={{
          background: 'radial-gradient(circle at 35% 35%, #f8fff0, #dff0c8 58%, #bfdc97)',
          border: '1px solid rgba(108,173,57,0.22)',
        }}
      >
        🔮
      </div>

      {/* Dots */}
      <div className="flex items-center gap-2.5">
        <div className="dot" />
        <div className="dot" />
        <div className="dot" />
      </div>

      <div className="text-center space-y-1.5">
        <p className="text-[#2c4318] font-medium">{message}</p>
        <p className="text-[#6f7d64] text-sm">Có thể mất 10–20 giây</p>
      </div>
    </div>
  )
}

/* ── Result state ───────────────────────────────────────────────── */

export default function ResultPanel({ text, loading, loadingMessage = 'Đang đọc chỉ tay của bạn...', onRetry }: ResultPanelProps) {
  if (loading) return <LoadingState message={loadingMessage} />

  const lines = text.split('\n')

  return (
    <div className="flex flex-col min-h-full">

      {/* Header */}
      <div className="border-b border-[#d9e6cc] bg-[rgba(255,255,255,0.66)] px-4 pt-4 pb-3 backdrop-blur-xl slide-in-right">
        <div className="flex items-start gap-3">
          <span className="text-2xl mt-0.5 select-none">✋</span>
          <div>
            <h2 className="text-[#2c4318] font-semibold">Kết quả đọc chỉ tay</h2>
            <p className="text-[#6f7d64] text-xs mt-0.5">
              Phân tích bởi AI · Chỉ mang tính tham khảo
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="flex-1 bg-[linear-gradient(180deg,rgba(255,255,255,0.42),rgba(244,249,236,0.78))] px-4 py-4 space-y-1.5 slide-in-right"
        style={{ animationDelay: '0.08s' }}
      >
        {lines.map((line, i) => parseLine(line, i))}
      </div>

      {/* Retry button */}
      <div
        className="border-t border-[#d9e6cc] bg-[rgba(255,255,255,0.66)] px-4 py-4 backdrop-blur-xl safe-bottom slide-in-right"
        style={{ animationDelay: '0.16s' }}
      >
        <button
          onClick={onRetry}
          className="
            w-full py-3 rounded-2xl
            border border-[#b9d79b] text-[#5f9d31]
            font-medium text-sm
            hover:bg-[#f2f9e8] active:scale-[0.97]
            transition-all
          "
        >
          ↺ Chụp lại & đọc mới
        </button>
      </div>
    </div>
  )
}
