'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import TopNav from '@/components/TopNav'
import {
  getCalendarCells,
  getDayDetails,
  getLunarDateInfo,
  getLunarMonthName,
  getMonthLabel,
  getWeekdaysMondayFirst,
} from '@/lib/lunar'

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1)
const YEARS = Array.from({ length: 15 }, (_, index) => 2020 + index)

const AD_SLOTS = [
  {
    id: 'ads-highlight-top',
    size: 'Responsive / 336x280',
    minHeight: 'min-h-[280px]',
  },
  {
    id: 'ads-suggest-1',
    size: 'Responsive / 300x250',
    minHeight: 'min-h-[250px]',
  },
  {
    id: 'ads-suggest-2',
    size: 'Responsive / 300x250',
    minHeight: 'min-h-[250px]',
  },
  {
    id: 'ads-page-2',
    size: 'Responsive / 300x600',
    minHeight: 'min-h-[320px] lg:min-h-[600px]',
  },
]

function shiftMonth(month: number, year: number, delta: number) {
  const next = new Date(year, month - 1 + delta, 1)
  return { month: next.getMonth() + 1, year: next.getFullYear() }
}

export default function Home() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [selectedDate, setSelectedDate] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12))

  useEffect(() => {
    const clientNow = new Date()
    setMonth(clientNow.getMonth() + 1)
    setYear(clientNow.getFullYear())
    setSelectedDate(new Date(clientNow.getFullYear(), clientNow.getMonth(), clientNow.getDate(), 12))
  }, [])

  const cells = getCalendarCells(month, year)
  const details = getDayDetails(selectedDate)
  const selectedLunar = getLunarDateInfo(selectedDate)

  const handleMonthChange = (nextMonth: number, nextYear: number) => {
    setMonth(nextMonth)
    setYear(nextYear)
    setSelectedDate(new Date(nextYear, nextMonth - 1, 1, 12))
  }

  const handlePrevMonth = () => {
    const next = shiftMonth(month, year, -1)
    handleMonthChange(next.month, next.year)
  }

  const handleNextMonth = () => {
    const next = shiftMonth(month, year, 1)
    handleMonthChange(next.month, next.year)
  }

  return (
    <main className="safe-bottom min-h-screen bg-[#eef3e8] text-[#20251b]">
      <TopNav />

      <div className="mx-auto grid max-w-7xl gap-5 px-3 py-4 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:px-6 lg:py-7">
        <section className="space-y-4">
          <div className="overflow-hidden rounded-[8px] border border-[#d9e4c9] bg-white shadow-[0_20px_60px_rgba(79,109,38,0.08)]">
            <div className="bg-[linear-gradient(135deg,#f9fff0,#f1f8e9_55%,#e8f1d9)] px-4 py-4 sm:px-5 sm:py-5 md:px-7 md:py-6">
              <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="mt-1 text-xl font-bold text-[#2c4318] sm:mt-2 sm:text-2xl md:text-3xl">Lịch âm hôm nay</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-5 text-[#5a6b49] sm:leading-6">
                    Xem nhanh ngày dương lịch, âm lịch, can chi và các mốc đáng chú ý trong tháng.
                  </p>
                </div>

               
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-[22px] border border-[#d6e8bf] bg-white px-3 py-4 text-center shadow-[0_12px_30px_rgba(104,148,48,0.08)] sm:rounded-[26px] sm:px-5 sm:py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7ca449] sm:text-sm sm:tracking-[0.22em]">Dương lịch</div>
                  <div className="mt-2 text-4xl font-black leading-none text-[#6cad39] sm:mt-3 sm:text-6xl md:text-7xl">{selectedDate.getDate()}</div>
                  <div className="mt-2 text-xs leading-4 text-[#6a7460] sm:mt-3 sm:text-sm sm:leading-5">{getMonthLabel(selectedDate.getMonth() + 1, selectedDate.getFullYear())}</div>
                </div>

                <div className="rounded-[22px] border border-[#d6e8bf] bg-white px-3 py-4 text-center shadow-[0_12px_30px_rgba(104,148,48,0.08)] sm:rounded-[26px] sm:px-5 sm:py-5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7ca449] sm:text-sm sm:tracking-[0.22em]">Âm lịch</div>
                  <div className="mt-2 text-4xl font-black leading-none text-[#1d7b3c] sm:mt-3 sm:text-6xl md:text-7xl">{selectedLunar.day}</div>
                  <div className="mt-2 text-xs leading-4 text-[#6a7460] sm:mt-3 sm:text-sm sm:leading-5">
                    {getLunarMonthName(selectedLunar.month)} năm {details.canChiYear}
                  </div>
                  <div className="mt-1 text-[11px] font-semibold leading-4 text-[#ce3f2f] sm:text-xs">
                    {details.canChiDay} • {details.canChiMonth}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 border-t border-[#e8efdc] px-4 py-4 text-sm leading-6 text-[#4e5845] sm:px-5 sm:py-5 md:px-7">
              <div>
                <span className="font-semibold text-[#20251b]">Mệnh ngày:</span> {details.napAm}
              </div>
              <div>
                <span className="font-semibold text-[#20251b]">Giờ đẹp tham khảo:</span> {details.luckyHours.join(', ')}
              </div>
              <div>
                <span className="font-semibold text-[#20251b]">Tuổi xung:</span> {details.clashAges.join(', ')}
              </div>
              {(details.solarHoliday || details.lunarHoliday) && (
                <div className="rounded-2xl border border-[#f4d8b6] bg-[#fff7ed] px-4 py-3 text-[#8a4b16]">
                  {details.solarHoliday && <div>Sự kiện dương lịch: {details.solarHoliday}</div>}
                  {details.lunarHoliday && <div>Sự kiện âm lịch: {details.lunarHoliday}</div>}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-[8px] border border-[#dce6cf] bg-white shadow-[0_20px_60px_rgba(79,109,38,0.08)]">
            <div className="flex flex-col gap-4 bg-[#58b35a] px-4 py-3 text-white md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrevMonth}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-2xl font-black text-[#58b35a] transition hover:bg-[#f3f8ee]"
                >
                  ‹
                </button>
                <div>
                  <div className="text-xl font-black leading-none md:text-2xl">
                    THÁNG {String(month).padStart(2, '0')} - {year}
                  </div>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="grid h-10 w-10 place-items-center rounded-full bg-white text-2xl font-black text-[#58b35a] transition hover:bg-[#f3f8ee]"
                >
                  ›
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={month}
                  onChange={e => handleMonthChange(Number(e.target.value), year)}
                  className="rounded-md border border-[#d4dfca] bg-white px-3 py-2 text-sm font-medium text-[#2f3827] outline-none"
                >
                  {MONTHS.map(item => (
                    <option key={item} value={item}>Tháng {item}</option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={e => handleMonthChange(month, Number(e.target.value))}
                  className="rounded-md border border-[#d4dfca] bg-white px-3 py-2 text-sm font-medium text-[#2f3827] outline-none"
                >
                  {YEARS.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-[#d8ddd2] bg-[#fbfbfa] text-center text-sm font-medium text-[#666a61]">
              {getWeekdaysMondayFirst().map(weekday => (
                <div key={weekday} className="border-r border-[#e2e6dd] px-2 py-3 last:border-r-0">{weekday}</div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {cells.map((cell, index) => {
                const isSelected =
                  cell.date.getDate() === selectedDate.getDate() &&
                  cell.date.getMonth() === selectedDate.getMonth() &&
                  cell.date.getFullYear() === selectedDate.getFullYear()
                const isSunday = index % 7 === 6
                const isHoliday = Boolean(cell.solarHoliday || cell.lunarHoliday)
                const isSpecialSolar = isSunday || isHoliday
                const lunarLabel = cell.lunar.day === 1 ? `${cell.lunar.day}/${cell.lunar.month}` : cell.lunar.day
                const detailLabel = cell.solarHoliday ?? cell.lunarHoliday ?? cell.canChiDay
                const isLunarMonthStart = cell.lunar.day === 1

                return (
                  <button
                    key={cell.date.toISOString()}
                    onClick={() => setSelectedDate(cell.date)}
                    className={[
                      'relative min-h-[90px] border-b border-r border-[#d8ddd2] px-2.5 py-2.5 text-left transition md:min-h-[90px]',
                      cell.inCurrentMonth ? 'bg-white hover:bg-[#f8fbf4]' : 'bg-[#f7f7f5] text-[#b8bbb5]',
                      isSelected ? 'z-10 border-[#6cad39] bg-[#fde8c3] ring-2 ring-inset ring-[#6cad39]' : '',
                    ].join(' ')}
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-start gap-1.5">
                        <div
                          className={[
                            'text-[27px] font-black leading-none md:text-[24px] lg:text-[28px]',
                            !cell.inCurrentMonth
                              ? 'text-[#b8bbb5]'
                              : isSpecialSolar
                                ? 'text-[#df1111]'
                                : 'text-[#2e3135]',
                          ].join(' ')}
                        >
                          {String(cell.solarDay).padStart(2, '0')}
                        </div>
                        {(cell.isToday || !isSpecialSolar) && (
                          <span
                            className={[
                              'mt-1.5 h-1.5 w-1.5 rounded-full',
                              cell.inCurrentMonth ? 'bg-[#7bb33c]' : 'bg-[#b8bbb5]',
                            ].join(' ')}
                          />
                        )}
                      </div>

                      <div className="mt-auto space-y-1">
                        <div
                          className={[
                            'text-right text-[11px] font-medium leading-none',
                            !cell.inCurrentMonth
                              ? 'text-[#b8bbb5]'
                              : isLunarMonthStart || cell.lunarHoliday
                                ? 'text-[#df1111]'
                                : 'text-[#2e3135]',
                          ].join(' ')}
                        >
                          {lunarLabel}
                        </div>

                        <div
                          className={[
                            'text-center text-[12px] leading-4 md:text-[11px]',
                            !cell.inCurrentMonth
                              ? 'text-[#b8bbb5]'
                              : isHoliday
                                ? 'font-medium text-[#df1111]'
                                : 'text-[#666a61]',
                          ].join(' ')}
                        >
                          {detailLabel}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex flex-wrap items-center gap-5 px-4 py-4 text-sm text-[#69735d]">
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#6cad39]" /> Hôm nay</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#d83b2d]" /> Ngày có sự kiện</div>
              <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-[#f4c47d]" /> Ngày đang chọn</div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          {AD_SLOTS.map(slot => (
            <section
              key={slot.id}
              className="overflow-hidden rounded-[28px] border border-[#dce7cf] bg-white p-4 shadow-[0_18px_50px_rgba(79,109,38,0.08)]"
            >
              <div
                id={slot.id}
                className={[
                  'flex w-full flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#c8dbb1] bg-[linear-gradient(180deg,#f8fbf4,#eef5e6)] px-5 py-6 text-center',
                  slot.minHeight,
                ].join(' ')}
              >
                <div className="text-sm font-medium text-[#6f7d60]">{slot.size}</div>
                <div className="mt-4 w-full rounded-[20px] border border-[#d9e8c8] bg-white/85 px-4 py-4 text-left text-sm leading-6 text-[#5d6a4f]">
                  Dat ma Google Ads vao day
                </div>
              </div>
            </section>
          ))}
        </aside>
      </div>
    </main>
  )
}
