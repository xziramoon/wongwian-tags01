import { INK_RED, THEME_ACCENT } from '../constants';

/* ป้ายดำแดง (แถบพลิก) — ค่าคงที่ทั้งหมดเป็นหน่วย มม. ปรับที่นี่ที่เดียวเมื่อวัดรางป้ายจริง */
export const TAG = {
  w: 90,
  h: 40, // ตัวป้าย (มม.)
  headerH: 7.5,
  slotW: 40, // ความกว้างช่องแถบราคา
  stripH: 31, // ความสูงแถบราคา
  border: 0.75,
  pageMargin: 5,
};

/* พื้นที่ใช้ได้ของ A4 หลังหักขอบ 5 มม. */
export const SHEET = {
  w: 210 - TAG.pageMargin * 2, // 200
  h: 297 - TAG.pageMargin * 2, // 287
  tagCols: 2,
  tagRows: 7, // 14 ใบ/แผ่น
  stripCols: 2,
  stripRows: 9, // 18 แถบ/แผ่น
};

/* คีย์ localStorage ใหม่ — ห้ามใช้ซ้ำกับคีย์เดิมของแอป (wongwianQueue_v9 / wongwianConfig_v9) */
export const FLIP_KEYS = {
  settings: 'tagFlip.settings',
  overrides: 'tagFlip.overrides',
  lastPrinted: 'tagFlip.lastPrinted',
  tagsPrinted: 'tagFlip.tagsPrinted',
};

/* ธีมเดียวกับป้ายปกติของแอป: 'ink' = หมึกแดง, 'korean' = เกาหลี, 'plain' = ดำแดงแบบแรก (ฟอนต์ตัวหนังสือล้วน) */
export type FlipTheme = 'ink' | 'korean' | 'plain';

export interface FlipSettings {
  theme: FlipTheme;
  priceFont?: string; // ฟอนต์ตัวเลขราคาที่ตั้งในแอป (config.priceFont) — รวมเข้ามาตอนวาด ไม่เก็บใน localStorage
  shopCn: string;
  shopTh: string;
  corner: string;
  unit: string;
  outText: string;
  outSub: string;
  font: string;
  red: string;
  mono: boolean;
}

export const DEFAULT_FLIP_SETTINGS: FlipSettings = {
  theme: 'ink',
  shopCn: '黄六盛',
  shopTh: 'อึ้งลักเส็ง',
  corner: 'ปลีก-ส่ง',
  unit: 'บาท',
  outText: 'สินค้าหมด',
  outSub: 'ขออภัย กำลังเติมของ',
  font: 'Kanit',
  red: '#D0021B',
  mono: false,
};

export const FLIP_FONTS = ['Kanit', 'Prompt', 'Chakra Petch', 'Mitr'];
export const FLIP_REDS = [
  { value: '#D0021B', label: 'แดงมาตรฐาน' },
  { value: '#B00018', label: 'แดงเข้ม' },
  { value: '#E30613', label: 'แดงสด' },
];

export const INK = '#111111';
export const DEFAULT_PACK_LABEL = 'ยกลัง';

export const fontStack = (font: string) => `'${font}',sans-serif`;

export const FLIP_THEMES: { value: FlipTheme; label: string }[] = [
  { value: 'ink', label: 'หมึกแดง' },
  { value: 'korean', label: 'เกาหลี' },
  { value: 'plain', label: 'ดำแดง (เดิม)' },
];

/* สี/ฟอนต์ตรงกับธีมป้ายปกติ: src/constants.ts (INK_RED, THEME_ACCENT) + src/styles/tag-theme.css */
export const THEME_COLOR: Record<'ink' | 'korean', string> = { ink: INK_RED, korean: THEME_ACCENT };
export const THEME_PRICE_FONT: Record<'ink' | 'korean', string> = {
  ink: "'Potta One',cursive",
  korean: "'Black Han Sans',sans-serif",
};

/* โหมดขาว-ดำ = แดงเป็นดำทั้งหมด; ธีมใช้สีของธีม; 'plain' ใช้สีที่ตั้งเอง */
export const flipRed = (s: FlipSettings): string =>
  s.mono ? INK : s.theme === 'plain' ? s.red : THEME_COLOR[s.theme];

/* ฟอนต์ตัวเลขราคา: ที่ตั้งในแอป → ฟอนต์ประจำธีม → ฟอนต์ตัวหนังสือ (plain) */
export const flipPriceFamily = (s: FlipSettings): string =>
  s.priceFont || (s.theme === 'plain' ? fontStack(s.font) : THEME_PRICE_FONT[s.theme]);

/* ฟอนต์พู่กัน/ฟอนต์ธีมมีน้ำหนักเดียว (400) ส่วน plain ใช้หนา 800 */
export const flipPriceWeight = (s: FlipSettings): number => (s.priceFont || s.theme !== 'plain' ? 400 : 800);
