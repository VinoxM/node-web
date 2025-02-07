<template>
    <div class="image-box" :class="{ 'skeleton-loading': loading }">
        <img v-show="!loading && !error" class="image" ref="img" :src="href" />
        <span v-if="error" class="error">图片加载失败</span>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, useTemplateRef } from 'vue';

const { src, mixed } = defineProps({
    src: String,
    mixed: {
        type: Boolean,
        required: false,
        default: false
    }
})

const href = computed(() => {
    if (mixed) {
        let c = src;
        const protocol = document.location.protocol;
        const protocolIndex = c.indexOf('://');
        if (protocolIndex > -1) {
            c = protocol + c.substring(protocolIndex + 1);
        }
        return c;
    }
    return src;
})

const loading = ref(true);
const error = ref(false);
const img = useTemplateRef('img');

onMounted(() => {
    img.value.onload = () => {
        loading.value = false;
        error.value = false;
    }
    img.value.onerror = () => {
        error.value = true;
        loading.value = false;
    }
    img.value.onabort = () => {
        error.value = true;
        loading.value = false;
    }
})
</script>

<style scoped>
.image-box {
    position: relative;
    display: flex;
    justify-content: center;
}

.error {
    display: inline-block;
    height: 20px;
    line-height: 20px;
    font-size: var(--font-size-mini);
    color: var(--color-gray-0);
    width: 100%;
    margin: auto 0;
    text-align: center;
    user-select: none;
}
</style>