<script lang="ts">
    export let src: string;
    export let width: number;
    export let height: number;
    let clazz: string | undefined;
    export { clazz as class };
    export let format = "webp";
    export let alt: string | undefined;

    let searchParams = new URLSearchParams();

    searchParams.append("width", width.toString());
    searchParams.append("height", height.toString());
    searchParams.append("url", src);
    if(format) {
        searchParams.append("format", format);
    }

    src = "/api/image?" + searchParams.toString();
</script>

<img
    {width}
    {height}
    {src}
    {alt}
    class={clazz}
    loading="lazy"
    decoding="async"
/>
