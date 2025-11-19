require('dotenv').config();

async function testAPI() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }

    console.log(`API Key found (length: ${apiKey.length})`);

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        }
    } catch (error) {
        console.error("Network/Fetch Error:", error.message);
    }
}

testAPI();
