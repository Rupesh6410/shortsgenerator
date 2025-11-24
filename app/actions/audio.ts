import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream"; 


const polly = new PollyClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
});

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
})

const bucketName = process.env.S3_BUCKET_NAME;

export const generateAudio = async (videoId: string) => {
    try {
        const video = await prisma.video.findUnique({
            where: { videoId }
        });

        if (!video || !video.content) {
            console.error("No content found for video");
            return undefined;
        }

        console.log("Generating audio using AWS Polly...");

        
        const pollyCommand = new SynthesizeSpeechCommand({
            Text: video.content,
            OutputFormat: "mp3",
            VoiceId: "Matthew", 
            Engine: "standard"   
        });

          const response = await polly.send(pollyCommand);

        if (!response.AudioStream) {
            throw new Error("No audio stream returned from Polly");
        }

        
        const chunks: Buffer[] = [];
        const stream = response.AudioStream as Readable;

        for await (const chunk of stream) {
            chunks.push(Buffer.from(chunk));
        }

        const buffer = Buffer.concat(chunks);

    
        const fileName = `${randomUUID()}.mp3`;

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: "audio/mpeg"
        });

        await s3Client.send(command);

        const audioUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        console.log("Uploaded Audio:", audioUrl);

        
        await prisma.video.update({
            where: { videoId },
            data: { audio: audioUrl }
        });

        return audioUrl;

    } catch (error: any) {
        console.error("❌ Error generating audio using Polly:", error);
        throw error;
    }
};