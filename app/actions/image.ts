import Replicate from "replicate";
import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/db";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const bucketName = process.env.S3_BUCKET_NAME || "";


const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));


const processImage = async (prompt: string) => {
  const input = {
    prompt,
    go_fast: true,
    megapixels: "1",
    num_outputs: 1,
    aspect_ratio: "9:16",
    output_format: "png",
    output_quality: 80,
    num_inference_steps: 4,
  };

  const streams: any = await replicate.run(
    "black-forest-labs/flux-schnell",
    { input }
  );

  if (!streams?.[0]) throw new Error("No output stream returned from Replicate.");

  const reader = streams[0].getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  const fileName = `${randomUUID()}.png`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: "image/png",
    })
  );

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};


const safeProcessImage = async (prompt: string, attempt = 1): Promise<string> => {
  try {
    console.log(`⚡ Generating Image (Attempt ${attempt})`);
    return await processImage(prompt);
  } catch (err: any) {
    if (err?.statusCode === 429 || err?.response?.status === 429) {
      console.log(`⏳ Rate limited — waiting 10s then retrying...`);
      await delay(10000);
      return safeProcessImage(prompt, attempt + 1);
    }
    throw err;
  }
};

export const generateImages = async (videoId: string) => {
  try {
    const video = await prisma.video.findUnique({ where: { videoId } });
    if (!video || !video.imagePrompts?.length) return null;

    const imageLinks: string[] = [];

    for (let i = 0; i < video.imagePrompts.length; i++) {
      console.log(`🖼  Processing ${i + 1}/${video.imagePrompts.length}`);

      const url = await safeProcessImage(video.imagePrompts[i]);
      imageLinks.push(url);

      console.log(`✔ Saved Image: ${url}`);

      await delay(10000);
    }

    await prisma.video.update({
      where: { videoId },
      data: {
        imageLinks,
        thumbnail: imageLinks[0],
      },
    });

    console.log(`All images generated:`, imageLinks);
    return imageLinks;
  } catch (error) {
    console.error("error while generating image:", error);
    throw error;
  }
};


//         const imageLinks = [
//   'https://shortsgenerator.s3.eu-north-1.amazonaws.com/c2bf1da6-54a0-441b-be6b-f161b74b3921.png',
//   'https://shortsgenerator.s3.eu-north-1.amazonaws.com/1eea49fa-43e2-4bf2-be9a-128a726879ea.png',
//   'https://shortsgenerator.s3.eu-north-1.amazonaws.com/08085e0f-059b-46e2-bf9b-18cb89f651a7.png',
//   'https://shortsgenerator.s3.eu-north-1.amazonaws.com/feec8509-1ae6-4a66-9875-d32aedb2a3ca.png',
//   'https://shortsgenerator.s3.eu-north-1.amazonaws.com/bed0f1a7-ccc4-4776-9ee6-1d1f80f9e6a1.png',
//   'https://shortsgenerator.s3.eu-north-1.amazonaws.com/5c2eca13-fac2-4741-a744-002f030723f0.png'
// ]