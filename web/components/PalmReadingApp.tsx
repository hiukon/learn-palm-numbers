'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import GenderSelect from '@/components/GenderSelect'
import HandCapture from '@/components/HandCapture'
import HandScanner from '@/components/HandScanner'
import ResultPanel from '@/components/ResultPanel'
import WrongHandDialog from '@/components/WrongHandDialog'

type Phase = 'gender' | 'capture' | 'preprocessing' | 'scanning' | 'result' | 'error'

interface WrongHandInfo {
  detected_vi: string
  expected_vi: string
  roi_b64: string
}

function dataURLToBlob(dataUrl: string): Blob {
  const [header, b64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg'
  const binary = atob(b64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) arr[i] = binary.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

export default function PalmReadingApp() {
  const [phase, setPhase] = useState<Phase>('gender')
  const [gender, setGender] = useState<'Nam' | 'Nữ'>('Nam')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [roiImage, setRoiImage] = useState<string | null>(null)
  const [resultText, setResultText] = useState('')
  const [extraQ, setExtraQ] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [wrongHand, setWrongHand] = useState<WrongHandInfo | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const handLabel = gender === 'Nam' ? 'tay trái' : 'tay phải'
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

  const cancelInFlight = useCallback(() => {
    requestIdRef.current += 1
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  const isAbortError = (error: unknown) =>
    error instanceof Error && (error.name === 'AbortError' || error.message === 'The operation was aborted.')

  useEffect(() => () => cancelInFlight(), [cancelInFlight])

  const runPreprocess = useCallback(async (dataUrl: string, signal: AbortSignal): Promise<string | null> => {
    const fd = new FormData()
    fd.append('file', dataURLToBlob(dataUrl), 'hand.jpg')
    fd.append('gender', gender)

    const res = await fetch(`${apiUrl}/api/preprocess`, { method: 'POST', body: fd, signal })
    const data = await res.json()

    if (!res.ok) throw new Error(data.detail ?? `Lỗi ${res.status}`)

    const b64: string = data.roi_image
    setRoiImage(`data:image/jpeg;base64,${b64}`)

    if (data.wrong_hand) {
      setWrongHand({
        detected_vi: data.detected_vi,
        expected_vi: data.expected_vi,
        roi_b64: b64,
      })
      return null
    }
    return b64
  }, [gender, apiUrl])

  const runReadPalm = useCallback(async (b64: string, signal: AbortSignal) => {
    setPhase('scanning')

    const fd = new FormData()
    fd.append('roi_b64', b64)
    fd.append('gender', gender)
    fd.append('extra_question', extraQ.trim())

    const res = await fetch(`${apiUrl}/api/read-palm`, { method: 'POST', body: fd, signal })
    const data = await res.json()

    if (!res.ok) throw new Error(data.detail ?? `Lỗi ${res.status}`)

    setResultText(data.result ?? '')
    setPhase('result')
  }, [gender, extraQ, apiUrl])

  const handleAnalyze = useCallback(async (dataUrl: string) => {
    cancelInFlight()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current

    setCapturedImage(dataUrl)
    setRoiImage(null)
    setResultText('')
    setErrorMsg('')
    setWrongHand(null)
    setPhase('preprocessing')

    try {
      const b64 = await runPreprocess(dataUrl, controller.signal)
      if (requestId !== requestIdRef.current) return
      if (b64 === null) {
        setPhase('capture')
        return
      }
      await runReadPalm(b64, controller.signal)
      if (requestId === requestIdRef.current) {
        abortRef.current = null
      }
    } catch (e) {
      if (isAbortError(e) || requestId !== requestIdRef.current) return
      setErrorMsg(e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định')
      setPhase('error')
    }
  }, [cancelInFlight, runPreprocess, runReadPalm])

  const handleForce = useCallback(async () => {
    if (!wrongHand) return
    cancelInFlight()
    const controller = new AbortController()
    abortRef.current = controller
    const requestId = ++requestIdRef.current
    setWrongHand(null)
    setPhase('scanning')
    try {
      await runReadPalm(wrongHand.roi_b64, controller.signal)
      if (requestId === requestIdRef.current) {
        abortRef.current = null
      }
    } catch (e) {
      if (isAbortError(e) || requestId !== requestIdRef.current) return
      setErrorMsg(e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định')
      setPhase('error')
    }
  }, [cancelInFlight, wrongHand, runReadPalm])

  const handleRetry = () => {
    cancelInFlight()
    setCapturedImage(null)
    setRoiImage(null)
    setResultText('')
    setErrorMsg('')
    setWrongHand(null)
    setPhase('capture')
  }

  const handleBackToGender = () => {
    cancelInFlight()
    setCapturedImage(null)
    setRoiImage(null)
    setResultText('')
    setErrorMsg('')
    setWrongHand(null)
    setPhase('gender')
  }

  if (phase === 'gender') {
    return (
      <div className="h-full min-h-0">
        <GenderSelect onSelect={g => { setGender(g); setPhase('capture') }} />
      </div>
    )
  }

  if (phase === 'capture') {
    return (
      <div className="relative h-full min-h-0">
        <HandCapture
          handLabel={handLabel}
          extraQ={extraQ}
          onExtraQChange={setExtraQ}
          onAnalyze={handleAnalyze}
          onBack={handleBackToGender}
        />
        {wrongHand && (
          <WrongHandDialog
            detectedVi={wrongHand.detected_vi}
            expectedVi={wrongHand.expected_vi}
            onRetake={() => setWrongHand(null)}
            onContinue={handleForce}
          />
        )}
      </div>
    )
  }

  if (phase === 'error') {
    return (
      <div className="flex h-full min-h-0 flex-col items-center justify-center gap-5 bg-transparent p-8 text-[#2b3325] safe-top safe-bottom">
        <div className="text-5xl">⚠️</div>
        <h2 className="text-xl font-semibold text-red-500 text-center">Đã xảy ra lỗi</h2>
        <p className="text-[#5e6b54] text-center text-sm leading-relaxed">{errorMsg}</p>
        <button
          onClick={handleRetry}
          className="px-8 py-3 bg-[#6cad39] hover:bg-[#5e9d30] active:scale-95 rounded-2xl text-white font-semibold transition-all"
        >
          Thử lại
        </button>
      </div>
    )
  }

  const isScanning = phase === 'scanning'
  const isPreprocessing = phase === 'preprocessing'
  const displayImage = roiImage ?? capturedImage

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <div className="flex-none flex items-center gap-3 border-b border-[#d9e6cc] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-[#4f5b45] backdrop-blur-xl safe-top">
        <button
          onClick={handleRetry}
          className="text-[#6a765f] hover:text-[#2c4318] text-sm active:scale-90 transition-all px-1 py-1"
        >
          ← Chụp lại
        </button>
        <span className="text-[#6f7c63] text-xs">
          {isPreprocessing ? 'Đang nhận diện bàn tay...' : isScanning ? 'Đang phân tích...' : 'Kết quả'}
        </span>
      </div>

      <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
        <div className="flex-none h-[42vh] md:h-full md:w-[42%] bg-[#050712]/35 flex items-center justify-center p-3 md:p-5">
          {displayImage && (
            <HandScanner
              imageUrl={displayImage}
              scanning={isScanning}
              preprocessing={isPreprocessing}
            />
          )}
        </div>

        <div className="flex-none h-px md:h-auto md:w-px bg-[#d9e6cc]" />

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth-ios bg-[rgba(255,255,255,0.56)] backdrop-blur-md">
          <ResultPanel
            text={resultText}
            loading={isScanning || isPreprocessing}
            loadingMessage={isPreprocessing ? 'Đang nhận diện bàn tay...' : 'Đang đọc chỉ tay của bạn...'}
            onRetry={handleRetry}
          />
        </div>
      </div>
    </div>
  )
}
