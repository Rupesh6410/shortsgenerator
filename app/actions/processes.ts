import findPrompt from '@/lib/findPrompt'
import {generateScript} from './script'
import { prisma } from '@/lib/db'


const processes = async(videoId:string) => {
 try {
     const prompt = await findPrompt(videoId)
     
     const script = await generateScript(prompt || " ")

     const scriptData = await JSON.parse(script || "")

     const contentTexts = scriptData.content.map((data: { contentText: string; }) => data.contentText)
     const fullContent = contentTexts.join(" ")

     const imagePrompts = scriptData.content.map((data: { imagePrompt: string; }) => data.imagePrompt)
     
     await prisma.video.update({
        where:{
            videoId:videoId
        },
        data:{
            content:fullContent,
            imagePrompts:imagePrompts,
        }
     })
     
 } catch (error) {
    console.log("making vidoes error",error)
 }
}

export default processes