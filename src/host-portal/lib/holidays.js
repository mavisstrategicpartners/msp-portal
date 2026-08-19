// South African public holidays — generated dynamically for a range of years.
// Fixed-date holidays plus Easter-based ones (Good Friday & Family Day).

const FIXED = [
  { md: '01-01', name: "New Year's Day", description: 'Public holiday marking the start of the calendar year.' },
  { md: '03-21', name: 'Human Rights Day', description: 'Commemorates the Sharpeville massacre of 21 March 1960.' },
  { md: '04-27', name: 'Freedom Day', description: 'Marks South Africa\u2019s first post-apartheid democratic elections in 1994.' },
  { md: '05-01', name: "Workers' Day", description: 'International Labour Day, honouring the contribution of workers.' },
  { md: '06-16', name: 'Youth Day', description: 'Commemorates the 1976 Soweto Uprising and the role of the youth in South Africa\u2019s liberation.' },
  { md: '08-09', name: "National Women's Day", description: 'Commemorates the 1956 women\u2019s march to the Union Buildings against pass laws.' },
  { md: '09-24', name: 'Heritage Day', description: 'Celebrates the cultural diversity and heritage of all South Africans.' },
  { md: '12-16', name: 'Day of Reconciliation', description: 'Promotes national unity and reconciliation between all South Africans.' },
  { md: '12-25', name: 'Christmas Day', description: 'Christian public holiday celebrated worldwide.' },
  { md: '12-26', name: 'Day of Goodwill', description: 'Public holiday following Christmas Day, dedicated to goodwill and reflection.' },
]

// Anonymous Gregorian algorithm for Easter Sunday (returns [month, day]).
function easterSunday(year) {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const L = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * L) / 451)
  const month = Math.floor((h + L - 7 * m + 114) / 31)
  const day = ((h + L - 7 * m + 114) % 31) + 1
  return [month, day]
}
function addDays(y, m, d, delta) {
  const dt = new Date(y, m - 1, d + delta)
  return [dt.getFullYear(), dt.getMonth() + 1, dt.getDate()]
}
const pad = n => String(n).padStart(2, '0')
const key = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`

function easterHolidays(year) {
  const [em, ed] = easterSunday(year)
  const [gy, gm, gd] = addDays(year, em, ed, -2) // Good Friday
  const [fy, fm, fd] = addDays(year, em, ed, 1)  // Family Day (Easter Monday)
  return [
    { date: key(gy, gm, gd), name: 'Good Friday', description: 'Christian public holiday commemorating the crucifixion of Jesus Christ.' },
    { date: key(fy, fm, fd), name: 'Family Day', description: 'The Monday after Easter Sunday \u2014 a day for spending time with family.' },
  ]
}

function forYear(year) {
  const fixed = FIXED.map(h => ({ date: `${year}-${h.md}`, name: h.name, description: h.description }))
  return [...fixed, ...easterHolidays(year)].sort((a, b) => a.date.localeCompare(b.date))
}

const startYear = new Date().getFullYear() - 2
const endYear = new Date().getFullYear() + 5
export const ZA_PUBLIC_HOLIDAYS = Array.from({ length: endYear - startYear + 1 }, (_, i) => forYear(startYear + i)).flat()

const _index = new Map(ZA_PUBLIC_HOLIDAYS.map(h => [h.date, h]))
export function holidayOn(dateKey) { return _index.get(dateKey) || null }
