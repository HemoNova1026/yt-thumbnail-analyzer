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
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Please configure your API Key to use Gemini features.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Try to get image
  const base64Image = await urlToBase64(data.thumbnailUrl);
  
  let prompt = `
    Analyze this YouTube thumbnail performance.
    Title: "${data.title}"
    CTR: ${data.ctr}%
    Algorithm Rating: ${data.rating}
    Views: ${data.views}

    Please provide:
    1. A brief analysis of why this thumbnail might have performed this way (High or Low CTR).
    2. Suggest 3 specific improvements if the CTR is low (<5%), or 3 key strengths if it is high (>5%).
    3. Comment on the synergy between the title and the expected visual.
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
      prompt += "\n(Note: Image could not be accessed directly, please analyze based on title and metrics)";
      response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [{ text: prompt }] }
      });
    }

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate analysis. Please check your API key and connection.";
  }
};
