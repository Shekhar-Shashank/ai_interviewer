const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (history, message, topic, difficulty) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const systemPrompt = `You are an expert technical interviewer conducting a ${difficulty} level interview on ${topic}. 
    Your goal is to assess the candidate's knowledge, problem-solving skills, and coding abilities.
    
    Guidelines:
    1. Ask one question at a time.
    2. Provide constructive feedback if the answer is incorrect or incomplete.
    3. If the answer is correct, move to the next question or dig deeper.
    4. Be professional, encouraging, but rigorous.
    5. Keep responses concise and conversational.
    
    Current conversation history:
    ${history.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Candidate: ${message}
    Interviewer:`;

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error("Error generating AI response:", error);
        throw new Error("Failed to generate AI response");
    }
};

module.exports = { generateResponse };
