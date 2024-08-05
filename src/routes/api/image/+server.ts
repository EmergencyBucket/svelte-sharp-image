import { optimizeImage } from "svelte-sharp-image";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url);
}