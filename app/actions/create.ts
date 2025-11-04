import { prisma } from '@/lib/db'
import decreaseCredits from '@/lib/decreaseCredits'
import { currentUser } from '@clerk/nextjs/server'
import { randomUUID } from 'crypto'


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




  return {videoId}
}

export default createVideo