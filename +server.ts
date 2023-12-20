import type { RequestHandler } from "@sveltejs/kit";
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

export const GET: RequestHandler = async ({url}) => {
    const quality = (url.searchParams.has("quality")) ? parseInt(url.searchParams.get("quality")!) : 100;
    const image = url.searchParams.get("url")!.includes("://") ? await fetchImage(url.searchParams.get("url")!) : url.searchParams.get("url")!;

    if(url.searchParams.get("url")!.includes("://") && (image as any).status !== 200) {
        return new Response("Image not found", {status: 400});
    }

    const format = (url.searchParams.has("format")) ? url.searchParams.get("format") : "webp";
    const toFormat: keyof FormatEnum | AvailableFormatInfo = (format === "avif") ? "heif" : format as any;
    const compression = (format === "avif") ? "av1" : undefined;
    const pipeline = sharp(url.searchParams.get("url")!.includes("://") ? (image as any).buffer : "./static/"+(image as string));

    let width = (url.searchParams.has("width")) ? parseInt(url.searchParams.get("width")!) : null;
    let height = (url.searchParams.has("height")) ? parseInt(url.searchParams.get("height")!) : null;
    width = (width && (await pipeline.metadata()).width! >= width) ? width : null;
    height = (height && (await pipeline.metadata()).height! >= height) ? height : null;

    if (width || height) {
        pipeline.resize(width, height, { fit: 'outside' });
    }

    // 100 Quality on webp is not lossless so I made it lossless on 100 quality
    pipeline.toFormat(toFormat, { quality: quality, compression: compression, lossless: quality == 100 ? true : false });

    let buffer: Buffer = await new Promise((resolve) => {
        pipeline.toBuffer((_, buffer) => resolve(buffer));
    })

    return new Response(buffer, {
        headers: {
            'Cache-Control': 'public, max-age=31536000',
            'Content-Type': 'image/' + format
        }
    })
}