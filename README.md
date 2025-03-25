# Svelte Sharp Image

## Usage

1. Create a new api route at `/routes/api/image/+server.ts` with the following code:

```typescript
import { optimizeImage } from "svelte-sharp-image/server";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url);
};
```

You can also pass in a config to this function:

```typescript
export type ImageOptimizeConfig = {
    getCache?: (tag: string) => Promise<Buffer | undefined>;
    saveCache?: (tag: string, buffer: Buffer) => Promise<void>;
    safeEndpoints?: string[];
};
```

There are two default cache functions which you can use exported from the `FileCache` class.

You can now use the `Image.svelte` component imported from the `svelte-sharp-image` package.
