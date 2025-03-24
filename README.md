# Svelte Sharp Image

## Usage

1. Create a new api route at `/routes/api/image/+server.ts` with the following code:

```typescript
import { optimizeImage } from "svelte-sharp-image";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    return await optimizeImage(url);
};
```

You can now use the `Image.svelte` component imported from the `svelte-sharp-image` package.
