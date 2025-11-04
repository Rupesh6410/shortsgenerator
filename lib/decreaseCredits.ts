import { prisma } from "./db"


const decreaseCredits = async(userId:string) => {
    await prisma.user.update({
        where:{
            userId:userId
        },
        data:{
            credits:{
                decrement:1
            }
        }
    })

}

export default decreaseCredits