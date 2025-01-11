<template>
    <div class="ani-main">
        <div class="ani-header">
            <div class="season-search-box">
                <div class="ani-arrow-box">
                    <div class="ani-background ani-arrow arrow-left" @click="setupSeasonYearStep(-1)"></div>
                    <div class="ani-background ani-arrow arrow-right" @click="setupSeasonYearStep(1)"></div>
                </div>
                <input v-if="searchVisible" ref="search" class="season-search" v-model="seasonYearTemp"
                    @blur="hideSearch" />
                <div v-else class="season-year" @click="showSearch">
                    <span>{{ seasonYear }}</span>
                </div>
            </div>
            <div class="season-btn-container">
                <div class="season-btn-box">
                    <div class="season-btn season-btn-01" :class="seasonBtnArray[0].style"
                        @click="getSearchByMonth('01')">
                        <span class="label">1月新番</span>
                        <span class="count">{{ seasonBtnArray[0].count }}</span>
                    </div>
                    <div class="season-btn season-btn-04" :class="seasonBtnArray[1].style"
                        @click="getSearchByMonth('04')">
                        <span class="label">4月新番</span>
                        <span class="count">{{ seasonBtnArray[1].count }}</span>
                    </div>
                </div>
                <div class="season-btn-box">
                    <div class="season-btn season-btn-07" :class="seasonBtnArray[2].style"
                        @click="getSearchByMonth('07')">
                        <span class="label">7月新番</span>
                        <span class="count">{{ seasonBtnArray[2].count }}</span>
                    </div>
                    <div class="season-btn season-btn-10" :class="seasonBtnArray[3].style"
                        @click="getSearchByMonth('10')">
                        <span class="label">10月新番</span>
                        <span class="count">{{ seasonBtnArray[3].count }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="ani-scroll">
            <div class="ani-container-row">
                <CalenderContainer v-for="(val, key) in dataDict" :key="key" v-bind="val" @item-click="itemClick">
                </CalenderContainer>
            </div>
        </div>
        <div class="ani-arrow-box">
            <div class="ani-background ani-arrow arrow-left" @click="setupStepForClick(-1)"></div>
            <div class="ani-background ani-arrow arrow-right" @click="setupStepForClick(1)"></div>
        </div>
        <t-dialog v-model:visible="dialogVisible">
            <template v-slot:header>
                <span @click="currentSubscribe.isResults = !currentSubscribe.isResults" class="dialog-title">{{
                    currentSubscribe.isResults ? '番剧结果' : '番剧详情' }}</span>
            </template>
            <div class="results-box">
                <div v-if="currentSubscribe.results" class="results-scroll">
                    <div v-for="(val, key) of currentSubscribe.results" :key="key" class="results-item"
                        @click="openTorrent(val)">
                        <span :title="val.title">{{ val.title }}</span>
                        <span>[{{ val.episode }}] 上传时间: {{ val.pubDate }}</span>
                    </div>
                </div>
            </div>
        </t-dialog>
    </div>
</template>

<script setup>
import { getCurrentInstance, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch, watchEffect } from 'vue';
import CalenderContainer from './calender/CalenderContainer.vue';

const dataDict = ref(null);
const webArr = ref(null);
const season = ref([]);
const dialogVisible = ref(false);
const searchVisible = ref(false);
const seasonYear = ref('');
const seasonYearTemp = ref('');
const seasonMonth = ref('');
const searchRef = useTemplateRef('search');
const seasonDict = ref([]);
const seasonBtnArray = ref([{ style: '' }, { style: '' }, { style: '' }, { style: '' }]);
const currentSubscribe = ref({});

let nowDay = 0;
let proxy = null;

/* common */
const getProxy = () => {
    if (proxy === null) {
        proxy = getCurrentInstance().proxy;
    }
    return proxy;
}

const initCurSeason = () => {
    let now = new Date();
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    let month = now.getMonth() + 1;
    month = (Math.ceil(month / 3) - 1) * 3 + 1;
    return [now.getFullYear() + '', String(month).padStart(2, '0')];
}

/* api func */
const getSearch = (season, search = '') => {
    dataDict.value = null;
    getProxy().$api.getSearch({ season, search }).then(data => {
        const { dayDictArray, webArray, nowDay: nowDay_ } = data;
        dataDict.value = dayDictArray;
        webArr.value = webArray;
        nowDay = nowDay_ === 0 ? 7 : nowDay_;
        setupTransforStep();
        setupSeasonYearStep();
    }).catch(e => {
        console.error(e);
    })
}

const getSeason = () => {
    return getProxy().$api.getSeason().then(data => {
        seasonDict.value = data;
    })
}

const setupSeasonYearStep = (step = 0) => {
    seasonYear.value = (Number(seasonYear.value) + step) + '';
    setupSeasonBtnArray();
}

const setupSeasonBtnArray = () => {
    const result = [];
    for (const month of ['01', '04', '07', '10']) {
        const s = seasonYear.value + '-' + month;
        const allow = seasonDict.value.hasOwnProperty(s);
        result.push({
            month,
            style: {
                active: season.value[0] === seasonYear.value && season.value[1] === month,
                disabled: !allow
            },
            count: allow ? seasonDict.value[s] : 0
        })
    }
    seasonBtnArray.value = result;
}

const getSearchByMonth = (month) => {
    const year = seasonYear.value;
    if (season.value[0] === year && season.value[1] === month) {
        return
    }
    const allow = seasonDict.value.hasOwnProperty(year + '-' + month);
    if (allow) {
        seasonMonth.value = month;
        season.value = [year, month];
        getSearch(season.value.join('-'));
    }
}

/* search */
const showSearch = () => {
    searchVisible.value = true;
    nextTick(() => {
        seasonYearTemp.value = seasonYear.value;
        const search = searchRef.value;
        search.focus();
    })
}

const hideSearch = () => {
    searchVisible.value = false;
    if (/^[0-9]{4}$/.test(seasonYearTemp.value)) {
        seasonYear.value = seasonYearTemp.value
    }
}

/* dialog */
const itemClick = (unique) => {
    getProxy().$api.getResults({ id: unique }).then(data => {
        console.log(data)
        let cover = data.cover
        const protocol = document.location.protocol;
        const protocolIndex = cover.indexOf('://');
        if (protocolIndex > -1) {
            cover = protocol + cover.substring(protocolIndex + 1);
        }
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
        currentSubscribe.value = { ...data, results, cover, isResults: true };
        dialogVisible.value = true;
    })
}

const openTorrent = (res) => {
    if (res.copyAll) {
        const input = document.createElement("input");
        input.value = res.torrent;
        const dialog = document.getElementById('dialog');
        dialog.appendChild(input);
        input.select();
        document.execCommand('copy');
        dialog.removeChild(input);
        // TODO: notify()
        return
    }
    const a = document.createElement("a")
    a.href = res.torrent
    a.style = "display: none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

/* document height */
const setupDocumentHeight = () => {
    let vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    setupTransforStep();
}

/* calender step */
const setupStepForClick = (incr) => {
    const step = Number(getComputedStyle(document.documentElement).getPropertyValue('--row-transform-step'));
    const maxCount = Number(getComputedStyle(document.documentElement).getPropertyValue('--row-max-count'));
    let newStep = step + incr;
    if (newStep < 0) {
        newStep = step;
    } else {
        newStep = Math.min(newStep, 7 - maxCount);
    }
    document.documentElement.style.setProperty('--row-transform-step', newStep);
}

const setupTransforStep = () => {
    const maxCount = Number(getComputedStyle(document.documentElement).getPropertyValue('--row-max-count'));
    let step = nowDay - 1;
    if (step < 0) {
        step = 0;
    } else {
        step = Math.min(step, 7 - maxCount);
    }
    document.documentElement.style.setProperty('--row-transform-step', step);
}

/* background images */
const setupBackgroundImage = (install = true) => {
    if (install) {
        // 图标背景图
        const bgUrl = new URL(`@/assets/icons.png`, import.meta.url).href;
        document.documentElement.style.setProperty('--calender-bg-image', `url(${bgUrl})`);
        // 季节背景图
        const seasonBgUrl = new URL(`@/assets/season.png`, import.meta.url).href;
        document.documentElement.style.setProperty('--season-btn-bg-image', `url(${seasonBgUrl})`);
    } else {
        document.documentElement.style.removeProperty('--calender-bg-image');
        document.documentElement.style.removeProperty('--season-btn-bg-image');
    }
}

/* mounted */
onMounted(() => {
    window.addEventListener('resize', setupDocumentHeight);
    setupBackgroundImage();
    setupDocumentHeight();
    getSeason().then(_ => {
        const s = initCurSeason();
        seasonYear.value = s[0];
        seasonMonth.value = s[1];
        season.value = s;
        getSearch(s.join('-'));
    });
})

onUnmounted(() => {
    window.removeEventListener('resize', setupDocumentHeight);
    setupBackgroundImage(false);
})
</script>