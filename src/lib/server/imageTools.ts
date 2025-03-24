import { createHash } from "crypto";
import { existsSync } from "fs";
import path from "path";
import sharp, { type FormatEnum, type AvailableFormatInfo } from "sharp";

/**
 * Generates a hash for caching purposes
 * @param data The data to encode
 * @returns The SHA1 hash of the data
 */
function encodeDataSHA1(data: string) {
    let hash = createHash("sha1");

    hash.update(data);

    return hash.digest("hex");
}

/**
 * Checks if a string is a valid http or https url
 * @param string The string to check if it is a valid http url
 * @returns True if the string is a valid http or https url, false otherwise
 * @see https://stackoverflow.com/a/43467144
 */
function isValidHttpUrl(string: string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}

/**
 * Downloads an image from the internet
 * @param url The url of the image
 * @returns The image status, buffer, and format
 */
async function fetchImage(url: string) {
    try {
        const fetchReq = await fetch(url);

        let format = url.split(".").pop();
        if (
            fetchReq.headers.has("content-type") &&
            fetchReq.headers.get("content-type")!.startsWith("image/")
        ) {
            format = fetchReq.headers
                .get("content-type")!
                .replace("image/", "");
        }

        return {
            status: fetchReq.status,
            buffer: await fetchReq.arrayBuffer(),
            format: format,
        };
    } catch (e) {
        return { status: 500 };
    }
};

export type ImageOptimizeConfig = {
    getCache?: (tag: string) => Promise<Buffer | undefined>;
    saveCache?: (tag: string, buffer: Buffer) => Promise<void>;
    safeEndpoints?: string[];
}

/**
 * Optimizes an image using sharp
 * @param url the url of the image, can also being a local file
 * @returns the optimized image
 */
export async function optimizeImage(url: URL, config: ImageOptimizeConfig) {
    const tag = encodeDataSHA1(url.toString());

    const buff = config.getCache ? await config.getCache(tag) : undefined;

    if (buff) {
        return new Response(buff, {
            headers: {
                "Cache-Control": "public, max-age=31536000",
                "Content-Type":
                    "image/" +
                    (url.searchParams.has("format")
                        ? url.searchParams.get("format")
                        : "webp"),
            },
        });
    }

    if (!url.searchParams.has("url")) {
        return new Response("Missing url", { status: 501 });
    }

    const urlsrc = atob(url.searchParams.get("url")!);

    const quality = url.searchParams.has("quality")
        ? parseInt(url.searchParams.get("quality")!)
        : 100;

    const isUrl = isValidHttpUrl(urlsrc);

    // Check if the endpoint is safe if the image source is a URL
    if (isUrl) {
        const endpoint = new URL(urlsrc).hostname;
        if(config.safeEndpoints && !config.safeEndpoints.includes(endpoint)) {
            return new Response("Unsafe endpoint", { status: 403 });
        }
    }

    const image = isUrl ? await fetchImage(urlsrc) : urlsrc;

    if (isUrl && (image as any).status !== 200) {
        return new Response("Image not found", { status: 400 });
    }

    const format = url.searchParams.has("format")
        ? url.searchParams.get("format")
        : "webp";
    
    // Specific avif adjustments that we need to make
    const toFormat: keyof FormatEnum | AvailableFormatInfo =
        format === "avif" ? "heif" : (format as any);
    const compression = format === "avif" ? "av1" : undefined;

    // If its a local file, check if it exists
    if (
        !isUrl &&
        !existsSync(path.join("./static/", (image as string)))
    ) {
        return new Response("", { status: 404 });
    }

    const pipeline = sharp(
        isUrl
            ? (image as any).buffer
            : path.join("./static/", (image as string)),
        {
            sequentialRead: true,
        },
    );

    let width = url.searchParams.has("width")
        ? parseInt(url.searchParams.get("width")!)
        : null;
    
    let height = url.searchParams.has("height")
        ? parseInt(url.searchParams.get("height")!)
        : null;
    
    width = width && (await pipeline.metadata()).width! >= width ? width : null;
    height =
        height && (await pipeline.metadata()).height! >= height ? height : null;

    if (width || height) {
        pipeline.resize(width, height, { fit: "outside" });
    }

    pipeline.toFormat(toFormat, {
        quality: quality,
        compression: compression,
        lossless: quality == 100 ? true : false,
    });

    const buffer: Buffer = await new Promise((resolve) => {
        pipeline.toBuffer((_, buffer) => resolve(buffer));
    });

    if(config.saveCache) {
        config.saveCache(tag, buffer);
    }

    return new Response(buffer, {
        headers: {
            "Cache-Control": "public, max-age=31536000",
            "Content-Type": "image/" + format,
        },
    });
}