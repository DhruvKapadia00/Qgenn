// test-api.js
require('dotenv').config({ path: '.env.local' });
const OpenAI = require('openai');

async function testAPI() {
    try {
        // Use the DeepSeek API key for OpenAI SDK
        const apiKey = process.env.DEEPSEEK_API_KEY;
        
        console.log('API Key:', {
            present: !!apiKey,
            length: apiKey?.length,
            prefix: apiKey?.substring(0, 5)
        });

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: 'https://api.deepseek.com/v1'
        });

        console.log('Making test request...');
        const completion = await openai.chat.completions.create({
            model: "deepseek-chat",
            messages: [{ role: "user", content: "Say hello!" }],
            max_tokens: 50
        });

        console.log('Response:', completion);
    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            status: error.status,
            stack: error.stack
        });
    }
}

testAPI();
