import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
  
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION || 300

export function createAttachmentPresignedUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: `${todoId}.png`,
        Expires: urlExpiration
    })
}

export async function getTodoAttachmentUrl(todoId: string): Promise<string> {
    try {
        await s3.headObject({
            Bucket: bucketName,
            Key: `${todoId}.png`
        }).promise();

        return s3.getSignedUrl('getObject', {
            Bucket: bucketName,
            Key: `${todoId}.png`,
            Expires: urlExpiration
        });
    } catch (err) {
        console.log(err)
}
    return null
}