import { optimizeImage } from "$lib/server/imageTools.js";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url);
}