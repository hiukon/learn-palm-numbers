interface HandScannerProps {
  imageUrl: string
  scanning: boolean
  preprocessing?: boolean
}

export default function HandScanner({ imageUrl, scanning, preprocessing = false }: HandScannerProps) {
  const active = scanning || preprocessing

  return (
    <div className="relative w-full h-full scan-container rounded-2xl bg-black">

      {/* Hand image */}
      <img
        src={imageUrl}
        alt="Bàn tay"
        className="w-full h-full object-contain transition-all duration-700"
        style={{
          filter: scanning
            ? 'brightness(0.72) saturate(1.5) hue-rotate(-8deg)'
            : preprocessing
            ? 'brightness(0.85)'
            : 'none',
        }}
      />

      {/* Preprocessing: subtle pulse overlay only */}
      {preprocessing && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'rgba(34,211,238,0.05)', animation: 'orb-glow 1.5s ease-in-out infinite' }}
        />
      )}

      {/* Scanning: full animation */}
      {scanning && (
        <>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'rgba(8,50,70,0.18)', mixBlendMode: 'screen' }}
          />
          <div className="scan-line" />
          {/* Bottom label */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
            <div style={{ height: 64, background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <span className="text-cyan-400 text-[10px] font-mono tracking-[0.35em] animate-pulse select-none">
                ĐANG PHÂN TÍCH
              </span>
            </div>
          </div>
        </>
      )}

      {/* Corner brackets — animated when active */}
      <div className={`corner corner-tl ${active ? '' : 'static'}`} />
      <div className={`corner corner-tr ${active ? '' : 'static'}`} />
      <div className={`corner corner-bl ${active ? '' : 'static'}`} />
      <div className={`corner corner-br ${active ? '' : 'static'}`} />

      {/* Preprocessing label */}
      {preprocessing && (
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <div style={{ height: 64, background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }} />
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <span className="text-cyan-500 text-[10px] font-mono tracking-[0.3em] animate-pulse select-none">
              NHẬN DIỆN BÀN TAY
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
