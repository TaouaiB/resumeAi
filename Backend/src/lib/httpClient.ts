import axios from "axios";
import { huggingFaceConfig } from "../config/huggingface";

export const callHuggingFaceAPI = async (prompt: string) => {
  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${huggingFaceConfig.model}`,
      { 
        inputs: prompt,
        parameters: {
          max_length: 500,
          truncation: true
        }
      },
      {
        headers: {
          Authorization: `Bearer ${huggingFaceConfig.apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
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