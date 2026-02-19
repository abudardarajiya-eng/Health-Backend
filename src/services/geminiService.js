import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateExplanation(data) {
  const prompt = `
Explain pharmacogenomic risk:

Gene: ${data.gene}
Diplotype: ${data.diplotype}
Phenotype: ${data.phenotype}
Drug: ${data.drug}
Risk: ${data.risk}

Include:
- Biological mechanism
- Clinical consequence
- CPIC-aligned recommendation
- Mention detected rsID(s)
`;

  try {
    console.log("🔄 Calling Gemini API for drug:", data.drug);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("✅ Gemini response received");
    return text;
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    console.error("Error details:", error);
    // Return a fallback explanation if API fails
    return `Risk Assessment for ${data.drug}: ${data.phenotype.toUpperCase()} phenotype associated with ${data.risk.toUpperCase()} risk.`;
  }
}