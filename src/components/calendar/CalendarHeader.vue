<template>
    <div class="ani-header card-panel" ref="searchBox">
        <div class="season-search-box" :class="{ 'has-results': !isSearching && searchCount > 0 }" @click="toSearching">
            <!-- <i class="icon-search"></i> -->
            <Search v-if="!similaritySearch" class="search-button" @click="searchTypeToggle"></Search>
            <SimilaritySearch v-else class="search-button" @click="searchTypeToggle"></SimilaritySearch>
            <span v-if="!isSearching && searchCount > 0" class="search-result">{{ searchCount }}</span>
            <input v-show="isSearching" class="search-input" ref="searchInput" :placeholder="searchPlaceholder"
                v-model="search" @keypress.enter.prevent.stop="searchBtnClicked(false)" />
            <Button v-show="isSearching" size="small" @click.stop="searchBtnClicked(false)">搜当季</Button>
            <Button v-show="isSearching" size="small" @click.stop="searchBtnClicked(true)">搜全部</Button>
        </div>
        <div class="season-year-box">
            <div class="ani-arrow-box">
                <i class="icon-angle-double-left" @click="setupSeasonYearStep(-1)"></i>
                <i class="icon-angle-double-right" @click="setupSeasonYearStep(1)"></i>
            </div>
            <input v-if="seasonVisible" ref="seasonInput" class="season-input" v-model="seasonYearTemp"
                @blur="hideSeason" />
            <div v-else class="season-year" @click="showSeason">
                <span>{{ seasonYear }}</span>
            </div>
        </div>
        <div class="season-btn-container">
            <div class="season-btn-box">
                <div class="season-btn season-btn-01" :class="seasonBtnArray[0].style" @click="monthClicked('01')">
                    <span class="label">1月新番</span>
                    <span class="count">{{ seasonBtnArray[0].count }}</span>
                    <div class=season-bg></div>
                </div>
                <div class="season-btn season-btn-04" :class="seasonBtnArray[1].style" @click="monthClicked('04')">
                    <span class="label">4月新番</span>
                    <span class="count">{{ seasonBtnArray[1].count }}</span>
                    <div class=season-bg></div>
                </div>
            </div>
            <div class="season-btn-box">
                <div class="season-btn season-btn-07" :class="seasonBtnArray[2].style" @click="monthClicked('07')">
                    <span class="label">7月新番</span>
                    <span class="count">{{ seasonBtnArray[2].count }}</span>
                    <div class=season-bg></div>
                </div>
                <div class="season-btn season-btn-10" :class="seasonBtnArray[3].style" @click="monthClicked('10')">
                    <span class="label">10月新番</span>
                    <span class="count">{{ seasonBtnArray[3].count }}</span>
                    <div class=season-bg></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, useTemplateRef, nextTick, computed } from 'vue';
import { getApi } from '@/api';
import message from '@/message';
import Button from '../common/Button.vue';
import Search from "../common/Search.vue";
import SimilaritySearch from '../common/SimilaritySearch.vue';

// data
const season = ref([]);
const seasonVisible = ref(false);
const seasonYear = ref('');
const seasonYearTemp = ref('');
const seasonMonth = ref('');
const seasonRef = useTemplateRef('seasonInput');
const seasonDict = ref([]);
const seasonBtnArray = ref([{ style: '' }, { style: '' }, { style: '' }, { style: '' }]);

const search = ref("");
const searchBox = useTemplateRef('searchBox');
const searchRef = useTemplateRef('searchInput');
const isSearching = ref(false);

const searchCount = ref(0);

const similaritySearch = ref(false);
const searchPlaceholder = computed(() => similaritySearch.value ? '番剧名语义搜索' : '番剧名模糊搜索')

const searchStore = {
    year: '',
    month: '',
    season: [],
    store() {
        this.year = seasonYear.value;
        this.month = seasonMonth.value;
        this.season = [...season.value];
    },
    restore() {
        seasonYear.value = this.year;
        seasonMonth.value = this.month;
        season.value = [...this.season];
        setupSeasonBtnArray();
    }
}

// emit
const emit = defineEmits(['search'])

const emitSearch = ({ season, search, searchAll }) => {
    const params = {};
    if (!searchAll) {
        params.season = season;
    }
    if (search && search !== '') {
        params.search = search;
    } else {
        similaritySearch.value = false;
    }
    if (season === '' && search === '') {
        return;
    }
    if (similaritySearch.value) {
        params.similarity = true
    }
    emit('search', params, searchCallback);
}

// methods
const initCurSeason = () => {
    if (seasonYear.value !== '') return
    let now = new Date();
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    let month = now.getMonth() + 1;
    month = (Math.ceil(month / 3) - 1) * 3 + 1;
    season.value = [now.getFullYear() + '', String(month).padStart(2, '0')];
    seasonYear.value = season.value[0];
    seasonMonth.value = season.value[1];
}

const searchCallback = ({ step, season }, { searchResultCount = 0 }) => {
    setupSeasonYearStep(step, season)
    searchCount.value = searchResultCount;
    nextTick(() => {
        const resultNode = document.querySelector('.search-result');
        if (resultNode) {
            searchBox.value.style.setProperty('--search-result-width', resultNode.offsetWidth + 'px');
        }
    })
}

const setupSeasonYearStep = (step = 0, s) => {
    if (s) {
        season.value = s;
    }
    if (step === 0) {
        seasonYear.value = season.value[0];
    } else {
        initCurSeason();
        seasonYear.value = (Number(seasonYear.value) + step) + '';
    }
    seasonMonth.value = season.value[1];
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
                active: season.value[0] === seasonYear.value && season.value[1] === month
            },
            count: allow ? seasonDict.value[s] : 0
        })
    }
    seasonBtnArray.value = result;
}

const monthClicked = (month) => {
    if (!isSearching.value) {
        initCurSeason();
        emitSearch({ season: seasonYear.value + '-' + month });
    } else {
        seasonMonth.value = month;
        season.value = [seasonYear.value, seasonMonth.value];
        setupSeasonBtnArray();
    }
}

const searchTypeToggle = () => {
    if (isSearching.value) {
        similaritySearch.value = !similaritySearch.value
        nextTick(() => searchRef.value?.focus())
    }
}

const searchBtnClicked = (searchAll = false) => {
    if (search.value === '') {
        message.warning('请输入番剧名搜索')
        return;
    }
    initCurSeason();
    cancelSearching();
    emitSearch({ season: seasonYear.value + '-' + seasonMonth.value, search: search.value, searchAll });
}

/* search */
const showSeason = () => {
    seasonVisible.value = true;
    nextTick(() => {
        seasonYearTemp.value = seasonYear.value;
        const s = seasonRef.value;
        s.focus();
    })
}

const hideSeason = () => {
    seasonVisible.value = false;
    if (/^[0-9]{4}$/.test(seasonYearTemp.value)) {
        seasonYear.value = seasonYearTemp.value;
        setupSeasonBtnArray();
    }
}

let cloneNode = null;
let mask = null;
let focusTimeout = null;
const updateDOM = () => {
    window.getComputedStyle(mask).opacity;
}

const toSearching = () => {
    if (isSearching.value) return;
    isSearching.value = true;
    searchStore.store();
    mask = document.createElement('div');
    mask.onclick = (e) => {
        if (e.target === mask) {
            searchStore.restore();
            cancelSearching();
        }
    }
    mask.className = 'main-mask';
    document.querySelector('.ani-main').appendChild(mask);
    const parentNode = document.querySelector('.ani-main');
    const origin = searchBox.value;
    cloneNode = origin.cloneNode(false);
    cloneNode.classList.remove('card-panel');
    origin.scrollIntoView({ behavior: 'smooth' });
    document.body.classList.add('over-hidden');
    parentNode.insertBefore(cloneNode, origin);
    mask.appendChild(origin);
    updateDOM();
    mask.classList.add('model');
    origin.classList.add("searching");
    cloneNode.classList.add('searching');
    focusTimeout = setTimeout(() => {
        searchRef.value?.focus();
        focusTimeout = null;
    }, 500)
}

const cancelSearching = () => {
    isSearching.value = false;
    if (focusTimeout) clearTimeout(focusTimeout);
    const parentNode = document.querySelector('.ani-main');
    const origin = searchBox.value;
    updateDOM();
    origin.classList.remove("searching");
    cloneNode.classList.remove('searching');
    mask.classList.remove('model');
    setTimeout(() => {
        document.body.classList.remove('over-hidden');
        parentNode.insertBefore(origin, cloneNode);
        cloneNode.remove();
        mask.remove();
        cloneNode = null;
        mask = null;
    }, 500)
}

// mounted
onMounted(() => {
    initCurSeason();
    getApi().getSeason(null, data => {
        seasonDict.value = data;
        emitSearch({ season: season.value.join('-') });
    });
})
</script>