<template>
    <Dialog class="view-player-container" v-model:visible="visible" title="false" close-on-click-modal destroy-on-close
        ref="dialog" @close="closeCallback" @closed="closedCallback" :loading="loading">
        <video ref="videoRef" class="view-player" :src="source" controls autoplay @error="onVideoError"
            @ended="clearSaveInterval" @pause="clearSaveInterval" @play="startSaveInterval"
            @loadedmetadata="resumeProgress"></video>
    </Dialog>
</template>

<script setup>
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import Dialog from '../common/Dialog.vue';
import message from '@/message';
import { getApi, cancel } from '@/api';

const PROGRESS_KEY = "calendar-video-history"

const dialogRef = useTemplateRef("dialog");
const episodeId = defineModel();

const getDialogEl = () => dialogRef.value.$el;

const videoRef = ref(null)
const source = ref(null)

const visible = ref(false)
const loading = ref(true)

let lastRequest = null;

watch(() => episodeId.value, v => {
    if (v > 0) {
        cancel(lastRequest);
        show();
        lastRequest = getApi('episode').generateMinioLink({ episodeId: episodeId.value }, link => {
            source.value = link;
            loading.value = false;
            lastRequest = null;
        }, () => {
            setTimeout(close, 1000);
        })
    }
})

const show = () => {
    visible.value = true;
    loading.value = true;
}

const close = () => {
    visible.value = false;
}

function closeCallback() {
    cancel(lastRequest);
    episodeId.value = 0;
    clearSaveInterval();
}

function closedCallback() {
    source.value = null;
    loading.value = false;
}

function onVideoError() {
    const dialog_ = getDialogEl()
    message.error('加载视频失败', { duration: 2000, appendTo: dialog_ })
    close()
}

/** player progress */
const getHistoryMap = () => JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
const setHistoryMap = (map) => localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));

let saveInterval = null

const startSaveInterval = () => {
    clearSaveInterval();
    saveInterval = setTimeout(() => {
        if (videoRef.value && episodeId.value) {
            const m = getHistoryMap();
            m[episodeId.value] = videoRef.value.currentTime;
            setHistoryMap(m);
        }
    }, 5000);
}

const clearSaveInterval = () => {
    clearTimeout(saveInterval);
    saveInterval = null
}

const resumeProgress = () => {
    videoRef.value?.focus()
    startSaveInterval()
    nextTick(() => {
        const t = getHistoryMap()[episodeId.value];
        if (t && videoRef.value) {
            videoRef.value.currentTime = t;
            const dialog_ = getDialogEl()
            message.success('已恢复上次播放进度', { duration: 2000, appendTo: dialog_ })
        }
    })
}

</script>

<style>
.view-player-container .dialog-container {
    width: auto;
    height: auto;
    background-color: transparent;
}

.view-player-container .dialog-close {
    color: var(--color-white-0);
}

.view-player-container .dialog-close:hover {
    color: var(--color-red-0);
}

.view-player-container .dialog-main {
    margin: 30px;
    width: calc(100% - 60px);
    height: calc(100% - 60px);
    max-width: 100vw;
    max-height: 100vh;
    object-fit: contain;
    background-color: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
}

.view-player {
    margin: auto;
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    min-width: var(--dialog-width);
    min-height: calc(var(--dialog-width) / 16 * 9);
}
</style>