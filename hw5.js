// home 5
// 作業 5：向量相似度實驗

import { embed } from "./lib/qdrant.js";

// 1. 定義計算兩個向量餘弦相似度的函數
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0; // 避免除以零
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 2. 主執行程式
async function runEmbeddingAnalysis() {
  // 測試資料集 (3組，每組3句)
  const textGroups = [
    ["我喜歡喝咖啡", "咖啡的香氣很迷人", "我每天早上都要喝一杯咖啡"],
    ["高鐵快要進站了", "這部電影很好看", "手機快沒電了"],
    ["我每晚都喝啤酒", "高梁58度太嗆了", "啤酒加梅酒讓你升天"]
  ];

  const allPairsResults = [];

  // 逐組處理
  for (let g = 0; g < textGroups.length; g++) {
    const group = textGroups[g];
    console.log(`\n=== 第 ${g + 1} 組句子兩兩比對 ===`);
    
    // 預先取得該組所有句子的 embedding，避免重複呼叫 API
    const embeddings = [];
    for (let i = 0; i < group.length; i++) {
      // 呼叫您既有的 embed(text) 函數
      const vector = await embed(group[i]); 
      embeddings.push(vector);
    }

    // 進行兩兩組合比對 (C 3 取 2 共 3 種組合：0-1, 0-2, 1-2)
    const pairs = [
      [0, 1],
      [0, 2],
      [1, 2]
    ];

    for (const [i, j] of pairs) {
      const score = cosineSimilarity(embeddings[i], embeddings[j]);
      
      const resultItem = {
        groupName: `第 ${g + 1} 組`,
        text1: group[i],
        text2: group[j],
        similarity: score
      };

      // 輸出當前兩兩比對結果 (保留小數點後 4 位)
      console.log(`「${resultItem.text1}」 vs. 「${resultItem.text2}」`);
      console.log(`➔ 相似度: ${score.toFixed(4)}`);
      
      // 存入總表以供後續總匯排序
      allPairsResults.push(resultItem);
    }
  }

  // 3. 最後匯總與排序（依據相似度從高到低）
  allPairsResults.sort((a, b) => b.similarity - a.similarity);

  console.log("\n=========================================");
  console.log("全體句子對齊相似度總匯總排行 (由高到低)");
  console.log("=========================================");
  
  // 以表格形式精美呈現
  console.table(allPairsResults.map(item => ({
    "來源組別": item.groupName,
    "句子 A": item.text1,
    "句子 B": item.text2,
    "相似度分數": item.similarity.toFixed(4)
  })));
}

// 執行分析
runEmbeddingAnalysis();
