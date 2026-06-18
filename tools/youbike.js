import { z } from "zod";
import { defineTool } from "../utils/func-tool.js";

const YOUBIKE_API =
  "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json";


async function getSareaYoubike({
  sarea,
  limit = 5,
}) {
  const res = await fetch(YOUBIKE_API);
  const data = await res.json();

  return data
    .filter((s) => s.act === "1" && s.sarea === sarea)
    .map((s) => ({
      name: s.sna.replace(/^YouBike2\.0_/, ""),
      area: s.sarea,
      address: s.ar,
      available_rent: s.available_rent_bikes,
      available_return: s.available_return_bikes,
      total: s.Quantity
    }))
    .slice(0, limit);
}

export const youbikeTool = defineTool({
  name: "get_sarea_youbike",
  description: "以台北市的行政區名稱來查詢可租借的 YouBike 資訊",
  fn: getSareaYoubike,
  parameters: z.object({
    sarea: z.string().describe("台北市的行政區, 例如: 大安區, 信義區"),
    limit: z.number().default(5).describe("回傳筆數上限，預設 5"),
  }),
});
