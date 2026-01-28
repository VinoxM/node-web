<template>
    <div class="ani-main" :class="{ 'edit-mode': editMode }" v-loading="firstLoading" loading-icon="spin3"
        loading-text="加载中..." loading-bg-color="#fff">
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
            <div class="ani-row-box" v-loading="updating" loading-text="Updating..." loading-bg-color="rgba(0,0,0,0.6)">
                <div class="ani-container-row" :style="rowStyle">
                    <CalendarContainer v-for="(val, key) in dataDict" :key="key" v-bind="val" :loading="loading">
                    </CalendarContainer>
                </div>
            </div>
        </div>
        <CalendarWebBox v-if="webArr.length > 0" :arr="webArr" v-loading="updating" loading-text="Updating..."
            loading-bg-color="rgba(0,0,0,0.6)"></CalendarWebBox>
        <CalendarEditor v-if="editMode && !viewer" v-model="unique" :matchers="matchers" @research="research">
        </CalendarEditor>
        <CalendarViewer v-else v-model="unique"></CalendarViewer>
        <CalendarUserBox @click="userClicked"></CalendarUserBox>
        <CalendarEditBox v-if="authed" @update-checked="updateChecked" @delete-checked="deleteChecked"
            v-model:edit-mode="editMode" :checked-count="checkedCount" :result-count="seasonResultCount">
        </CalendarEditBox>
        <CalendarLogin v-model="loginVisible" @login-success="loginSuccessed"></CalendarLogin>
    </div>
    <AnimeFooter></AnimeFooter>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch, provide, readonly } from 'vue';
import CalendarContainer from './calendar/CalendarContainer.vue';
import apiPlugin, { getApi, cancel } from '@/api';
import CalendarViewer from './calendar/CalendarViewer.vue';
import CalendarWeekDays from './calendar/CalendarWeekDays.vue';
import AnimeFooter from './AnimeFooter.vue';
import { getNowDay } from '@/utils/dateUtils';
import CalendarWebBox from './calendar/CalendarWebBox.vue';
import CalendarHeader from './calendar/CalendarHeader.vue';
import message from '@/message';
import CalendarEditor from './calendar/CalendarEditor.vue';
import CalendarEditBox from './calendar/CalendarEditBox.vue';
import CalendarLogin from './calendar/CalendarLogin.vue';
import CalendarUserBox from './calendar/CalendarUserBox.vue';

apiPlugin.registerInterceptor('authorization', (opts) => {
    const { headers } = opts
    const token = localStorage.getItem('token')
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return opts
})

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
const updating = ref(false);
const matchers = ref([]);
const favorites = ref([])

/** authorization */
const authed = ref(false)
provide('authorization', readonly(authed))
const loginVisible = ref(false)

const userClicked = () => authed.value ? logout() : toLogin()

const toLogin = () => {
    if (!loginVisible.value) {
        loginVisible.value = true;
    }
}

const loginSuccessed = () => {
    authed.value = true;
    loginVisible.value = false;
    getMatchers();
}

const logout = () => {
    getApi('authorization')?.logout?.(null, () => {
        authed.value = false
        editMode.value = false
    })
}

const checkAuth = () => {
    const token = localStorage.getItem('token')
    if (token) {
        getApi('authorization')?.checkAuth?.(null, () => authed.value = true, () => {
            authed.value = false
            localStorage.removeItem('token')
            editMode.value = false
        })
    }
}

/** Search */
let lastSearch = null;
let lastSearchBody = null;
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

const editMode = ref(false);
const viewer = ref(false);
const checkedCount = ref(0);
const seasonResultCount = ref(0);
const edit = {
    arr: [],
    ref: {},
    init(listRef) {
        this.ref = listRef;
        this.arr = [];
        checkedCount.value = 0;
    },
    reset() {
        this.arr.forEach(unique => {
            this.select(unique, false);
        })
        this.arr = [];
        checkedCount.value = 0;
    },
    select(unique, del = true) {
        const index = this.arr.indexOf(unique);
        if (index > -1) {
            if (del) {
                this.arr.splice(index, 1);
                checkedCount.value = this.arr.length;
            }
        } else {
            this.arr.push(unique);
            checkedCount.value = this.arr.length;
        }
        const doSome = (arr) => {
            arr.some(o => {
                if (o.unique === unique) {
                    o.checked = index === -1;
                    return true;
                }
                return false;
            })
        }
        if (unique in this.ref) {
            const { isWeb, day, updateTime } = this.ref[unique];
            if (isWeb) {
                doSome(webArr.value);
            } else {
                dataDict.value[day].timeline.some(o => {
                    if (o.time === updateTime) {
                        doSome(o.list);
                        return true;
                    }
                    return false;
                });
            }
        }
    },
    getItem(unique) {
        const findItem = (arr) => {
            const index = arr.findIndex(o => o.unique === unique);
            return index > -1 ? arr[index] : null;
        }
        let obj = { value: null, startTime: null };
        if (unique in this.ref) {
            const { isWeb, day, updateTime, startTime } = this.ref[unique];
            obj.startTime = startTime;
            if (isWeb) {
                obj.value = findItem(webArr.value);
            } else {
                dataDict.value[day].timeline.some(o => {
                    if (o.time === updateTime) {
                        obj.value = findItem(o.list);
                        return true;
                    }
                    return false;
                });
            }
        }
        return obj;
    }
}

/* edit mode */
watch(editMode, (val) => {
    if (!val) {
        edit.reset();
    }
})

provide('animeItemEdit', (unique_) => {
    viewer.value = false;
    if (!editMode.value) return;
    nextTick(() => {
        unique.value = unique_;
    })
})

provide('animeItemUpdate', (unique_) => {
    if (!editMode.value) return;
    updating.value = true;
    getApi().updateOneSubs({ id: unique_ }, ({ handledCount, effectRows }) => {
        message.success(`处理${handledCount}个, 新增${effectRows}条记录.`);
        updating.value = false;
        effectRows > 0 && research();
    }, () => updating.value = false);
})

provide('animeItemFin', (unique_) => {
    if (!editMode.value) return;
    const { value: item, startTime } = edit.getItem(unique_);
    if (item !== null) {
        item.finLoading = true;
        getApi().setOneSubsFin({ id: unique_, fin: item.status === 2 ? 'N' : 'Y' }, () => {
            const now = new Date().getTime();
            item.status = item.status === 2 ? (now - startTime >= 0 ? 1 : 0) : 2;
            item.finLoading = false;
        }, m => (message.error(m), item.finLoading = false))
    }
})

provide('isFavorites', (unique_) => {
    return favorites.value.includes(unique_)
})

/* api func */
const research = () => {
    if (lastSearchBody) getSearch({ ...lastSearchBody, setupStep: false });
}

const firstLoading = ref(true);

const loadOver = () => {
    if (firstLoading.value) {
        firstLoading.value = false;
        getMatchers();
    }
}

const getSearch = ({ season, search, setupStep = true }, callback) => {
    cancel(lastSearch);
    lastData.store();
    dataDict.value = defaultDataDict();
    webArr.value = [];
    loading.value = true;
    lastSearch = getApi().getSearch({ season, name: search }, data => {
        lastSearch = null;
        lastSearchBody = { season, search };
        const { dayDictArray, webArray, nowDay: nowDay_, resultCount, listRef } = data;
        seasonResultCount.value = resultCount
        if (callback instanceof Function) callback({ step: 0, season: season?.split("-") || ['', ''] }, { searchResultCount: search ? resultCount : 0 });
        nowDay = nowDay_;
        resetWeekDays();
        dataDict.value = dayDictArray;
        webArr.value = webArray;
        loading.value = false;
        initContainerHeight();
        if (setupStep) setupTransForStep();
        edit.init(listRef);
        nextTick(() => {
            setupHighlight(search);
        })
        getFavorites();
        loadOver();
    }, () => {
        lastSearch = null;
        loading.value = false;
        lastData.restore();
    });
}

const getMatchers = () => {
    if (authed.value) {
        getApi().getMatchers(null, data => matchers.value = data)
        getApi().getEpisodeMatchers?.();
    }
}

const getFavorites = (callback) => {
    if (authed.value) {
        getApi('favorites').getFavorites?.(null, data => {
            favorites.value = data ?? []
            callback && callback()
        }, () => callback && callback())
    }
}

provide('addFavorites', (unique_) => {
    if (!authed.value) return;
    const { value: item } = edit.getItem(unique_);
    if (item !== null) {
        item.favoritesLoading = true;
        getApi('favorites').addFavorites?.({ rssSubsId: unique_ },
            () => getFavorites(() => item.favoritesLoading = false),
            () => item.favoritesLoading = false)
    }
})

provide('delFavorites', (unique_) => {
    if (!authed.value) return;
    const { value: item } = edit.getItem(unique_);
    if (item !== null) {
        item.favoritesLoading = true;
        getApi('favorites').delFavorites?.({ rssSubsId: unique_ },
            () => getFavorites(() => item.favoritesLoading = false),
            () => item.favoritesLoading = false)
    }
})

const updateChecked = (callback) => {
    updating.value = true;
    getApi().updateManySubs({ ids: edit.arr }, ({ effectRows, handledCount }) => {
        message.success(`处理${handledCount}个, 新增${effectRows}条记录.`);
        callback();
        updating.value = false;
        effectRows > 0 && research();
    }, () => {
        callback();
        updating.value = false;
    })
}

const deleteChecked = (callback) => {
    updating.value = true;
    getApi().deleteManySubs({ ids: edit.arr }, ({ rows }) => {
        message.success(`已删除${rows}个`);
        callback();
        updating.value = false;
        rows > 0 && research();
    }, () => {
        callback();
        updating.value = false;
    })
}

/* search highlight */
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
    viewer.value = false;
    if (editMode.value) {
        edit.select(unique_);
    } else {
        unique.value = unique_;
    }
})

provide('animeItemViewer', (unique_) => {
    if (editMode.value) {
        viewer.value = true;
    }
    nextTick(() => {
        unique.value = unique_;
    })
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
    setupTransForStep();
}

/* mounted */
onMounted(() => {
    window.addEventListener('resize', setupDocumentHeight);
    setupBackgroundImage();
    nextTick(() => {
        setupDocumentHeight();
    })
    checkAuth();
})

onUnmounted(() => {
    window.removeEventListener('resize', setupDocumentHeight);
    setupBackgroundImage(false);
    apiPlugin.unregisterInterceptor('authorization')
})
</script>