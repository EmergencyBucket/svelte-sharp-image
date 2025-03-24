import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export class FileCache {
    /**
     * Caches an image locally
     * @param tag the tag to use
     * @param buffer buffer of the image
     */
    static async saveCache(tag: string, buffer: Buffer) {
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
    static async getCache(tag: string) {
        try {
            return await readFile(path.join(".cache", "images", tag));
        } catch (e) {
            return undefined;
        }
    }
}
