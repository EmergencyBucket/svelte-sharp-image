<script lang="ts">
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

    $$restProps.src = "/api/image?" + searchParams.toString();
</script>

<img {...$$restProps} />
