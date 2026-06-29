'use client'

import { useRef, useState } from 'react'

/** Convert any image (incl. HEIC) to a JPEG data URL via canvas, max 1920px wide */
function toJpegDataURL(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const MAX = 1920
      const scale = img.width > MAX ? MAX / img.width : 1
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.92))
    }
    img.onerror = reject
    img.src = src
  })
}

interface HandCaptureProps {
  handLabel: string
  extraQ: string
  onExtraQChange: (v: string) => void
  onAnalyze: (dataUrl: string) => void
  onBack: () => void
}

export default function HandCapture({
  handLabel,
  extraQ,
  onExtraQChange,
  onAnalyze,
  onBack,
}: HandCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async e => {
      const raw = e.target?.result as string
      // Convert to JPEG via canvas so OpenCV can always decode it (handles HEIC, WEBP, etc.)
      const jpeg = await toJpegDataURL(raw).catch(() => raw)
      setPreview(jpeg)
    }
    reader.readAsDataURL(file)
  }

  const clearInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) ref.current.value = ''
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent safe-top">

      {/* Header */}
      <div className="flex-none flex items-center gap-3 border-b border-[#d9e6cc] bg-[rgba(255,255,255,0.72)] px-4 py-3 backdrop-blur-xl">
        <button
          onClick={onBack}
          className="text-[#6b775e] hover:text-[#2c4318] active:scale-90 transition-all text-sm px-1 py-1"
        >
          ←
        </button>
        <h2 className="text-[#2c4318] font-semibold">
          Chụp <span className="text-[#5f9d31]">{handLabel}</span>
        </h2>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overscroll-contain scroll-smooth-ios px-4 py-4 flex flex-col gap-4">

        {/* Instruction card */}
        <div className="rounded-2xl border border-[#d9e6cc] bg-[linear-gradient(135deg,rgba(255,255,255,0.88),rgba(243,248,235,0.82))] p-4 shadow-[0_14px_36px_rgba(103,139,58,0.10)] backdrop-blur-xl fade-in-up">
          <p className="text-[#5f9d31] text-sm font-medium mb-2">📌 Hướng dẫn</p>
          <ul className="text-[#5e6b54] text-sm space-y-1.5">
            <li>• Đưa lòng <strong className="text-[#2c4318]">{handLabel}</strong> ngửa hướng về camera</li>
            <li>• Ánh sáng tốt, rõ các đường chỉ tay</li>
            <li>• Giữ tay thẳng, không che ngón tay</li>
          </ul>
        </div>

        {/* Preview area */}
        <div
          className="
            relative rounded-2xl overflow-hidden
            border border-white/10 shadow-[0_18px_48px_rgba(0,0,0,0.28)] fade-in-up
          "
          style={{
            background: preview
              ? '#0a0a14'
              : 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(241,248,233,0.96))',
            animationDelay: '0.08s',
          }}
          
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              {/* Reset button */}
              <button
                onClick={() => setPreview(null)}
                className="
                  absolute top-3 right-3
                  bg-black/60 hover:bg-black/80
                  rounded-full w-8 h-8 flex items-center justify-center
                  text-white text-sm active:scale-90 transition-all
                "
              >
                ✕
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[#91a081]">
              <div className="text-5xl select-none">🤚</div>
              <p className="text-sm font-medium text-[#6d7b61]">Chưa có ảnh</p>
            </div>
          )}
        </div>

        {/* Capture / Upload OR Analyze */}
        {preview ? (
          <div className="fade-in-up" style={{ animationDelay: '0.14s' }}>
            <button
              onClick={() => onAnalyze(preview)}
              className="
                w-full py-4 rounded-2xl font-semibold text-white text-base
                bg-gradient-to-r from-[#6cad39] to-[#88bf4f]
                hover:from-[#5f9d31] hover:to-[#7fb546]
                active:scale-[0.97]
                transition-all duration-200
              "
            >
              ✨ Đọc chỉ tay
            </button>
          </div>
        ) : (
          <div className="flex gap-3 fade-in-up" style={{ animationDelay: '0.14s' }}>
            <button
              onClick={() => { clearInput(cameraRef); cameraRef.current?.click() }}
              className="
                flex-1 flex items-center justify-center gap-2
                py-3.5 rounded-2xl
                bg-[rgba(255,255,255,0.72)] border border-[#d9e6cc]
                hover:border-[#8ec15a] hover:bg-[rgba(246,250,240,0.95)]
                active:scale-95 transition-all
                text-[#2f3827] text-sm font-medium
              "
            >
              📷 Chụp ảnh
            </button>
            <button
              onClick={() => { clearInput(galleryRef); galleryRef.current?.click() }}
              className="
                flex-1 flex items-center justify-center gap-2
                py-3.5 rounded-2xl
                bg-[rgba(255,255,255,0.72)] border border-[#d9e6cc]
                hover:border-[#8ec15a] hover:bg-[rgba(246,250,240,0.95)]
                active:scale-95 transition-all
                text-[#2f3827] text-sm font-medium
              "
            >
              🖼 Tải ảnh lên
            </button>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files?.[0])}
        />

        {/* Extra question */}
        <div className="fade-in-up" style={{ animationDelay: '0.2s' }}>
          <label className="text-[#7b866f] text-xs mb-2 block tracking-wide uppercase">
            Câu hỏi thêm (tùy chọn)
          </label>
          <input
            type="text"
            value={extraQ}
            onChange={e => onExtraQChange(e.target.value)}
            placeholder="Vd: Tôi có duyên kinh doanh không?"
            className="
              w-full border border-[#d9e6cc]
              focus:border-[#86ba54] focus:outline-none
              rounded-2xl px-4 py-3
              text-[#2f3827] text-sm placeholder-[#9aa58f]
              transition-colors bg-[rgba(255,255,255,0.82)]
            "
          />
        </div>
      </div>

      <div className="flex-none h-4 safe-bottom" />
    </div>
  )
}
