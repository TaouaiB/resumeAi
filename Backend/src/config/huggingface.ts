// src/config/huggingface.ts
export const huggingFaceConfig = {
  apiKey: process.env.HUGGINGFACE_API_KEY!,
  model: process.env.HF_MODEL_ID!,
  
};

// Add this debug log to check values
console.log("HF Config Loaded:", {
  apiKey: process.env.HUGGINGFACE_API_KEY,
  model: process.env.HF_MODEL_ID,
});
