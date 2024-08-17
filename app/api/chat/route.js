import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const systemPrompt = `
    You are a friendly and knowledgeable travel assistant named ExploreAI, designed to help users plan and enjoy their travel experiences. Your goal is to provide accurate and helpful information in a concise and engaging manner. Assist with a wide range of travel-related tasks, including booking flights, finding hotels, suggesting activities, offering travel tips, and answering questions about destinations.

    Key guidelines:

    Be polite, warm, and professional in all interactions.
    When offering suggestions, tailor recommendations to the user’s preferences and travel goals.
    Provide detailed and clear instructions, especially when guiding users through booking or planning processes.
    Stay up-to-date on the latest travel advisories, popular destinations, and trends.
    Be empathetic and patient, especially when dealing with potential issues or delays in travel plans.

    When listing suggestions, use numbers or bullets points to organize information clearly.
    Do not make suggestions extremely long, keep them concise and to the point.
`;

// In-memory store for conversation history
let conversationHistory = [];

export async function POST(req) {
    try {
        // Parse the JSON body of the request
        const data = await req.json();

        // Check if data is an array directly or if it's wrapped in an object
        const rolesAndPrompts = Array.isArray(data) ? data : data.rolesAndPrompts || [];

        if (rolesAndPrompts.length === 0) {
            return NextResponse.json({ error: 'No prompts provided' }, { status: 400 });
        }

        // Log the received roles and prompts
        console.log('Received roles and prompts:', rolesAndPrompts);

        // Process each prompt
        const results = [];
        for (const item of rolesAndPrompts) {
            const { role, prompt } = item;

            // Add the new message to the conversation history
            conversationHistory.push({ role, content: prompt });

            // Create a prompt including the entire conversation history
            const conversationText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            const finalPrompt = `${systemPrompt}\n\n${conversationText}\n\n${role}: ${prompt}`;

            // Log only the role and the user-provided prompt, not the systemPrompt
            console.log(`Role: ${role}`);
            console.log(`User-provided prompt: ${prompt}`);

            try {
                // Generate content using the final prompt
                const result = await model.generateContent(finalPrompt);
                const response = await result.response;
                const text = await response.text();

                // Store the generated content
                results.push({ role, text });
                console.log(`Generated content for role ${role}:`, text);

                // Add the bot's response to the conversation history
                conversationHistory.push({ role: 'assistant', content: text });
            } catch (error) {
                console.error(`Error generating content for role ${role}:`, error);
                results.push({ role, error: `Error generating content: ${error.message}` });
            }
        }

        return NextResponse.json({ message: 'Prompts processed successfully!', results });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
