import { prisma } from "@/lib/db"
import { AssemblyAI } from "assemblyai"

const apiKey = process.env.ASSEMBLY_API_KEY
if (!apiKey) {
    throw new Error("missing assembly api key")
}

const client = new AssemblyAI({
    apiKey: apiKey
})

export const generateCaptions = async (videoId: string) => {
    try {
        const video = await prisma.video.findUnique({
            where: { videoId: videoId }
        })
        
        if (!video || !video.audio) {
            return undefined
        }

        const transcript = await client.transcripts.transcribe({ 
            audio_url: video.audio 
        })

  
        const FPS = 30; 
        
        const captions = transcript.words
            ? transcript.words.map(word => ({
                text: word.text,
                startFrame: Math.floor((word.start / 1000) * FPS),
                endFrame: Math.floor((word.end / 1000) * FPS)
            }))
            : []

        console.log('Generated captions:', captions.length)
        console.log('First few captions:', captions.slice(0, 3)) 
        
        await prisma.video.update({
            where: { videoId: videoId },
            data: {
                captions: captions
            }
        })
        
        return captions 
    }
    catch (error) {
        console.error('Error while generating captions:', error)
        throw error
    }
}