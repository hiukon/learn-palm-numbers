import TopNav from '@/components/TopNav'
import PalmReadingApp from '@/components/PalmReadingApp'

export default function PalmNumerologyPage() {
  return (
    <main className="palm-stage flex h-screen min-h-screen flex-col overflow-hidden text-slate-100">
      <TopNav />
      <div className="flex-1 min-h-0">
        <PalmReadingApp />
      </div>
    </main>
  )
}
