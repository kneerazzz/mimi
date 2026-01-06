
import { geminiClient } from "./geminiClient.util.js";
import { ApiError } from "./apiError.js";
import { memeContextSchema } from "./geminiSchema.js";

export const generateMemeContext = async (userScenario) => {
  if (!userScenario || userScenario.trim().length < 5) {
    throw new ApiError(400, "Scenario too short to generate meme context");
  }

  const prompt = `
You are an expert meme generator.

Given a user's situation, return:
1. A SHORT meme caption (max 12 words)
2. 2–7 emotion or situation tags

Rules:
- Caption must be funny, relatable, meme-style
- Do NOT explain anything
- Tags must be lowercase, single words
- Do NOT include emojis
- Do NOT include hashtags

User scenario:
"${userScenario}"
`;

  let rawResponse;

  try {
    rawResponse = await geminiClient(prompt, {
      responseSchema: memeContextSchema,
      temperature: 0.7,
      maxOutputTokens: 8000
    });
  } catch (error) {
    throw error; // already wrapped as ApiError
  }

  let parsed;

  try {
    parsed = JSON.parse(rawResponse);
  } catch (err) {
    console.error("Invalid Gemini JSON:", rawResponse);
    throw new ApiError(500, "Failed to parse AI response");
  }

  // Hard validation (don’t trust AI blindly)
  if (
    !parsed.caption ||
    !Array.isArray(parsed.emotionTags) ||
    parsed.emotionTags.length < 2
  ) {
    throw new ApiError(500, "Invalid AI response structure");
  }

  return {
    caption: parsed.caption.trim(),
    emotionTags: parsed.emotionTags.map(tag => tag.toLowerCase().trim())
  };
};
