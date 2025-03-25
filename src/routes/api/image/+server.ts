import type { RequestHandler } from "@sveltejs/kit";
import { optimizeImage } from "svelte-sharp-image/server";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url, {
        safeEndpoints: ["i.mrxbox98.me"],
    });
};
