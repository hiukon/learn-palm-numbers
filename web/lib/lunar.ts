import { calendar, solarToLunar } from 'lunar-calendar'

const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'] as const
const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'] as const
const STEMS = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'] as const

const SOLAR_HOLIDAYS: Record<string, string> = {
  '1-1': 'Tết Dương lịch',
  '14-2': 'Valentine',
  '30-4': 'Ngày Giải phóng',
  '1-5': 'Quốc tế Lao động',
  '1-6': 'Quốc tế Thiếu nhi',
  '2-9': 'Quốc khánh',
  '20-10': 'Phụ nữ Việt Nam',
  '20-11': 'Nhà giáo Việt Nam',
  '24-12': 'Giáng sinh',
}

const LUNAR_HOLIDAYS: Record<string, string> = {
  '1-1': 'Tết Nguyên đán',
  '15-1': 'Rằm tháng Giêng',
  '10-3': 'Giỗ Tổ Hùng Vương',
  '15-4': 'Lễ Phật Đản',
  '5-5': 'Tết Đoan Ngọ',
  '15-7': 'Vu Lan',
  '15-8': 'Tết Trung Thu',
  '23-12': 'Ông Công Ông Táo',
}

const CN_TO_VI: Record<string, string> = {
  甲: 'Giáp',
  乙: 'Ất',
  丙: 'Bính',
  丁: 'Đinh',
  戊: 'Mậu',
  己: 'Kỷ',
  庚: 'Canh',
  辛: 'Tân',
  壬: 'Nhâm',
  癸: 'Quý',
  子: 'Tý',
  丑: 'Sửu',
  寅: 'Dần',
  卯: 'Mão',
  辰: 'Thìn',
  巳: 'Tỵ',
  午: 'Ngọ',
  未: 'Mùi',
  申: 'Thân',
  酉: 'Dậu',
  戌: 'Tuất',
  亥: 'Hợi',
  鼠: 'Chuột',
  牛: 'Trâu',
  虎: 'Hổ',
  兔: 'Mèo',
  龙: 'Rồng',
  蛇: 'Rắn',
  马: 'Ngựa',
  羊: 'Dê',
  猴: 'Khỉ',
  鸡: 'Gà',
  狗: 'Chó',
  猪: 'Heo',
  闰: 'Nhuận ',
  月: ' tháng',
  正: 'Giêng',
  一: 'Một',
  二: 'Hai',
  三: 'Ba',
  四: 'Tư',
  五: 'Năm',
  六: 'Sáu',
  七: 'Bảy',
  八: 'Tám',
  九: 'Chín',
  十: 'Mười',
  十一: 'Mười một',
  十二: 'Mười hai',
}

const CN_FESTIVAL_TO_VI: Record<string, string> = {
  春节: 'Tết Nguyên đán',
  元宵节: 'Tết Nguyên tiêu',
  龙抬头节: 'Tết rồng ngẩng đầu',
  妈祖生辰: 'Vía Mazu',
  端午节: 'Tết Đoan Ngọ',
  七夕情人节: 'Thất Tịch',
  中元节: 'Trung nguyên',
  中秋节: 'Tết Trung Thu',
  重阳节: 'Tết Trùng Cửu',
  下元节: 'Tết Hạ nguyên',
  腊八节: 'Lễ Lạp Bát',
  小年: 'Ông Công Ông Táo',
  除夕: 'Giao thừa',
  小寒: 'Tiểu hàn',
  大寒: 'Đại hàn',
  立春: 'Lập xuân',
  雨水: 'Vũ thủy',
  惊蛰: 'Kinh trập',
  春分: 'Xuân phân',
  清明: 'Thanh minh',
  谷雨: 'Cốc vũ',
  立夏: 'Lập hạ',
  小满: 'Tiểu mãn',
  芒种: 'Mang chủng',
  夏至: 'Hạ chí',
  小暑: 'Tiểu thử',
  大暑: 'Đại thử',
  立秋: 'Lập thu',
  处暑: 'Xử thử',
  白露: 'Bạch lộ',
  秋分: 'Thu phân',
  寒露: 'Hàn lộ',
  霜降: 'Sương giáng',
  立冬: 'Lập đông',
  小雪: 'Tiểu tuyết',
  大雪: 'Đại tuyết',
  冬至: 'Đông chí',
}

const NAP_AM_BY_PAIR: Record<string, string> = {
  'Giáp Tý': 'Hải Trung Kim',
  'Ất Sửu': 'Hải Trung Kim',
  'Bính Dần': 'Lư Trung Hỏa',
  'Đinh Mão': 'Lư Trung Hỏa',
  'Mậu Thìn': 'Đại Lâm Mộc',
  'Kỷ Tỵ': 'Đại Lâm Mộc',
  'Canh Ngọ': 'Lộ Bàng Thổ',
  'Tân Mùi': 'Lộ Bàng Thổ',
  'Nhâm Thân': 'Kiếm Phong Kim',
  'Quý Dậu': 'Kiếm Phong Kim',
  'Giáp Tuất': 'Sơn Đầu Hỏa',
  'Ất Hợi': 'Sơn Đầu Hỏa',
  'Bính Tý': 'Giản Hạ Thủy',
  'Đinh Sửu': 'Giản Hạ Thủy',
  'Mậu Dần': 'Thành Đầu Thổ',
  'Kỷ Mão': 'Thành Đầu Thổ',
  'Canh Thìn': 'Bạch Lạp Kim',
  'Tân Tỵ': 'Bạch Lạp Kim',
  'Nhâm Ngọ': 'Dương Liễu Mộc',
  'Quý Mùi': 'Dương Liễu Mộc',
  'Giáp Thân': 'Tuyền Trung Thủy',
  'Ất Dậu': 'Tuyền Trung Thủy',
  'Bính Tuất': 'Ốc Thượng Thổ',
  'Đinh Hợi': 'Ốc Thượng Thổ',
  'Mậu Tý': 'Tích Lịch Hỏa',
  'Kỷ Sửu': 'Tích Lịch Hỏa',
  'Canh Dần': 'Tùng Bách Mộc',
  'Tân Mão': 'Tùng Bách Mộc',
  'Nhâm Thìn': 'Trường Lưu Thủy',
  'Quý Tỵ': 'Trường Lưu Thủy',
  'Giáp Ngọ': 'Sa Trung Kim',
  'Ất Mùi': 'Sa Trung Kim',
  'Bính Thân': 'Sơn Hạ Hỏa',
  'Đinh Dậu': 'Sơn Hạ Hỏa',
  'Mậu Tuất': 'Bình Địa Mộc',
  'Kỷ Hợi': 'Bình Địa Mộc',
  'Canh Tý': 'Bích Thượng Thổ',
  'Tân Sửu': 'Bích Thượng Thổ',
  'Nhâm Dần': 'Kim Bạch Kim',
  'Quý Mão': 'Kim Bạch Kim',
  'Giáp Thìn': 'Phú Đăng Hỏa',
  'Ất Tỵ': 'Phú Đăng Hỏa',
  'Bính Ngọ': 'Thiên Hà Thủy',
  'Đinh Mùi': 'Thiên Hà Thủy',
  'Mậu Thân': 'Đại Trạch Thổ',
  'Kỷ Dậu': 'Đại Trạch Thổ',
  'Canh Tuất': 'Thoa Xuyến Kim',
  'Tân Hợi': 'Thoa Xuyến Kim',
  'Nhâm Tý': 'Tang Đố Mộc',
  'Quý Sửu': 'Tang Đố Mộc',
  'Giáp Dần': 'Đại Khê Thủy',
  'Ất Mão': 'Đại Khê Thủy',
  'Bính Thìn': 'Sa Trung Thổ',
  'Đinh Tỵ': 'Sa Trung Thổ',
  'Mậu Ngọ': 'Thiên Thượng Hỏa',
  'Kỷ Mùi': 'Thiên Thượng Hỏa',
  'Canh Thân': 'Thạch Lựu Mộc',
  'Tân Dậu': 'Thạch Lựu Mộc',
  'Nhâm Tuất': 'Đại Hải Thủy',
  'Quý Hợi': 'Đại Hải Thủy',
}

const LUCKY_HOURS_BY_DAY_CHI: Record<string, string[]> = {
  'Tý': ['Tý (23h-1h)', 'Sửu (1h-3h)', 'Mão (5h-7h)', 'Ngọ (11h-13h)', 'Thân (15h-17h)', 'Dậu (17h-19h)'],
  'Sửu': ['Dần (3h-5h)', 'Mão (5h-7h)', 'Tỵ (9h-11h)', 'Thân (15h-17h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
  'Dần': ['Tý (23h-1h)', 'Sửu (1h-3h)', 'Thìn (7h-9h)', 'Tỵ (9h-11h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)'],
  'Mão': ['Dần (3h-5h)', 'Mão (5h-7h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Dậu (17h-19h)', 'Tý (23h-1h)'],
  'Thìn': ['Thìn (7h-9h)', 'Tỵ (9h-11h)', 'Thân (15h-17h)', 'Dậu (17h-19h)', 'Hợi (21h-23h)', 'Dần (3h-5h)'],
  'Tỵ': ['Sửu (1h-3h)', 'Thìn (7h-9h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
  'Ngọ': ['Tý (23h-1h)', 'Sửu (1h-3h)', 'Mão (5h-7h)', 'Ngọ (11h-13h)', 'Thân (15h-17h)', 'Dậu (17h-19h)'],
  'Mùi': ['Dần (3h-5h)', 'Mão (5h-7h)', 'Tỵ (9h-11h)', 'Thân (15h-17h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
  'Thân': ['Tý (23h-1h)', 'Sửu (1h-3h)', 'Thìn (7h-9h)', 'Tỵ (9h-11h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)'],
  'Dậu': ['Dần (3h-5h)', 'Mão (5h-7h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Dậu (17h-19h)', 'Tý (23h-1h)'],
  'Tuất': ['Thìn (7h-9h)', 'Tỵ (9h-11h)', 'Thân (15h-17h)', 'Dậu (17h-19h)', 'Hợi (21h-23h)', 'Dần (3h-5h)'],
  'Hợi': ['Sửu (1h-3h)', 'Thìn (7h-9h)', 'Ngọ (11h-13h)', 'Mùi (13h-15h)', 'Tuất (19h-21h)', 'Hợi (21h-23h)'],
}

export interface LunarDateInfo {
  day: number
  month: number
  year: number
  leapMonth: number
  monthName: string
  dayName: string
}

export interface DayDetails {
  solarLabel: string
  lunarLabel: string
  weekdayLabel: string
  canChiDay: string
  canChiMonth: string
  canChiYear: string
  zodiac: string
  napAm: string
  luckyHours: string[]
  clashAges: string[]
  term?: string
  solarHoliday?: string
  lunarHoliday?: string
}

export interface CalendarCell {
  date: Date
  solarDay: number
  lunar: LunarDateInfo
  canChiDay: string
  inCurrentMonth: boolean
  isToday: boolean
  solarHoliday?: string
  lunarHoliday?: string
}

function makeLocalDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day, 12)
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

export function getWeekdaysMondayFirst() {
  return ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật']
}

export function getMonthLabel(month: number, year: number) {
  return `Tháng ${pad(month)} năm ${year}`
}

export function getLunarDateInfo(date: Date): LunarDateInfo {
  const info = solarToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate())

  return {
    day: info.lunarDay,
    month: info.lunarMonth,
    year: info.lunarYear,
    leapMonth: info.lunarLeapMonth,
    monthName: getLunarMonthName(info.lunarMonth),
    dayName: `Ngày ${info.lunarDay}`,
  }
}

export function getDayDetails(date: Date): DayDetails {
  const lunar = solarToLunar(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const canChiDay = normalizeCanChi(lunar.GanZhiDay)
  const canChiMonth = normalizeCanChi(lunar.GanZhiMonth)
  const canChiYear = normalizeCanChi(lunar.GanZhiYear)
  const [dayCan, dayChi] = canChiDay.split(' ')

  return {
    solarLabel: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
    lunarLabel: `${lunar.lunarDay}/${lunar.lunarMonth}/${lunar.lunarYear}${lunar.lunarLeapMonth ? ' (nhuận)' : ''}`,
    weekdayLabel: WEEKDAYS[date.getDay()],
    canChiDay,
    canChiMonth,
    canChiYear,
    zodiac: normalizeZodiac(lunar.zodiac),
    napAm: NAP_AM_BY_PAIR[`${dayCan} ${dayChi}`] ?? 'Đang cập nhật',
    luckyHours: LUCKY_HOURS_BY_DAY_CHI[dayChi] ?? [],
    clashAges: getClashAges(dayChi),
    term: normalizeFestivalOrTerm(lunar.term),
    solarHoliday:
      normalizeFestivalOrTerm(lunar.solarFestival) ??
      SOLAR_HOLIDAYS[`${date.getDate()}-${date.getMonth() + 1}`],
    lunarHoliday:
      normalizeFestivalOrTerm(lunar.lunarFestival) ??
      LUNAR_HOLIDAYS[`${lunar.lunarDay}-${lunar.lunarMonth}`],
  }
}

function getClashAges(dayChi: string) {
  const index = CHI.indexOf(dayChi as (typeof CHI)[number])
  const opposite = CHI[(index + 6) % 12]
  const harm = CHI[(index + 3) % 12]
  return [dayChi, opposite, harm]
}

export function getCalendarCells(month: number, year: number): CalendarCell[] {
  const today = new Date()
  const monthData = calendar(year, month, true).monthData

  return monthData.map(item => {
    const date = makeLocalDate(item.year, item.month, item.day)
    return {
      date,
      solarDay: item.day,
      lunar: {
        day: item.lunarDay,
        month: item.lunarMonth,
        year: item.lunarYear,
        leapMonth: item.lunarLeapMonth,
        monthName: getLunarMonthName(item.lunarMonth),
        dayName: `Ngày ${item.lunarDay}`,
      },
      canChiDay: normalizeCanChi(item.GanZhiDay),
      inCurrentMonth: item.month === month,
      isToday:
        item.day === today.getDate() &&
        item.month === today.getMonth() + 1 &&
        item.year === today.getFullYear(),
      solarHoliday: normalizeFestivalOrTerm(item.solarFestival) ?? SOLAR_HOLIDAYS[`${item.day}-${item.month}`],
      lunarHoliday:
        normalizeFestivalOrTerm(item.lunarFestival) ??
        LUNAR_HOLIDAYS[`${item.lunarDay}-${item.lunarMonth}`],
    }
  })
}

export function getLunarMonthName(month: number) {
  return `Tháng ${month}`
}

function normalizeCanChi(value: string) {
  if (!value) return value

  let normalized = value
  Object.entries(CN_TO_VI).forEach(([key, replacement]) => {
    normalized = normalized.replaceAll(key, replacement)
  })

  for (const stem of STEMS) {
    for (const chi of CHI) {
      normalized = normalized.replaceAll(`${stem}${chi}`, `${stem} ${chi}`)
    }
  }

  return normalized.trim()
}

function normalizeFestivalOrTerm(value?: string) {
  if (!value) return undefined
  let normalized = value
  Object.entries(CN_FESTIVAL_TO_VI).forEach(([key, replacement]) => {
    normalized = normalized.replaceAll(key, replacement)
  })
  if (/[\u3400-\u9fff]/u.test(normalized)) {
    return undefined
  }
  return normalized
}

function normalizeZodiac(value: string) {
  return normalizeFestivalOrTerm(value) ?? value
}
