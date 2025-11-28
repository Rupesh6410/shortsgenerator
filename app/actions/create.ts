"use server"
import { prisma } from '@/lib/db'
import decreaseCredits from '@/lib/decreaseCredits'
import { currentUser } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'
import processes from './processes'
import { videoQueue } from '@/lib/queue'



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
    const userData = await prisma.user.findUnique({
        where: { userId },
        select: { credits: true }
    })

    if (!userData) return null

    
    if (userData.credits < 1)  return 
    
    
    await decreaseCredits(userId)

    await videoQueue.add('generate-video', { videoId })
    console.log('job added to queue succesffuly')

    return { videoId }
}

export default createVideo