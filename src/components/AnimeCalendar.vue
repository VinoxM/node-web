<template>
    <div class="ani-main">
        <CalendarHeader @search="getSearch"></CalendarHeader>
        <div class="ani-weekly-box card-panel">
            <div class="ani-row-box day-box sticky">
                <div class="ani-day-row">
                    <CalendarWeekDays v-for="(val, key) in weekDays" :key="key" v-bind="val"></CalendarWeekDays>
                </div>
                <div class="ani-arrow-box">
                    <div class="ani-background ani-arrow arrow-left" @click="setupStepForClick(-1)"></div>
                    <div class="ani-background ani-arrow arrow-right" @click="setupStepForClick(1)"></div>
                </div>
            </div>
            <div class="ani-row-box">
                <div class="ani-container-row" :style="rowStyle">
                    <CalendarContainer v-for="(val, key) in dataDict" :key="key" v-bind="val" :loading="loading">
                    </CalendarContainer>
                </div>
            </div>
        </div>
        <CalendarWebBox v-if="webArr.length > 0" :arr="webArr"></CalendarWebBox>
        <CalendarViewer v-model="unique"></CalendarViewer>
    </div>
    <AnimeFooter></AnimeFooter>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import CalendarContainer from './calendar/CalendarContainer.vue';
import { getApi, cancel } from '@/api';
import CalendarViewer from './calendar/CalendarViewer.vue';
import CalendarWeekDays from './calendar/CalendarWeekDays.vue';
import AnimeFooter from './AnimeFooter.vue';
import { getNowDay } from '@/utils/dateUtils';
import CalendarWebBox from './calendar/CalendarWebBox.vue';
import CalendarHeader from './calendar/CalendarHeader.vue';

let nowDay = getNowDay();

const defaultDataDict = () => {
    return [
        { timeline: [], isToday: nowDay === 1 },
        { timeline: [], isToday: nowDay === 2 },
        { timeline: [], isToday: nowDay === 3 },
        { timeline: [], isToday: nowDay === 4 },
        { timeline: [], isToday: nowDay === 5 },
        { timeline: [], isToday: nowDay === 6 },
        { timeline: [], isToday: nowDay === 0 }
    ]
}

const resetWeekDays = () => {
    weekDays.value.forEach(e => {
        e.isToday = nowDay === e.day;
    })
}

const weekDays = ref([
    { dayStr: '周一', isToday: nowDay === 1, day: 1 },
    { dayStr: '周二', isToday: nowDay === 2, day: 2 },
    { dayStr: '周三', isToday: nowDay === 3, day: 3 },
    { dayStr: '周四', isToday: nowDay === 4, day: 4 },
    { dayStr: '周五', isToday: nowDay === 5, day: 5 },
    { dayStr: '周六', isToday: nowDay === 6, day: 6 },
    { dayStr: '周日', isToday: nowDay === 0, day: 0 }
]);

const dataDict = ref(defaultDataDict());
const webArr = ref([]);
const unique = ref(0);
const rowStyle = ref({});
const loading = ref(false);

let lastSearch = null;
let lastData = {
    dict: null,
    webArr: [],
    store() {
        this.dict = dataDict.value;
        this.webArr = webArr.value;
    },
    restore() {
        dataDict.value = this.dict;
        webArr.value = this.webArr;
    }
}

/* api func */
const getSearch = ({ season, search }, callback) => {
    cancel(lastSearch);
    lastData.store();
    dataDict.value = defaultDataDict();
    webArr.value = [];
    loading.value = true;
    lastSearch = getApi().getSearch({ season, name: search }, data => {
        lastSearch = null;
        const { dayDictArray, webArray, nowDay: nowDay_, resultCount } = data;
        if (callback instanceof Function) callback({ step: 0, season: season?.split("-") || ['', ''] }, { searchResultCount: search ? resultCount : 0 });
        nowDay = nowDay_;
        resetWeekDays();
        dataDict.value = dayDictArray;
        webArr.value = webArray;
        loading.value = false;
        initContainerHeight();
        setupTransForStep();
        nextTick(() => {
            setupHighlight(search);
        })
    }, () => {
        lastSearch = null;
        loading.value = false;
        lastData.restore();
    });
}

const setupHighlight = (str) => {
    if (!str || typeof str !== 'string' || str.trim().length === 0) {
        return;
    }
    if (!CSS.highlights) {
        console.log("CSS Custom Highlight API not supported.");
        return;
    }
    CSS.highlights.clear();
    const textNodes = Array.from(document.querySelectorAll('.ani-item-title .title-cn'));
    if (textNodes.length === 0) return;
    const ranges = textNodes.map(el => ({ el: el.firstChild, text: el.textContent })).map(({ el, text }) => {
        const indices = [];
        let startPos = 0;
        while (startPos < text.length) {
            const index = text.toLocaleLowerCase().indexOf(str.toLocaleLowerCase(), startPos);
            if (index === -1) break;
            indices.push(index);
            startPos = index + str.length;
        }
        return indices.map((index) => {
            const range = new Range();
            range.setStart(el, index);
            range.setEnd(el, index + str.length);
            return range;
        });
    });
    const searchResultsHighlight = new Highlight(...ranges.flat());

    CSS.highlights.set("search-results", searchResultsHighlight);
}

/* dialog */
provide('animeItemClick', (unique_) => {
    unique.value = unique_;
})

/* calendar step */
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
    setupDictFront(newStep, maxCount);
}

/* ani transform */
const setupTransForStep = () => {
    const maxCount = Number(getComputedStyle(document.documentElement).getPropertyValue('--row-max-count'));
    const middleCount = Math.ceil(maxCount / 2);
    let nowDay_ = nowDay === 0 ? 7 : nowDay;
    let step = nowDay_ - middleCount;
    if (step < 0) {
        step = 0;
    } else {
        step = Math.min(step, 7 - maxCount);
    }
    document.documentElement.style.setProperty('--row-transform-step', step);
    setupDictFront(step, maxCount);
}

/* front view max height */
const initContainerHeight = () => {
    nextTick(() => {
        Array.from(document.querySelectorAll("div.ani-container-row div.ani-container")).forEach(elem => {
            elem.__offsetHeight = elem.offsetHeight;
        });
    })
}

const setupDictFront = (step, maxCount) => {
    if (dataDict.value === null) {
        return
    }
    nextTick(() => {
        const sliceArr = Array.from(document.querySelectorAll("div.ani-container-row div.ani-container")).slice(step, step + maxCount);
        const rowMaxHeight = Math.max(...sliceArr.map(elem => elem.__offsetHeight));
        rowStyle.value = { '--container-row-height': rowMaxHeight + 'px' };
    })
}

/* background images */
const setupBackgroundImage = (install = true) => {
    if (install) {
        // 图标背景图
        const bgUrl = new URL(`@/assets/icons/icons.png`, import.meta.url).href;
        document.documentElement.style.setProperty('--calendar-bg-image', `url(${bgUrl})`);
        // 季节背景图
        const seasonBgUrl = new URL(`@/assets/icons/season.png`, import.meta.url).href;
        document.documentElement.style.setProperty('--season-btn-bg-image', `url(${seasonBgUrl})`);
    } else {
        document.documentElement.style.removeProperty('--calendar-bg-image');
        document.documentElement.style.removeProperty('--season-btn-bg-image');
    }
}

/* document height */
const setupDocumentHeight = () => {
    let vh = window.innerHeight;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    // setupTransForStep();
}

/* mounted */
onMounted(() => {
    window.addEventListener('resize', setupDocumentHeight);
    setupBackgroundImage();
    nextTick(() => {
        setupDocumentHeight();
    })
})

onUnmounted(() => {
    window.removeEventListener('resize', setupDocumentHeight);
    setupBackgroundImage(false);
})
</script>