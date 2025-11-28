import { Queue } from 'bullmq'
import { Redis } from 'ioredis'

const connection = new Redis("rediss://default:AUgTAAIncDI3M2M3OWM4ODZiYTk0MDczYmE0YjdhOThjNjNjZmZlNnAyMTg0NTE@rare-parakeet-18451.upstash.io:6379", {
    maxRetriesPerRequest: null,
})

connection.on('connect', () => {
    console.log('Redis connect sucefullly')
})

connection.on('error', (err) => {
    console.log('Redis connect error:', err)
})

connection.on('ready', () => {
    console.log('Redis ready')
})

export const videoQueue = new Queue('video-processing', {
    connection,
    defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
    }
})