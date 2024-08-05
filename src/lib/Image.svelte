<script lang="ts">
    export let src: string;
    export let width: number | undefined = undefined;
    export let height: number | undefined = undefined;
    let clazz: string | undefined = undefined;
    export { clazz as class };
    export let format = "webp";
    export let alt = "";
    export let style: string | undefined = undefined;
    export let loading: "lazy" | "eager" = "lazy";
    export let decoding: "auto" | "async" | "sync" = "async";

    let searchParams = new URLSearchParams();

    if (width) {
        searchParams.append("width", width.toString());
    }
    if (height) {
        searchParams.append("height", height.toString());
    }
    searchParams.append("url", btoa(src));
    if (format) {
        searchParams.append("format", format);
    }

    src = "/api/image?" + searchParams.toString();
</script>

<img {width} {height} {src} {alt} class={clazz} {loading} {decoding} {style} />
