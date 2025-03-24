<script>
    import Image from "$lib/Image.svelte";
</script>

<h1>Svelte Sharp Image</h1>
<hr />
<p>
    This is a simple Svelte image component that uses <a
        href="https://sharp.pixelplumbing.com/">Sharp</a
    > to automatically optimize images during runtime. It can resize, crop, and convert
    images to different formats.
</p>
<a href="https://github.com/EmergencyBucket/svelte-sharp-image">GitHub</a>
<a href="https://www.npmjs.com/package/svelte-sharp-image">NPM</a>
<h2>Usage</h2>
<p>
    Create a new api route at <code>/routes/api/image/+server.ts</code> with the
    following code:
</p>
<blockquote style="white-space: pre-line">
{`import { optimizeImage } from "svelte-sharp-image";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url);
}`}
</blockquote>
<p>You can also pass in a config object into the <code>optimizeImage</code> function.</p>
<blockquote style="white-space: pre-line">
{`export type ImageOptimizeConfig = {
    getCache?: (tag: string) => Promise<Buffer | undefined>;
    saveCache?: (tag: string, buffer: Buffer) => Promise<void>;
    safeEndpoints?: string[];
}`}
</blockquote>
<p>Then use the <code>Image</code> component from the library.</p>
<style>
    @import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap");
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap');

    * {
        font-family: "Roboto", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
        font-variation-settings: "wdth" 100;
    }

    code {
        font-weight: 300;
        font-family: "Roboto Mono", monospace;
    }

    blockquote {
        font-weight: 300;
        font-family: "Roboto Mono", monospace;
    }
</style>
