// Convert S3 key to public URL
import dotenv from 'dotenv';
dotenv.config();

export const getImageUrl = (key) => {
    if (!key) return null;

    return `${process.env.S3_PUBLIC_URL}/${key}`;
};