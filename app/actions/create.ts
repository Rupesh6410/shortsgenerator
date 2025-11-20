"use server"
import { prisma } from '@/lib/db'
import decreaseCredits from '@/lib/decreaseCredits'
import { currentUser } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'
import processes from './processes'
import { generateImages } from './image'




const createVideo = async(prompt:string) => {

    const videoId = randomUUID()
    const user = await currentUser()
    const userId= user?.id
    if(!userId){
        return null
    }

    await prisma.video.create({
        data:{
            videoId,
            userId,
            prompt,
            processing: true,
        }
    })

    await decreaseCredits(userId)

    await processes(videoId)
    await generateImages(videoId)


  return {videoId}
}

export default createVideo