<template>
    <Dialog v-model:visible="visible" title="false" destroy-on-close ref="dialog" @close="closeCallback" @closed="closedCallback" :loading="loading"
        :min-height="554" close-on-click-modal close-on-press-esc>
        <div class="subs-header">
            <div class="subs-type">
                <span class="subs-origin-type limited-box one-line"
                    :class="'origin-type-' + (subscribe.originType[0] || 'unknown')">{{ subscribe.originType[1] || '-'
                    }}</span>
                <span class="subs-type-tag limited-box one-line">{{ subscribe.typeTag || '-' }}</span>
            </div>
            <div class="subs-title">
                <span class="subs-title-cn limited-box one-line">{{ subscribe.name || '-' }}</span>
                <span class="subs-title-jp limited-box one-line">{{ subscribe.nameJP || '-' }}</span>
            </div>
        </div>
        <div class="subs-main">
            <div class="subs-main-left">
                <Image :src="subscribe.cover" class="subs-cover"></Image>
                <div class="subs-link-box">
                    <a v-for="(val, k) of subscribe.link" :key="k" :href="val.href" target="_blank" rel="noopener">{{
                        val.title || '-' }}</a>
                </div>
                <div class="subs-broadcast">
                    <span v-html="subscribe.broadcast[0] || '-'"></span>
                    <span v-html="subscribe.broadcast[1] || ''"></span>
                </div>
                <div class="subs-copyright-box">
                    <a v-for="(val, k) of subscribe.copyright" :key="k" :href="val.href" target="_blank" rel="noopener">
                        <Image :src="val.image"></Image>
                        <p>{{ val.area || '-' }}</p>
                    </a>
                </div>
            </div>
            <div class="subs-main-right">
                <div class="subs-info-switch" @click="viewSwitch = !viewSwitch" v-if="subscribe.results.length > 0">
                    <i :class="viewClass"></i>
                    <span>{{ viewSwitch ? '隐藏Staff&Cast' : '显示Staff&Cast' }}</span>
                </div>
                <div class="subs-info-box" v-show="viewSwitch">
                    <div class="subs-staff" v-html="subscribe.staff || '-'"></div>
                    <div class="subs-cast" v-html="subscribe.cast || '-'"></div>
                </div>
                <div class="results-box">
                    <div class="results-scroll" v-if="subscribe.results.length > 0">
                        <div v-for="(val, key) of subscribe.results" :key="key" class="results-item"
                            @click="openTorrent(val)">
                            <span :title="val.title">{{ val.title }}</span>
                            <span>[{{ val.episode }}] 上传时间: {{ val.pubDate }}</span>
                        </div>
                    </div>
                    <div class="results-empty" v-else>
                        <span>无结果</span>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { onMounted, watch, ref, defineEmits, useTemplateRef, nextTick, computed } from 'vue';
import { getApi, cancel } from '@/api';
import message from '@/message';
import Dialog from '../common/Dialog.vue';
import Image from '../common/Image.vue';

const initSubscribe = () => {
    unique.value = 0;
    return {
        originType: [],
        cover: '',
        link: [],
        broadcast: [],
        copyright: [],
        results: []
    }
}

// data
const unique = defineModel();
const subscribe = ref(initSubscribe());
const dialogRef = useTemplateRef("dialog");
const visible = ref(false);
const loading = ref(true);
const viewSwitch = ref(true);

let lastRequest = null;

const getDialogEl = () => dialogRef.value.$el;

// watch
watch(() => unique.value, (v) => {
    if (v > 0) {
        cancel(lastRequest);
        show();
        lastRequest = getApi().getResults({ id: v }, data => {
            const isFin = data.fin === 'Y';
            const results = Array.from(data.results);
            if (isFin && results.length > 0) {
                results.unshift({
                    title: '复制全部下载链接到剪贴板',
                    episode: 'ALL',
                    pubDate: '-',
                    copyAll: true,
                    torrent: results.map(o => o.torrent).join(" ")
                })
            }
            const originType = (data.originType || '').split('-');
            const broadcast = (data.broadcast || '').split('-');
            subscribe.value = { ...data, broadcast, originType, results, isResults: true };
            lastRequest = null;
            loading.value = false;
            viewSwitch.value = results.length === 0;
        }, () => {
            setTimeout(close, 1000);
        })
    }
})

// methods
const openTorrent = (res) => {
    const dialog_ = getDialogEl();
    if (res.copyAll) {
        const input = document.createElement("input");
        input.value = res.torrent;
        dialog_.appendChild(input);
        input.select();
        document.execCommand('copy');
        dialog_.removeChild(input);
        message.success('已复制种子链接到剪贴板.', { duration: 2000, appendTo: dialog_ })
        return
    }
    const a = document.createElement("a")
    a.href = res.torrent
    a.style = "display: none"
    dialog_.appendChild(a)
    a.click()
    dialog_.removeChild(a)
}

const show = () => {
    loading.value = true;
    visible.value = true;
}

const close = () => {
    visible.value = false;
}

const closeCallback = () => {
    cancel(lastRequest);
    unique.value = 0;
}

const closedCallback = () => {
    subscribe.value = initSubscribe();
    loading.value = false;
}

// computed
const viewClass = computed(() => {
    return viewSwitch.value ? 'icon-eye' : 'icon-eye-off';
})

</script>

<style scoped>
.dialog-container {
    --subs-line-height: 20px;
}

/* dialog */
.subs-header {
    --subs-header-height-2: calc(var(--subs-header-height) - var(--subs-header-height-1));
    height: var(--subs-header-height);
    display: flex;
    flex-direction: row;
    gap: 0;
}

.subs-type {
    width: var(--subs-cover-width);
    font-size: var(--font-size-small);
    text-align: center;
}

.subs-type .subs-origin-type {
    --limited-box-height: var(--subs-header-height-1);
    color: #fff;
    background-color: var(--origin-type-color);
    user-select: none;
}

.subs-type .subs-type-tag {
    --limited-box-height: var(--subs-header-height-2);
    font-size: var(--font-size-mini);
    background-color: #c0c0c0;
    user-select: none;
}

.subs-title {
    width: calc(100% - var(--subs-cover-width));
    box-sizing: border-box;
    color: #f0f0f0;
}

.subs-title .subs-title-cn {
    padding-left: 4px;
    --limited-box-height: var(--subs-header-height-1);
    font-size: var(--font-size-small);
    background-color: #333;
}

.subs-title .subs-title-jp {
    padding-left: 4px;
    --limited-box-height: var(--subs-header-height-2);
    font-size: var(--font-size-mini);
    background-color: #5c5c5c;
}

/* dialog main */
.subs-main {
    height: 500px;
    display: flex;
    flex-direction: row;
    gap: 0;
}

.subs-main-left {
    width: var(--subs-cover-width);
    display: flex;
    flex-direction: column;
    gap: var(--subs-gap);
}

.subs-cover,
.subs-cover :deep(img) {
    width: var(--subs-cover-width);
    height: calc(var(--subs-cover-width) / 0.8);
}

.subs-broadcast {
    font-size: var(--font-size-small);
    text-align: center;
    user-select: none;
    display: flex;
    flex-direction: column;
}

.subs-broadcast span:first-of-type {
    background-color: #333;
    color: #f0f0f0;
}

.subs-broadcast span:last-of-type {
    background-color: #c0c0c0;
    color: #333;
}

.subs-link-box,
.subs-copyright-box {
    display: flex;
    flex-direction: column;
    gap: var(--subs-gap);
    background-color: #f1f1f1;
}

.subs-link-box a,
.subs-copyright-box a {
    outline: 0;
    text-decoration: none;
    color: #555;
    line-height: var(--subs-line-height);
    font-size: var(--font-size-small);
    text-align: center;
    box-sizing: border-box;
}

.subs-copyright-box a {
    padding: 2px;
    transition: all .3s;
}

.subs-link-box a:hover,
.subs-copyright-box a:hover {
    color: #222;
    text-decoration: underline;
}

.subs-copyright-box a:hover {
    box-shadow: inset 0 0 2px 0 var(--color-gray-0);
    border-radius: 6px;
}

.subs-copyright-box a p {
    margin: 0;
}

.subs-main-right {
    width: calc(100% - var(--subs-cover-width));
    display: flex;
    flex-direction: column;
}

.subs-info-switch {
    text-align: center;
    height: 24px;
    line-height: 24px;
    background-color: #f1f1f1;
    cursor: pointer;
    user-select: none;
    color: var(--color-gray-1);
    text-decoration: underline;
    font-size: 14px;
}

.subs-info-switch:hover {
    color: var(--color-blue-0);
}

.subs-info-box {
    font-size: var(--font-size-small);
    display: flex;
    flex-direction: row;
    background-color: #f1f1f1;
}

.subs-cast,
.subs-staff {
    padding: 4px;
    box-sizing: border-box;
}

/* Results */
.results-box {
    --results-item-height: var(--subs-header-height);
    --results-item-height-1: var(--subs-header-height-1);
    --results-item-height-2: var(--subs-header-height-2);
    display: block;
    padding: 2px;
    overflow: auto;
    box-sizing: border-box;
    flex-grow: 1;
}

.results-scroll {
    display: flex;
    flex-direction: column;
    gap: var(--subs-gap);
}

.results-item {
    background-color: #dee1e1;
    display: flex;
    flex-direction: column;
    border-radius: 4px;
    width: 100%;
    position: relative;
    cursor: pointer;
    height: var(--results-item-height);
    box-sizing: border-box;
    transition: 0.3s;
}

.results-item:hover {
    background-color: #c1c1c1;
}

.results-item span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    box-sizing: border-box;
    padding: 0 4px;
    display: block;
    width: 100%;
    line-height: var(--results-item-height-1);
    font-size: var(--font-size-small);
}

.results-item span:last-of-type {
    color: grey;
    font-size: var(--font-size-small);
    line-height: var(--results-item-height-2);
}

.results-empty {
    height: var(--results-item-height);
    width: 100%;
    border-radius: 4px;
    background-color: #dee1e1;
}

.results-empty span {
    line-height: var(--results-item-height);
    font-size: var(--font-size-small);
    display: block;
    text-align: center;
    padding: 0 4px;
    user-select: none;
    color: var(--color-black-0);
}

:deep(.dialog-close) {
    top: 3px;
    right: 3px;
}
</style>