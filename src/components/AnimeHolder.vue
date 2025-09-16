<template>
    <div class="ani-holder-box drag">
        <img class="favicon" :src="windowIcon" />
        <span class="title">{{ windowTitle }}</span>
        <div class="ani-holder-btns no-drag">
            <i class="icon-minus-outline" @click="windowMinimize"></i>
            <i :class="pinClass" @click="windowPinToggle" @click.right="windowMaximize"></i>
            <i class="icon-close-outline" @click="windowClose"></i>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

const pined = ref(false);
const pinClass = computed(() => pined.value ? 'icon-pin' : 'icon-pin-outline');
const windowIcon = ref('');
const windowTitle = ref('Anime Calendar');

const ipc = window.ipc || {};

const windowMinimize = () => {
    ipc.minimizeWindow?.();
}

const windowMaximize = () => {
    ipc.maximizeWindow?.();
}

const windowPinToggle = () => {
    ipc.toggleWindowAlwaysOnTop?.(val=>pined.value = val);
}

const windowClose = () => {
    ipc.closeWindow?.();
}

onMounted(() => {
    windowIcon.value = new URL(`@/assets/icons/anime-rss.png`, import.meta.url).href;
    ipc.onTopChanged?.(val => pined.value = val);
})
</script>