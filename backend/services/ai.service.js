import { GoogleGenerativeAI } from '@google/generative-ai';

let model;

const SYSTEM_PROMPT = `You are an expert full-stack developer AI.
Your ONLY job is to generate code and return it in a STRICT JSON format.

## RULES
1. ALWAYS respond with valid JSON.
2. Every response MUST have a "text" field.
3. For code generation, include a WebContainer-compatible "fileTree".
4. Projects with dependencies MUST have a "package.json" with a "start" script.
5. Include "buildCommand" and "startCommand" for the runner.
6. Write complete, production-quality code. No placeholders.
7. If just chatting, respond with ONLY the "text" field.
8. For "plagiarism check" or "originality", analyze the code and report in "text" field ONLY.

## RESPONSE SCHEMA
{
    "text": "description",
    "fileTree": {
        "filename.js": { "file": { "contents": "code" } }
    },
    "buildCommand": { "mainItem": "npm", "commands": ["install"] },
    "startCommand": { "mainItem": "node", "commands": ["app.js"] }
}
`;

const getModel = () => {
    if (model) return model;
    
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
        }
    });
    return model;
}

export const generateResult = async (prompt) => {
    try {
        const model = getModel();
        const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`);
        return result.response.text();
    } catch (error) {
        console.error('AI generation error:', error.message);
        return JSON.stringify({
            text: `⚠️ AI Error: ${error.message || 'Something went wrong.'}`
        });
    }
}

export const generateResultStream = async (prompt) => {
    try {
        const model = getModel();
        const result = await model.generateContentStream(`${SYSTEM_PROMPT}\n\nUser Request: ${prompt}`);
        return result.stream;
    } catch (error) {
        console.error('AI stream error:', error.message);
        throw error;
    }
}
