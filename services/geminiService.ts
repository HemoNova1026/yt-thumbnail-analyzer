import { GoogleGenAI } from "@google/genai";
import { ThumbnailData } from "../types";

// Helper to convert an image URL to base64 (if possible without CORS)
// Note: Fetching images from arbitrary URLs client-side often hits CORS.
// If it fails, we will just send metadata to Gemini.
async function urlToBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result?.toString().split(',')[1] || null;
        resolve(base64data);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Could not fetch image for Base64 conversion (CORS protection).", e);
    return null;
  }
}

export const analyzeThumbnail = async (data: ThumbnailData): Promise<string> => {
  // Check if API Key is present
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined") {
    return "找不到 API Key。請確認您已在 Netlify 的 'Environment variables' 中設定了名為 'API_KEY' 的變數，並且已經重新部署 (Trigger deploy)。";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Try to get image
  const base64Image = await urlToBase64(data.thumbnailUrl);
  
  // Localized Prompt in Traditional Chinese
  let prompt = `
    請分析這張 YouTube 縮圖的成效表現。
    
    影片資訊：
    標題: "${data.title}"
    CTR (點閱率): ${data.ctr}%
    演算法評級: ${data.rating}
    觀看次數: ${data.views}

    請提供以下繁體中文分析：
    1. 簡短分析為何這張縮圖會有這樣的成效表現（高 CTR 或 低 CTR）。
    2. 如果 CTR 偏低 (<5%)，請給出 3 個具體的改進建議；如果 CTR 很高 (>5%)，請列出 3 個值得保持的關鍵優點。
    3. 評論標題與視覺圖像之間的關聯性與吸引力。
  `;

  try {
    let response;
    
    if (base64Image) {
      // Multimodal analysis
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg', // Assuming jpeg/png, Gemini is flexible
                data: base64Image
              }
            },
            { text: prompt }
          ]
        }
      });
    } else {
      // Text-only analysis (fallback)
      prompt += "\n(注意：無法直接讀取圖片檔案，請根據標題與數據進行分析)";
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
      });
    }

    return response.text || "無法產生分析結果。";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // enhance error message for user
    if (error.message && error.message.includes("API key not valid")) {
      return "分析失敗：API Key 無效。請檢查您的 Google AI Studio 金鑰是否正確複製，且沒有多餘空格。";
    }
    
    return "分析失敗。請檢查您的網路連線或 API Key 設定。";
  }
};