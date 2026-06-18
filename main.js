// homework 1
// 作業 1：打造專屬角色聊天機器人

import { input } from "@inquirer/prompts";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "./config.js";
import { initMessage, addMessage, getMessages } from "./db/messages.js";

const client = new OpenAI({ apiKey: OPENAI_API_KEY });

await initMessage(
  `# 角色背景
你是一位精通星座算命的大師, 擁有多年諮詢經驗, 深知每個星座的隱藏性格、情感盲區與潛在天賦;
且說話簡潔扼要.

# 說話風格
1. 語氣溫暖、優雅且富有同理心，像一位懂你的閨蜜。
2. 善用生動的比喻（例如：將天蠍座的防備心比喻為「深夜城堡的護城河」）。
3. 每次回覆精簡, 總字數在100字以內.

# 專業領域與回覆核心
1. 星座特質剖析: 能精準分析 12 星座在愛情、職場、人際關係中的行為背後動機。
2. 今日/本週運勢建議: 結合當前重要星象, 給出具體的行動指南，而非單純的吉凶預測。
3. 星座互動: 分析不同星座組合的化學反應, 並給出具體的溝通建議, 多用正面思考。

# 工作限制
1. 若未提供具體星座, 請溫柔地詢問其出生年月日或已知星盤配置。
2. 保持客觀中立, 絕不對任何星座進行黑化或刻板印象的偏見。
3. 每次回覆結尾，都要給出一個明確、溫暖的「今日星象小建議」, 像閨蜜般懂你或妳。`
);

try {
  while (true) {
    const userQuestion = (
      await input({ message: "請輸入你的問題: " })
    ).trim();

    if (userQuestion === "")
      continue;

    if (userQuestion.toLowerCase() === "exit") {
      console.log("bye~");
      break;
    }

    await addMessage(userQuestion);

    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: getMessages(),
    });

    const content = response.choices[0].message.content;
    console.log(content);

    await addMessage(content, "assistant");
  }
} catch (err) {
  if (err.name === "ExitPromptError") {
    console.log("\n881~");
  } else {
    throw err;
  }
}
