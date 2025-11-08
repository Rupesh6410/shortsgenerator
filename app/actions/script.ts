import { GoogleGenAI } from "@google/genai"; 


const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY 
});

export const generateScript = async (part: string) => {

    const prompt = `Write a script to generate a 30 seconds video on topic: "${part}" along with AI image prompt in realistic format for each scene and give me the result in JSON formart with imagePrompt and Content Text as fields. Just give me imagePrompt and contentText in an array. PLEASE DONT GIVE ANY OTHER RESPONSE like "scene1, etc". JUST GIVE WHAT I ASKED ONLY. Keep the name of the response array as "content" - which would be containing the objects.`


    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [ 
                { 
                    role: "user", 
                    parts: [{ text: prompt }] 
                } 
            ],
            config: {
                responseMimeType: "application/json",
            },
        });

        
        const jsonText = response?.text?.trim() || "";

        
        return jsonText; 

    } catch (error) {
        console.error("Gemini API call failed:", error);
        return null; 
    }
}