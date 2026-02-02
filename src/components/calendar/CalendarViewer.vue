<template>
    <Dialog v-model:visible="visible" title="false" destroy-on-close ref="dialog" @close="closeCallback"
        @closed="closedCallback" :loading="loading" :min-height="554" close-on-click-modal close-on-press-esc>
        <div class="subs-header">
            <div class="subs-type">
                <span class="subs-origin-type limited-box one-line"
                    :class="'origin-type-' + (subscribe.originType[0] || 'unknown')">{{ subscribe.originType[1] || '-'
                    }}</span>
            </div>
            <div class="subs-title">
                <span class="subs-title-cn limited-box one-line">{{ subscribe.name || '-' }}</span>
                <span class="subs-title-jp limited-box one-line">{{ subscribe.nameJP || '-' }}</span>
            </div>
        </div>
        <div class="subs-main">
            <div class="subs-main-left">
                <span class="subs-type-tag limited-box" v-html="subscribe.typeTag || '-'"></span>
                <Image :src="subscribe.cover" class="subs-cover"></Image>
                <div class="subs-link-box">
                    <a v-for="(val, k) of subscribe.link" :key="k" :href="val.href" target="_blank" rel="noopener"
                        v-href>{{
                            val.title || '-' }}</a>
                </div>
                <div class="subs-broadcast">
                    <span v-html="subscribe.broadcast[0] || '-'"></span>
                    <span v-html="subscribe.broadcast[1] || ''"></span>
                </div>
                <div class="subs-copyright-box">
                    <a v-for="(val, k) of subscribe.copyright" :key="k" :href="val.href" target="_blank" rel="noopener"
                        v-href>
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
                <div class="subs-info-box" :class="{ hidden: !viewSwitch }">
                    <div class="subs-info-box-container">
                        <div class="subs-staff" v-html="subscribe.staff || '-'"></div>
                        <div class="subs-cast" v-html="subscribe.cast || '-'"></div>
                    </div>
                </div>
                <div class="subs-tab-switch" v-if="authed">
                    <Link :type="activeTab === tabDicts.results ? 'primary' : 'normal'"
                        :active="activeTab === tabDicts.results" @click="activeTab = tabDicts.results">番剧结果</Link>
                    <Link :type="activeTab === tabDicts.episode ? 'primary' : 'normal'"
                        :active="activeTab === tabDicts.episode" @click="activeTab = tabDicts.episode">番剧剧集</Link>
                </div>
                <div class="results-box" v-show="activeTab === tabDicts.results">
                    <div class="results-scroll" v-if="subscribe.results.length > 0">
                        <div v-for="(val, key) of subscribe.results" :key="key" class="results-item"
                            @click.stop="copyTorrent(val)">
                            <span :title="val.title">{{ val.title }}</span>
                            <span>[{{ val.episode }}] 上传时间: {{ val.pubDate }}</span>
                            <span>{{ taskInfo(val) }}</span>
                            <div class="results-btn-box" :class="{ touchable }" v-if="!val.copyAll">
                                <Button icon="feather" border-less plain @click.stop="openTorrent(val)"></Button>
                                <Button v-if="authed" icon="rss-squared" type="warning" border-less plain
                                    :disabled="!!val.taskId" :loading="addTorrentLoading"
                                    @click.stop="uploadTorrent(val)"></Button>
                            </div>
                        </div>
                    </div>
                    <div class="results-empty" v-else>
                        <span>无结果</span>
                    </div>
                </div>
                <div class="episode-box" v-if="authed" v-show="activeTab === tabDicts.episode">
                    <div class="episode-scroll" v-if="subscribe.episode?.length > 0">
                        <Button v-for="(val, key) of subscribe.episode" :key="key" :type="episodeType(val)" plain
                            border-less :disabled="episodeDisabled(val)" @click="episodeClicked(val)">
                            {{ val.episode }}
                        </Button>
                    </div>
                    <div class="episode-empty" v-else>
                        <span>无剧集</span>
                    </div>
                </div>
            </div>
        </div>
    </Dialog>
</template>

<script setup>
import { onMounted, watch, ref, useTemplateRef, computed, inject } from 'vue';
import { getApi, cancel } from '@/api';
import message from '@/message';
import Dialog from '../common/Dialog.vue';
import Image from '../common/Image.vue';
import Button from '../common/Button.vue';
import Link from '../common/Link.vue';

const initSubscribe = () => {
    unique.value = 0;
    return {
        originType: [],
        cover: '',
        link: [],
        broadcast: [],
        copyright: [],
        results: [],
        episode: []
    }
}

const tabDicts = {
    results: 'results',
    episode: 'episode'
}

const taskStatusMap = {
    '0': '失败',
    '1': '下载中',
    '2': '解析中',
    '3': '解析失败',
    '4': '上传中',
    '5': '完成',
    '6': '部分完成'
}

// data
const unique = defineModel();
const subscribe = ref(initSubscribe());
const dialogRef = useTemplateRef("dialog");
const visible = ref(false);
const loading = ref(true);
const viewSwitch = ref(true);
const addTorrentLoading = ref(false);
const touchable = ref(false);
const activeTab = ref(tabDicts.results);

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
            subscribe.value = { ...data, broadcast, originType, results };
            lastRequest = null;
            loading.value = false;
            viewSwitch.value = results.length === 0;
            if (!authed) {
                activeTab.value = tabDicts.results;
            } else {
                torrentInfoInterval.start();
            }
        }, () => {
            setTimeout(close, 1000);
        })
    }
})

// methods
const openTorrent = (res) => {
    const dialog_ = getDialogEl();
    if (res.copyAll) {
        copyTorrent(res)
    }
    const a = document.createElement("a")
    a.href = res.torrent
    a.style = "display: none"
    dialog_.appendChild(a)
    a.click()
    dialog_.removeChild(a)
}

const copySomething = (str, msg) => {
    const dialog_ = getDialogEl();
    const textarea = document.createElement("textarea");
    textarea.value = str;
    dialog_.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    dialog_.removeChild(textarea);
    message.success(msg, { duration: 2000, appendTo: dialog_ })
}

const copyTorrent = (res) => copySomething(res.torrent, '已复制种子链接到剪贴板.')

const show = () => {
    loading.value = true;
    visible.value = true;
}

const close = () => {
    visible.value = false;
}

const closeCallback = () => {
    cancel(lastRequest);
    torrentInfoInterval.stop();
    unique.value = 0;
}

const closedCallback = () => {
    subscribe.value = initSubscribe();
    loading.value = false;
}

const uploadTorrent = (val) => {
    if (!authed.value || val.taskId || addTorrentLoading.value) return
    addTorrentLoading.value = true
    const dialog_ = getDialogEl();
    const params = {
        rssSubsId: unique.value,
        rssResultId: val.id
    }
    getApi('task').addTask(params, taskInfo => {
        message.success('已上传至SER', { duration: 2000, appendTo: dialog_ })
        addTorrentLoading.value = false
        val.taskId = taskInfo.id
        val.taskStatus = taskInfo.status
        torrentInfoInterval.start()
    }, () => {
        addTorrentLoading.value = false
    })
}

const episodeType = (val) => {
    if (val.status === '1') {
        return 'primary'
    } else if (val.status === '2') {
        return 'warning'
    } else {
        return 'info'
    }
}

const episodeDisabled = (val) => val.status !== '1'

const episodeClicked = (val) => {
    if (episodeDisabled(val)) return
    getApi('task').generateMinioLink({ episodeId: val.id }, link => copySomething(link, '已复制视频链接到剪贴板.'))
}

const taskInfo = (val) => {
    if (!val.taskId) return ''
    let result = taskStatusMap[val.taskStatus] || 'UNKNOWN'
    if (val.taskStatus === '1') {
        result += `: [${val.taskState || 'UNKNOWN'}] ${val.taskPercent || ''}`
    }
    return result
}

// computed
const viewClass = computed(() => {
    return viewSwitch.value ? 'icon-eye' : 'icon-eye-off';
})

const authed = inject('authorization')

// torrent info
const getTaskInfo = (taskIds) => {
    cancel(torrentInfoInterval.lastRequest)
    torrentInfoInterval.lastRequest = getApi('task').taskInfo({ taskIds }, data => {
        torrentInfoInterval.lastRequest = null
        if (!data || data.length === 0) return;
        const results = subscribe.value.results
        Array.from(data).forEach(d => {
            results.some(r => {
                const b = r.taskId === d.id
                if (b) {
                    r.taskPercent = d.percent
                    r.taskState = d.state
                }
                return b
            })
        })
        torrentInfoInterval.next()
    }, () => torrentInfoInterval.stop())
}

const torrentInfoInterval = {
    lastRequest: null,
    timeout: null,
    delay: 2000,
    started: false,
    getTaskIds: () => {
        const taskIds = []
        subscribe.value.results.forEach(r => r.taskId && r.taskStatus === '1' && taskIds.push(r.taskId))
        return taskIds
    },
    start: () => {
        if (torrentInfoInterval.started) return
        torrentInfoInterval.started = true
        torrentInfoInterval.next()
    },
    next: () => {
        const taskIds = torrentInfoInterval.getTaskIds()
        if (taskIds.length > 0) {
            torrentInfoInterval.timeout = setTimeout(() => getTaskInfo(taskIds), torrentInfoInterval.delay)
        }
    },
    stop: () => {
        cancel(torrentInfoInterval.lastRequest)
        if (torrentInfoInterval.timeout) {
            clearTimeout(torrentInfoInterval.timeout)
            torrentInfoInterval.timeout = null
        }
        torrentInfoInterval.started = false
    }
}

onMounted(() => {
    touchable.value = 'ontouchstart' in document.documentElement
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
    --limited-box-height: var(--subs-header-height);
    color: #fff;
    background-color: var(--origin-type-color);
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

.subs-main-left .subs-type-tag {
    --limited-box-height: var(--subs-header-height-2);
    font-size: var(--font-size-mini);
    background-color: #c0c0c0;
    text-align: center;
    user-select: none;
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
    display: grid;
    grid-template-rows: 1fr;
    transition: 0.3s;
}

.subs-info-box.hidden {
    grid-template-rows: 0fr;
}

.subs-info-box-container {
    font-size: var(--font-size-small);
    display: flex;
    flex-direction: row;
    background-color: #f1f1f1;
    overflow: hidden;
}

.subs-cast,
.subs-staff {
    padding: 4px;
    box-sizing: border-box;
}

/* Switch */
.subs-tab-switch {
    display: flex;
    flex-direction: row;
    gap: 5px;
    font-size: 14px;
    justify-content: center;
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
    min-height: var(--results-item-height);
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

.results-item span:not(:first-of-type) {
    color: grey;
    font-size: var(--font-size-small);
    line-height: var(--results-item-height-2);
}

.results-btn-box {
    height: var(--results-item-height);
    line-height: var(--results-item-height);
    position: absolute;
    right: var(--subs-gap);
    top: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--subs-gap);
}

.results-btn-box:not(.touchable) {
    visibility: hidden;
}

.results-item:not(.touchable):hover .results-btn-box {
    visibility: visible;
}

.results-btn-box button {
    padding: 0;
    width: var(--subs-btn-size);
    height: var(--subs-btn-size);
    line-height: var(--subs-btn-size);
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

/* episode */
.episode-box {
    --episode-button-height: var(--subs-header-height);
    padding: 2px;
    overflow: auto;
    box-sizing: border-box;
    flex-grow: 1;
}

.episode-scroll {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
}

.episode-scroll button {
    height: var(--episode-button-height);
    line-height: var(--episode-button-height);
    width: calc(var(--episode-button-height) * 1.5);
    transition: all 0.2s;
}

.episode-empty {
    height: var(--episode-button-height);
    width: 100%;
    border-radius: 4px;
    background-color: #dee1e1;
}

.episode-empty span {
    line-height: var(--episode-button-height);
    font-size: var(--font-size-small);
    display: block;
    text-align: center;
    padding: 0 4px;
    user-select: none;
    color: var(--color-black-0);
}
</style>