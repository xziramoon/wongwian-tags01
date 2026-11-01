import { useEffect, useState } from 'react';
import { TAG } from './config';

/* วัดความกว้างข้อความด้วย canvas (ทำงานได้แม้องค์ประกอบถูกซ่อน เช่นหน้าพิมพ์) คืนค่าเป็นสัดส่วนของขนาดฟอนต์ (em) */
let ctx: CanvasRenderingContext2D | null = null;
const textEm = (text: string, family: string, weight: number): number => {
  ctx ??= document.createElement('canvas').getContext('2d');
  if (!ctx) return text.length * 0.55;
  ctx.font = `${weight} 100px ${family}`;
  return ctx.measureText(text).width / 100;
};

const round = (n: number, step = 0.05) => Math.floor(n / step) * step;

/* ชื่อสินค้า: เริ่ม 5 มม. ลดลงจนไม่เกิน 2 บรรทัด ต่ำสุด 3.5 มม. */
export function fitName(name: string, family: string): number {
  const avail = TAG.w - TAG.border * 2 - TAG.slotW - 2 * 2.5;
  const em = textEm(name, family, 800);
  for (let size = 5; size > 3.5; size -= 0.25) {
    if (Math.ceil((em * size * 1.06) / avail) <= 2) return size;
  }
  return 3.5;
}

/* ข้อความบรรทัดเดียวที่ต้องไม่เกินความกว้างที่กำหนด */
export function fitWidth(
  text: string,
  family: string,
  weight: number,
  maxWidth: number,
  maxSize: number,
  minSize: number,
): number {
  const em = textEm(text, family, weight);
  if (em <= 0) return maxSize;
  return Math.max(minSize, Math.min(maxSize, round(maxWidth / em)));
}

/* ฟอนต์เว็บโหลดเสร็จช้ากว่า render ครั้งแรก — เปลี่ยนค่านี้เพื่อให้คำนวณขนาดใหม่
 * families = ฟอนต์ที่ต้องรอ (เช่นฟอนต์พู่กันของธีม ที่ยังไม่มีป้ายอื่นในหน้าเรียกใช้) */
export function useFontsTick(...families: string[]): number {
  const [tick, setTick] = useState(0);
  const key = families.join('|');
  useEffect(() => {
    let alive = true;
    const loads = key ? key.split('|').map((f) => document.fonts?.load(`400 16px ${f}`, 'ก0')) : [];
    Promise.all(loads)
      .catch(() => {})
      .then(() => document.fonts?.ready)
      .then(() => alive && setTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, [key]);
  return tick;
}
