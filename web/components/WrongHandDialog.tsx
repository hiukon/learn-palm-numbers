interface WrongHandDialogProps {
  detectedVi: string   // "tay phải"
  expectedVi: string   // "tay trái"
  onRetake: () => void
  onContinue: () => void
}

export default function WrongHandDialog({
  detectedVi,
  expectedVi,
  onRetake,
  onContinue,
}: WrongHandDialogProps) {
  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-black/70 backdrop-blur-sm safe-bottom">
      <div className="w-full max-w-sm bg-[#0f0f1f] border border-amber-700/50 rounded-3xl overflow-hidden fade-in-up">

        {/* Icon + header */}
        <div className="px-6 pt-6 pb-4 flex items-start gap-4">
          <div className="flex-none w-12 h-12 rounded-2xl bg-amber-900/40 flex items-center justify-center text-2xl">
            ✋
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">Sai tay rồi!</h3>
            <p className="text-amber-400 text-sm mt-0.5">
              Hệ thống phát hiện đây là <strong>{detectedVi}</strong>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-5">
          <p className="text-slate-400 text-sm leading-relaxed">
            Với giới tính bạn đã chọn, vui lòng đưa{' '}
            <strong className="text-white">{expectedVi}</strong> (lòng tay ngửa lên)
            vào camera và thử lại.
          </p>

          {/* Illustration hint */}
          <div className="mt-4 p-3 rounded-2xl bg-[#1a1a2e] flex items-center gap-3">
            <span className="text-3xl select-none">
              {expectedVi === 'tay trái' ? '🫲' : '🫱'}
            </span>
            <p className="text-slate-500 text-xs leading-snug">
              Xoay ngửa lòng <strong className="text-slate-300">{expectedVi}</strong>,
              các đường chỉ tay hướng về camera
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 pb-5 flex flex-col gap-2">
          <button
            onClick={onRetake}
            className="
              w-full py-3.5 rounded-2xl font-semibold text-white
              bg-gradient-to-r from-cyan-600 to-indigo-600
              hover:from-cyan-500 hover:to-indigo-500
              active:scale-[0.97] transition-all
            "
          >
            📷 Chụp lại với {expectedVi}
          </button>
          <button
            onClick={onContinue}
            className="
              w-full py-3 rounded-2xl text-slate-500 text-sm
              hover:text-slate-300 active:scale-[0.97] transition-all
            "
          >
            Tiếp tục với ảnh hiện tại dù sao
          </button>
        </div>
      </div>
    </div>
  )
}
