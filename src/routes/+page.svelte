<script>
    import Image from "$lib/Image.svelte";
</script>

<svelte:head>
    <!-- Place this tag in your head or just before your close body tag. -->
    <script async defer src="https://buttons.github.io/buttons.js"></script>
</svelte:head>

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
    {`import { optimizeImage } from "svelte-sharp-image/server";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url, {
        safeEndpoints: ["i.mrxbox98.me"],
    });
};
`}
</blockquote>
<p>
    You can also pass in a config object into the <code>optimizeImage</code> function.
</p>
<blockquote style="white-space: pre-line">
    {`export type ImageOptimizeConfig = {
    getCache?: (tag: string) => Promise<Buffer | undefined>;
    saveCache?: (tag: string, buffer: Buffer) => Promise<void>;
    safeEndpoints?: string[];
}`}
</blockquote>
<p>Then use the <code>Image</code> component from the library.</p>
<blockquote style="white-space: pre-line">
    {`<Image src="https://i.mrxbox98.me/file/2024/08/chrome_Sb3dUdhQfy.png"  style="width: 200px" />
<Image src="/favicon.png" />`}
</blockquote>
<p>Yields the following result:</p>
<Image
    src="https://i.mrxbox98.me/file/2024/08/chrome_Sb3dUdhQfy.png"
    width={100}
    height={100}
    position="left"
/>
<Image src="/favicon.png" />
<p>
    You can view the source of the images to check the format and compression.
</p>
<p>
    The Image component simply extends the base html img, so all props that work
    on img will also work and affect Image. This includes class, style etc...
</p>
<p>If you like this tool, consider staring the repo:</p>
<!-- Place this tag where you want the button to render. -->
<a
    class="github-button"
    href="https://github.com/emergencybucket/svelte-sharp-image"
    data-color-scheme="no-preference: light; light: light; dark: dark;"
    data-icon="octicon-star"
    data-size="large"
    aria-label="Star emergencybucket/svelte-sharp-image on GitHub">Star</a
>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap");
    @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap");

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
