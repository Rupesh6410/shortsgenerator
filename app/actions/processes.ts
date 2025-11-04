import findPrompt from '@/lib/findPrompt'

const processes = async(videoId:string) => {
 try {
     const prompt = await findPrompt(videoId)
     
 } catch (error) {
    console.log("making vidoes error",error)
 }
}

export default processes