import type { RequestHandler } from "@sveltejs/kit";
import { createHash } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import sharp, { type AvailableFormatInfo, type FormatEnum } from 'sharp';

const fetchImage = async (url: string) => {
    try {
        const fetchReq = await fetch(url, { method: 'GET' });

        let format = url.split('.').pop();
        if (fetchReq.headers.has('content-type') && fetchReq.headers.get('content-type')!.startsWith('image/')) {
            format = fetchReq.headers.get('content-type')!.replace('image/', '');
        }

        return {
            status: fetchReq.status,
            buffer: await fetchReq.arrayBuffer(),
            format: format
        }
    } catch (e) {
        return { status: 500 }
    }
};

async function saveCache(tag: string, buffer: Buffer) {
    await mkdir(path.join(".cache", "images"), {
        recursive: true
    });

    await writeFile(path.join(".cache", "images", tag), buffer);
}

async function getCache(tag: string) {
    try {
        return await readFile(path.join(".cache", "images", tag))
    }
    catch(e) {
        return undefined;
    }
}

export const GET: RequestHandler = async ({url}) => {
    const sha256 = createHash('sha256');

    let tag = sha256.update(url.toString()).digest('hex');

    let buff = await getCache(tag);

    if(buff) {
        console.log("Cache hit");

        return new Response(buff, {
            headers: {
                'Cache-Control': 'public, max-age=31536000',
                'Content-Type': 'image/' + ((url.searchParams.has("format")) ? url.searchParams.get("format") : "webp")
            }
        })
    }

    const quality = (url.searchParams.has("quality")) ? parseInt(url.searchParams.get("quality")!) : 100;
    const image = url.searchParams.get("url")!.includes("://") ? await fetchImage(url.searchParams.get("url")!) : url.searchParams.get("url")!;

    if(url.searchParams.get("url")!.includes("://") && (image as any).status !== 200) {
        return new Response("Image not found", {status: 400});
    }

    const format = (url.searchParams.has("format")) ? url.searchParams.get("format") : "webp";
    const toFormat: keyof FormatEnum | AvailableFormatInfo = (format === "avif") ? "heif" : format as any;
    const compression = (format === "avif") ? "av1" : undefined;
    const pipeline = sharp(url.searchParams.get("url")!.includes("://") ? (image as any).buffer : "./static/"+(image as string), {
        sequentialRead: true
    });

    let width = (url.searchParams.has("width")) ? parseInt(url.searchParams.get("width")!) : null;
    let height = (url.searchParams.has("height")) ? parseInt(url.searchParams.get("height")!) : null;
    width = (width && (await pipeline.metadata()).width! >= width) ? width : null;
    height = (height && (await pipeline.metadata()).height! >= height) ? height : null;

    if (width || height) {
        pipeline.resize(width, height, { fit: 'outside' });
    }

    pipeline.toFormat(toFormat, { quality: quality, compression: compression, lossless: quality == 100 ? true : false });

    let buffer: Buffer = await new Promise((resolve) => {
        pipeline.toBuffer((_, buffer) => resolve(buffer));
    })

    saveCache(tag, buffer);

    return new Response(buffer, {
        headers: {
            'Cache-Control': 'public, max-age=31536000',
            'Content-Type': 'image/' + format
        }
    })
}