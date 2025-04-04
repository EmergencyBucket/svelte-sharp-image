<script lang="ts">
    import type { HTMLImgAttributes } from "svelte/elements";

    interface $$Props extends HTMLImgAttributes {
        format?: string;
        position?: string;
    }

    let searchParams = new URLSearchParams();

    if ($$restProps.width) {
        searchParams.append("width", $$restProps.width.toString());
    }
    if ($$restProps.height) {
        searchParams.append("height", $$restProps.height.toString());
    }
    searchParams.append("url", btoa($$restProps.src));
    if ($$restProps.format) {
        searchParams.append("format", $$restProps.format);
    }

    if ($$restProps.position) {
        searchParams.append("position", $$restProps.position);
    }

    $$restProps.src = "/api/image?" + searchParams.toString();
</script>

<img {...$$restProps} />
