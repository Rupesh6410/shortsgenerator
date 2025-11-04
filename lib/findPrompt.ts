"use server"

import { prisma } from "./db"

const findPrompt = async(videoId:string) => {
    const data = await prisma.video.findUnique({
        where:{
            videoId:videoId
        }
    })
  return data?.prompt
}

export default findPrompt