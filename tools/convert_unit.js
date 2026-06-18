import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

async function convertUnit({
  value,
  from_unit,
  to_unit
}) {
  // 轉為小寫以支援大小寫不敏感的輸入（例如：KM, Km, km）
  const from = from_unit.toLowerCase();
  const to = to_unit.toLowerCase();

  // 如果單位相同，直接返回原數值
  if (from === to) return value;

  // 定義轉換常數
  const KM_TO_MILE = 0.621371;
  const KG_TO_LB = 2.20462;

  // 1. 長度換算 (km <=> mile)
  if (from === 'km' && to === 'mile') return value * KM_TO_MILE;
  if (from === 'mile' && to === 'km') return value / KM_TO_MILE;

  // 2. 重量換算 (kg <=> lb)
  if (from === 'kg' && to === 'lb') return value * KG_TO_LB;
  if (from === 'lb' && to === 'kg') return value / KG_TO_LB;

  // 3. 溫度換算 (c <=> f)
  if (from === 'c' && to === 'f') return value * 9 / 5 + 32;
  if (from === 'f' && to === 'c') return (value - 32) * 5 / 9;

  // 處理不支援的單位組合
  throw new Error(`不支援從 "${from_unit}" 轉換到 "${to_unit}" 的單位換算。`);
}

export const convertUnitTool = defineTool({
  name: "convert_unit",
  description: "進行以下3種單位換算: 攝氏 F 與華氏 C 的溫度換算, 公里 km 與英里 mile 的換算, 公斤 kg 與磅 lb 的換算",
  fn: convertUnit,
  parameters: z.object({
    value: z.number().describe("數字, 如: 25 或 28.5"),
    from_unit: z.string().describe("字串, 原始單位"),
    to_unit: z.string().describe("字串, 目標單位")
  }),
});
