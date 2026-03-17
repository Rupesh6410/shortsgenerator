import React from 'react'
import { currentUser } from "@clerk/nextjs/server"
import findPrompt from '@/lib/findPrompt'
import { prisma } from '@/lib/db'
import { cn } from '@/lib/utils'
import { AnimatedShinyText } from '@/components/ui/animated-shiny-text'
import { ArrowRightIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { AnimatedGradientText } from '@/components/ui/animated-gradient-text'
import { TypingAnimation } from '@/components/ui/typing-animation'
import { VideoActions } from '@/components/videoAction'

const page = async({params}:{
    params:Promise<{videoId:string}>
}) => {
    const {videoId} = await params
    const user = await currentUser()
    const userId = user?.id
    

    if (!userId) {
        return null
    }
    const prompt = await findPrompt(videoId)

     if (!prompt || prompt === undefined) {
        return null
    }
    const video = await prisma.video.findUnique({
        where: {
            videoId: videoId
        }
    })
      if (!video) {
        return null
    }
    const isOwner = userId === video.userId
    const videoUrl = video.videoUrl
    const transcript = video.content
   return (
        <div className="min-h-screen w-full relative p-4 md:p-8 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 max-w-7xl mx-auto items-center lg:items-start justify-center mt-4 lg:mt-10">
                {/* Video Section */}
                <div className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[420px] shrink-0">
                    <div className="aspect-[9/16] bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
                        <video
                            key={videoId}
                            className="w-full h-full object-cover rounded-2xl"
                            controls
                            playsInline
                            src={videoUrl ?? undefined}
                        >
                            Your browser cant run this video
                        </video>
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex flex-col xl:flex-row gap-8 w-full max-w-3xl lg:max-w-none lg:flex-1">
                    <div className="flex flex-col flex-1 gap-8 w-full">
                        {/* Prompt Form */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full">
                            <div
                                className={cn(
                                    "group shrink-0 rounded-full border border-black/5 bg-neutral-100 text-base text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200 dark:border-white/5 dark:bg-neutral-800 dark:hover:bg-neutral-800",
                                )}
                            >
                                <AnimatedShinyText className="inline-flex items-center justify-center px-4 py-1.5 transition ease-out hover:text-neutral-600 hover:duration-300 hover:dark:text-neutral-400">
                                    <span>✨ Prompt</span>
                                    <ArrowRightIcon className="ml-1 size-3 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                                </AnimatedShinyText>
                            </div>

                            <Input
                                className="rounded-xl h-10 w-full"
                                style={{
                                    background: "#eee",
                                    color: "#000"
                                }}
                                defaultValue={prompt}
                                disabled
                            />
                        </div>

                        {/* Transcript Area */}
                        <div className="flex flex-col gap-4 w-full">
                            <div className="w-fit">
                                <div className="group relative flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f]">
                                    <span
                                        className={cn(
                                            "absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#b0b0b0]/50 via-[#9c40ff]/50 to-[#b0b0b0]/50 bg-[length:300%_100%] p-[1px]",
                                        )}
                                        style={{
                                            WebkitMask:
                                                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                            WebkitMaskComposite: "destination-out",
                                            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                            maskComposite: "subtract",
                                            WebkitClipPath: "padding-box",
                                        }}
                                    />

                                    <AnimatedGradientText className="text-sm font-medium">
                                        Transcript
                                    </AnimatedGradientText>
                                </div>
                            </div>
                            <div className="w-full p-5 rounded-xl bg-neutral-900/60 backdrop-blur-sm border border-gray-800 shadow-sm min-h-[100px]">
                                <TypingAnimation typeSpeed={50} className="text-sm md:text-base text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 leading-relaxed text-left">
                                    {transcript || ""}
                                </TypingAnimation>
                            </div>
                        </div>
                    </div>

                    {/* Actions Side */}
                    <div className="flex justify-center xl:justify-start shrink-0">
                         <div className="w-full sm:w-auto">
                            <VideoActions videoId={videoId} videoUrl={videoUrl} isOwner={isOwner}/>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page