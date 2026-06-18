// homework 4
// import { input } from "@inquirer/prompts";

import { input } from "@inquirer/prompts";
import { client, DEFAULT_MODEL } from "./lib/openai.js";
import { spinner } from "./utils/spinner.js";
import { toOpenAITool } from "./utils/func-tool.js";
import * as allTools from "./tools/index.js";

const toolList = Object.values(allTools);
const tools = toolList.map(toOpenAITool);
const AVAILABLE_TOOLS = Object.fromEntries(toolList.map((t) => [t.name, t.fn]));

const messages = [
  {
    role: "developer",
    content:
      "你是台北市 YouBike 助理。你僅能依據台北市的行政區（如：大安區、信義區）來查詢該區站點的 youbike 資訊, 以及時間。若使用者查詢其他縣市，請禮貌拒絕並引導其輸入台北市行政區。",
  },
];

var iter = 0

while (true && iter <= 5) {
  iter += 1;
  const userQuestion = ( await input({ message: "請輸入你的問題: " })).trim();

  if (userQuestion === "")
    continue;

  if (userQuestion.toLowerCase() === "exit") {
    console.log("bye~");
    break;
  }

  messages.push({
    role: "user",
    content: userQuestion
  });

  const spin = spinner("thinking...").start();

  const response = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    tools,
    tool_choice: "auto",
  });

  spin.stop();

  const message = response.choices[0].message;
  messages.push(message);

  if (!message.tool_calls || message.tool_calls.length === 0) {
    console.log(message.content);
    // console.log("~ bye ~");
    // break;
  } else {
    for (const toolCall of message.tool_calls) {
      const fnName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`\n[呼叫 tool] ${fnName}(${JSON.stringify(args)})`);

      const fn = AVAILABLE_TOOLS[fnName];
      const result = await fn(args);
      // console.log(result)

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    const response2 = await client.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      tools,
      tool_choice: "auto",
    });
    const message2 = response2.choices[0].message;
    console.log(message2.content);
  }  
}
