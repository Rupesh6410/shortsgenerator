import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  param: { params: { videoId: string } }
) {
  try {
    const { videoId } = await param?.params

    const video = await prisma.video.findUnique({
      where: { videoId },
      select: {
        processing: true,
        failed: true,
        videoUrl: true
      }
    })

    if (!video) {
      return NextResponse.json({ error: "video not found" }, { status: 404 })
    }

    return NextResponse.json({
      completed: !video.processing && !!video.videoUrl && !video.failed,
      failed: video.failed,
      processing: video.processing
    })

  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
