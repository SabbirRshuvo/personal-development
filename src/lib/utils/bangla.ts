// Bangla numerals and formatting utilities with Asia/Dhaka timezone support

const BANGLA_NUMBERS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BANGLA_DAYS = [
  'রবিবার',
  'সোমবার',
  'মঙ্গলবার',
  'বুধবার',
  'বৃহস্পতিবার',
  'শুক্রবার',
  'শনিবার',
];

export function toBanglaNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || isNaN(Number(value)) && typeof value !== 'string') {
    return '০';
  }
  const str = String(value);
  return str.replace(/\d/g, (digit) => BANGLA_NUMBERS[parseInt(digit, 10)] || digit);
}

export const toBengaliNumber = toBanglaNumber;

export function formatBDT(amount: number, symbol = '৳'): string {
  const formattedWithCommas = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `${symbol}${toBanglaNumber(formattedWithCommas)}`;
}

export function formatHours(hours: number): string {
  const rounded = Number(hours.toFixed(1));
  return `${toBanglaNumber(rounded)} ঘণ্টা`;
}

export function formatMinutes(mins: number): string {
  return `${toBanglaNumber(mins)} মিনিট`;
}

export function getTodayDateString(): string {
  if (typeof window === 'undefined') {
    return '2026-11-14';
  }
  // Asia/Dhaka date as YYYY-MM-DD
  const now = new Date();
  const dhakaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }));
  const year = dhakaTime.getFullYear();
  const month = String(dhakaTime.getMonth() + 1).padStart(2, '0');
  const day = String(dhakaTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatBanglaDate(dateInput: string | Date, withDayName = true): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = BANGLA_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const dayName = BANGLA_DAYS[date.getDay()];

  if (withDayName) {
    return `${toBanglaNumber(day)} ${month} ${toBanglaNumber(year)}, ${dayName}`;
  }
  return `${toBanglaNumber(day)} ${month} ${toBanglaNumber(year)}`;
}

export function formatShortBanglaDate(dateInput: string | Date): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = BANGLA_MONTHS[date.getMonth()];
  return `${toBanglaNumber(day)} ${month.slice(0, 4)}`;
}

export function getRelativeBanglaDate(dateStr: string): string {
  const today = getTodayDateString();
  if (dateStr === today) return 'আজ';
  
  const targetDate = new Date(dateStr);
  const todayDate = new Date(today);
  const diffTime = targetDate.getTime() - todayDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'গতকাল';
  if (diffDays === 1) return 'আগামীকাল';
  if (diffDays < -1) return `${toBanglaNumber(Math.abs(diffDays))} দিন আগে`;
  if (diffDays > 1) return `${toBanglaNumber(diffDays)} দিন বাকি`;
  return formatShortBanglaDate(dateStr);
}

export function formatBanglaTime(dateInput: string | Date = new Date()): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours < 6 ? 'রাত' : hours < 12 ? 'সকাল' : hours < 15 ? 'দুপুর' : hours < 18 ? 'বিকাল' : 'রাত';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `০${minutes}` : toBanglaNumber(minutes);
  return `${period} ${toBanglaNumber(displayHours)}:${displayMinutes}`;
}
