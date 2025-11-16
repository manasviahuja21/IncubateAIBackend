import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { configDotenv } from "dotenv";
const router = express.Router();
configDotenv();
// 1. Ensure this variable is actually loaded (e.g., using dotenv)
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set!");
}

const genAI = new GoogleGenerativeAI(apiKey);

router.post("/analyze", async (req, res) => {
  try {
    const ideaText = req.body.idea;
    const prompt = `
      You are an expert startup analyst and venture capitalist. Your task is to analyze the provided business idea and return a comprehensive, structured analysis in a strict JSON format.

You must follow the schema provided below exactly. Fill in every field with detailed, accurate analysis. Pay special attention to generating the structured arrays for Market, Competition, and Audience data.

Here is the JSON schema you MUST adhere to:
{
  "idea_title": "<A concise, descriptive title for the platform>",
  "idea_category": "<Auto-detected niche (e.g., PropTech / B2B SaaS)>",
  "pitch_one_liner": "<A crisp, startup-style tagline for the idea>",
  "overall_rating": {
    "score": <0-100>,
    "summary_justification": "<Brief summary explaining the overall score>"
  },
  "innovation_score": {
    "score": <0-10>,
    "explanation": "<How unique and original is this idea? (>3 lines of text)"
  },
  "feasibility_analysis": {
    "technical_difficulty_level": "<High, Medium, or Low>",
    "operational_difficulty_level": "<High, Medium, or Low>",
    "financial_difficulty_level": "<High, Medium, or Low>",
    "tech_details": "<Key technical requirements, e.g., APIs, security.>",
    "timeline": "<Estimated MVP timeline, e.g., 6-9 months MVP>"
  },
  "market_size": {
    "explanation_text": "<Detailed text analysis of market size, growth, and fragmentation.>",
    "market_trend": [
      { "year": 2020, "value": <number> },
      { "year": 2021, "value": <number> },
      { "year": 2022, "value": <number> },
      { "year": 2023, "value": <number> },
      { "year": 2024, "value": <number> }
    ]
  },
  "competition_analysis": {
    "top_competitors": ["<Competitor 1>", "<Competitor 2>", "<Competitor 3>", "<Competitor 4>", "<Competitor 5>"],
    "differentiation_niche": "<Explanation of the unique focus or competitive niche.>",
    "competition_scores": [
      { "name": "<Competitor Name 1>", "score": <0-100> },
      { "name": "<Competitor Name 2>", "score": <0-100> },
      { "name": "<Competitor Name 3>", "score": <0-100> }
    ]
  },
  "target_audience": {
    "primary_persona": "<Description of the biggest target group/persona.>",
    "audience_breakdown": [
      { "name": "<Group 1 Name>", "value": <0-100> },
      { "name": "<Group 2 Name>", "value": <0-100> },
      { "name": "<Group 3 Name>", "value": <0-100> }
    ]
  },
  "swot_report": {
    "strengths": ["<Strength 1>", "<Strength 2>", "<Strength 3>"],
    "weaknesses": ["<Weakness 1>", "<Weakness 2>", "<Weakness 3>"],
    "opportunities": ["<Opportunity 1>", "<Opportunity 2>", "<Opportunity 3>"],
    "threats": ["<Threat 1>", "<Threat 2>", "<Threat 3>"]
  },
  "ai_feedback_summary": {
    "suggestions": [
      "<Actionable suggestion 1>",
      "<Actionable suggestion 2>",
      "<Actionable suggestion 3>",
      "<Actionable suggestion 4>"
    ]
  },
  "impact_potential": {
    "potential_score": <0-10>,
    "explanation": "<Analysis of long-term value, network effects, and social/industry impact.>"
  },
  "monetization_plan": {
    "models": [
      "<Revenue Model 1 (e.g., Subscription)>",
      "<Revenue Model 2 (e.g., Transaction Fee)>",
      "<Revenue Model 3 (e.g., Featured Listing)>"
    ],
    "suggested_pricing": "<Specific pricing recommendation, e.g., Venue SaaS: $49/month.>"
  },
  "funding_estimator": {
    "estimated_cost": "<Estimated cost range for MVP/initial phase, e.g., $150,000 - $250,000>",
    "recommended_funding_stage": "<e.g., Pre-seed or Seed>",
    "justification_paragraph": "<Detailed justification for the cost and funding stage.>"
  },
    "one_line_expln":{
    "line":"<summarise the whole idea in one line>"
    }
}

Analyze this idea:
"${ideaText}"
    `;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json", // This forces JSON output
      },
    });

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text();
    const json = JSON.parse(jsonText);

    res.json(json);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;