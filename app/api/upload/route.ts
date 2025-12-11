import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Initialize R2 Client
const R2 = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.name.replace(/\.[^/.]+$/, "") + '-' + uniqueSuffix + '.webp'; // Force extension change if needed, or keep original

        // We upload to 'uploads/' folder by default for Admin/User uploads
        const key = `uploads/${filename}`;

        await R2.send(
            new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: file.type,
            })
        );

        const url = `${process.env.R2_PUBLIC_DOMAIN}/${key}`;

        return NextResponse.json({ secure_url: url });
    } catch (error: any) {
        console.error("R2 Upload Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
