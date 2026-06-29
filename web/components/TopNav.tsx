'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITEMS = [
  { href: '/', label: 'Lịch âm hôm nay' },
  { href: '/chi-tay-so-hoc', label: 'Chỉ tay số học' },
]

export default function TopNav() {
  const pathname = usePathname()

  return (
    <div className="safe-top bg-[#6cad39] text-white shadow-[0_8px_24px_rgba(88,147,37,0.35)]">
      <div className="mx-auto grid max-w-7xl items-center gap-4 px-4 py-3 sm:justify-items-center lg:grid-cols-[1fr_auto_1fr] lg:px-6">
        <Link href="/" className="flex items-center gap-3 sm:text-center lg:justify-self-start lg:text-left">
          <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-white/25 bg-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
            <Image src="/am-duong.svg" alt="Biểu tượng âm dương" width={36} height={36} priority />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/80">Âm dương</div>
            <div className="text-lg font-bold leading-none">Tử vi số học</div>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-3">
          {ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'min-w-[150px] rounded-full px-5 py-2 text-center text-sm font-semibold transition-all',
                  active ? 'bg-white text-[#4f8d24]' : 'bg-white/12 text-white hover:bg-white/22',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden lg:block" aria-hidden="true" />
      </div>
    </div>
  )
}
