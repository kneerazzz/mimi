
export const memeContextSchema = {
  type: "object",
  properties: {
    caption: {
      type: "string",
      description: "A short, witty meme caption (max 12 words)"
    },
    emotionTags: {
      type: "array",
      items: {
        type: "string"
      },
      minItems: 2,
      maxItems: 7,
      description: "Lowercase emotion or situation tags"
    }
  },
  required: ["caption", "emotionTags"]
};
