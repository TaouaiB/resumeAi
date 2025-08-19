// src/lib/httpClient.ts
import axios from "axios";
import { huggingFaceConfig } from "../config/huggingface";

export const callHuggingFaceAPI = async (prompt: string) => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${huggingFaceConfig.model}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${huggingFaceConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000, // 30s for large resumes
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Hugging Face API Error:",
      error.response?.data || error.message
    );
    throw error;
  }
};
