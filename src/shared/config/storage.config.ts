import { env } from "./env";

export const  storageConfig = {
    provider: env.storageProvider || 's3',

    aws: {
        region:env.awsRegion || 'ap-south-1',
        accessKeyId:env.awsAccessKeyId || ' ',
        secretAccessKey: env.awsSecretAccessKey || '',
        bucketName: env.awsBucketName || 'deep-learn-assets'
    },

    limits: {
        maxFileSize: 5 * 1024 * 1024, //5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    },
}