import React from 'react'
import { GoogleGenAI } from "@google/genai";
import { randomUUID } from 'crypto';
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
    region: process.env.AWS_REGION || '',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    }
})

const bucketName = process.env.S3_BUCKET_NAME || '';

const processImage = async(img:string) => {
    try {
    const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

    

    const response : any = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: img,
        config:{
            imageConfig:{
                aspectRatio:"16:9",
                
            }
        }
    
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
        const imageData = part.inlineData.data;
        const buffer = Buffer.from(imageData, "base64");
        const fileName = `${randomUUID()}.png`;
        const command = new PutObjectCommand({ 
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: "image/png",
        }); 
        await s3Client.send(command); 
       const s3Url = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`
        return s3Url
  }

        

    } 
  
}
catch (error) {
        console.error('error while generating image from gemini', error)
        throw error
    }
}

export default processImage