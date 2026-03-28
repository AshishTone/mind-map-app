import { env } from "../config/env.js";
import { normalizeMindMapPayload } from "../utils/tree.js";

const GEMINI_MODEL = "gemini-2.5-flash";
const DETAIL_LEVEL_GUIDANCE = {
  1: "Level 1: very short outline, keep around 4 to 5 main nodes and use minimal details.",
  2: "Level 2: short focused summary, add a few supporting children and concise details.",
  3: "Level 3: balanced medium detail, create a well-structured study map with moderate detail."
};

const extractJsonBlock = (text) => {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1];
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini did not return valid JSON.");
  }

  return text.slice(firstBrace, lastBrace + 1);
};

export const generateMindMapDraft = async ({ title, description, depth = 3 }) => {
  const detailLevel = Math.min(3, Math.max(1, Number(depth || 3)));
  if (!env.geminiApiKey || env.geminiApiKey === "dummy-gemini-api-key") {
    return normalizeMindMapPayload({
      title,
      description,
      rootNode: {
        title,
        details: description,
        children: [
          {
            title: "Core Ideas",
            details: "Replace the Gemini API key in backend/.env to generate a real draft.",
            children: []
          }
        ]
      }
    });
  }

  const prompt = `
Create a comprehensive study-oriented mind map as strict JSON.
Topic: ${title}
Description: ${description}
Requested detail level: ${detailLevel}
${DETAIL_LEVEL_GUIDANCE[detailLevel]}

Return only a JSON object with this shape:
{
  "title": "Map title",
  "description": "Short summary",
  "rootNode": {
    "title": "Root topic",
    "details": "Concise explanation",
    "children": [
      {
        "title": "Child topic",
        "details": "Details",
        "children": []
      }
    ]
  }
}

Do not include any extra keys beyond title, description, rootNode, children, and details.
Do not include a node type field.
Keep the hierarchy within 3 levels total, including the root.
Make it educational and suitable for revision.
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${env.geminiApiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: "You generate only valid JSON for study-oriented hierarchical mind maps."
            }
          ]
        },
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error("Gemini returned no candidates.");
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("\n") || "";
  if (!text.trim()) {
    throw new Error("Gemini returned an empty response.");
  }

  const parsed = JSON.parse(extractJsonBlock(text));
  return normalizeMindMapPayload(parsed);
};
