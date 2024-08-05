import { createHash } from "crypto";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import sharp, { type FormatEnum, type AvailableFormatInfo } from "sharp";

/**
 * Downloads an image from the internet
 * @param url The url of the image
 * @returns The image status, buffer, and format
 */
async function fetchImage(url: string){
    try {
        const fetchReq = await fetch(url, { keepalive: false });

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

/**
 * Caches an image locally
 * @param tag the tag to use
 * @param buffer buffer of the image
 */
async function saveCache(tag: string, buffer: Buffer) {
    await mkdir(path.join(".cache", "images"), {
        recursive: true,
    });

    await writeFile(path.join(".cache", "images", tag), buffer);
}

/**
 * Gets an image from the cache
 * @param tag The tag of the image
 * @returns the image
 */
async function getCache(tag: string) {
    try {
        return await readFile(path.join(".cache", "images", tag));
    } catch (e) {
        return undefined;
    }
}

/**
 * Optimizes an image using sharp
 * @param url the url of the image, can also being a local file
 * @returns the optimized image
 */
export async function optimizeImage(url: URL) {
    const sha256 = createHash("sha256");

    const tag = sha256.update(url.toString()).digest("hex");

    const buff = await getCache(tag);

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
    const image = urlsrc.includes("://") ? await fetchImage(urlsrc) : urlsrc;

    if (urlsrc.includes("://") && (image as any).status !== 200) {
        return new Response("Image not found", { status: 400 });
    }

    const format = url.searchParams.has("format")
        ? url.searchParams.get("format")
        : "webp";
    const toFormat: keyof FormatEnum | AvailableFormatInfo =
        format === "avif" ? "heif" : (format as any);
    const compression = format === "avif" ? "av1" : undefined;

    if (
        !urlsrc.includes("://") &&
        !existsSync("./static/" + (image as string))
    ) {
        return new Response("", { status: 404 });
    }

    const pipeline = sharp(
        urlsrc.includes("://")
            ? (image as any).buffer
            : "./static/" + (image as string),
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

    saveCache(tag, buffer);

    return new Response(buffer, {
        headers: {
            "Cache-Control": "public, max-age=31536000",
            "Content-Type": "image/" + format,
        },
    });
}