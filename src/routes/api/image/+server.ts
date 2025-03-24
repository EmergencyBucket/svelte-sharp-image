import { FileCache } from "$lib/server/cache.js";
import { optimizeImage } from "$lib/server/imageTools.js";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url, {
        getCache: FileCache.getCache,
        saveCache: FileCache.saveCache,
        safeEndpoints: ["i.mrxbox98.me"],
    });
};
