declare module 'lunar-calendar' {
  export interface SolarToLunarResult {
    zodiac: string
    GanZhiYear: string
    GanZhiMonth: string
    GanZhiDay: string
    worktime: number
    term?: string
    lunarYear: number
    lunarMonth: number
    lunarDay: number
    lunarMonthName: string
    lunarDayName: string
    lunarLeapMonth: number
    solarFestival?: string
    lunarFestival?: string
  }

  export interface CalendarMonthItem extends SolarToLunarResult {
    year: number
    month: number
    day: number
  }

  export interface CalendarResult {
    firstDay: number
    monthDays: number
    monthData: CalendarMonthItem[]
  }

  export function solarToLunar(year: number, month: number, day: number): SolarToLunarResult
  export function lunarToSolar(year: number, month: number, day: number): { year: number; month: number; day: number }
  export function calendar(year: number, month: number, fill?: boolean): CalendarResult
  export function solarCalendar(year: number, month: number, fill?: boolean): CalendarResult
  export function setWorktime(data: unknown): void
  export function getSolarMonthDays(year: number, month: number): number
}
