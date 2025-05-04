<template>
    <Dialog v-model:visible="visible" ref="dialog" title="编辑番剧信息" destroy-on-close :loading="loading" :min-height="535"
        @closed="closed">
        <div class="subs-main subs-column" v-if="subscribe !== null">
            <div class="subs-column">
                <InputBox label="番剧中文" v-model="subscribe.name"></InputBox>
                <InputBox label="番剧日文" v-model="subscribe.nameJP"></InputBox>
            </div>
            <div class="subs-row">
                <Image class="subs-cover" :src="subsCover"></Image>
                <div class="subs-column flex-grow gap-4">
                    <div class="subs-row">
                        <InputBox label="番剧封面" v-model="subscribe.cover" @change="setupSubsCover(subscribe.cover)">
                        </InputBox>
                    </div>
                    <div class="subs-row">
                        <InputBox class="flex-shrink" label="开播年份" width="90" type="number" auto-select
                            :validator="inputValidator.year" v-model="subscribe.season[0]"></InputBox>
                        <RadioGroup class="flex-grow subs-season-month" v-model="subscribe.season[1]"
                            :arr="seasonMonthOps" label="开播季节"></RadioGroup>
                    </div>
                    <div class="subs-row">
                        <DatetimeBox v-model="subscribe.startTime" label="开播日期" type="dateminutes"></DatetimeBox>
                    </div>
                    <div class="subs-row gap-10">
                        <RadioGroup v-model="subscribe.animeType" :arr="animeTypeOps" label="番剧类型">
                        </RadioGroup>
                        <CheckBox v-model="subscribe.isShort" label="泡面番"></CheckBox>
                    </div>
                    <div class="subs-row">
                        <CheckBox v-model="subscribe.goon" label="顺延续播" :disabled="subscribe.fin === 'Y'"></CheckBox>
                    </div>
                </div>
            </div>
            <div class="subs-row center">
                <Link :active="isResultsView" @click="changeResultsView">订阅结果</Link>
                <Link :active="!isResultsView" @click="changeResultsView">番剧详情</Link>
            </div>
            <div class="subs-column gap-4" v-show="isResultsView">
                <div class="subs-row">
                    <RadioGroup class="flex-shrink" label="订阅网站" v-model="matcherIndex" :arr="matcherOps"></RadioGroup>
                    <InputBox class="flex-grow" label="关键词" v-model="subscribe.keyword"></InputBox>
                </div>
                <div class="subs-row reg-box">
                    <div class="subs-column reg-label">
                        <span>正则匹配:</span>
                    </div>
                    <div class="subs-row reg-container">
                        <Tag v-for="(val, k) of regexArr" :key="k" :value="val" @close="tagClose(k)"></Tag>
                        <div class="reg-add-box">
                            <span v-if="!regexInputVisible" @click.stop="regAddClicked"><i
                                    class="icon-plus-squared"></i>新增</span>
                            <SelectableInput ref="regexAdd" v-else v-model="regexInput" :options="regexHistory"
                                @submit="regAddSubmit" @cancel="regexAddCancel">
                            </SelectableInput>
                        </div>
                    </div>
                </div>
                <div class="subs-column" v-loading="resultsLoading" loading-bg-color="rgba(0,0,0,0.6)" loading-mask-index="19">
                    <div class="subs-row center">
                        <Link :active="!isEditResult && !isCurrentResults" @click="resultsChange(0)">测试结果</Link>
                        <Link :active="!isEditResult && isCurrentResults" @click="resultsChange(1)">当前结果</Link>
                    </div>
                    <div class="subs-results-container">
                        <div class="subs-column gap-0" v-show="!isEditResult && !isCurrentResults">
                            <div class="subs-row center box-tools">
                                <Link icon="spin3" type="normal" @click="getTestResults">刷新</Link>
                            </div>
                            <div class="results-box" v-if="testResults.length > 0">
                                <div class="results-item" v-for="(val, k) of testResults" :key="k" :title="val.title" @click.right="copyTorrent(val)">
                                    <span>{{ val.title }}</span>
                                    <span>[{{ val.episode }}] 上传时间: {{ val.pubDate }}</span>
                                    <div class="results-btn-box">
                                        <Button icon="plus-squared" border-less @click="toAddResult(val)"></Button>
                                    </div>
                                </div>
                            </div>
                            <div class="results-box" v-else>
                                <span class="results-item empty">无数据</span>
                            </div>
                        </div>
                        <div class="subs-column gap-0" v-show="!isEditResult && isCurrentResults">
                            <div class="subs-row center box-tools">
                                <Link icon="spin3" type="normal" @click="getCurrentResults">刷新</Link>
                                <Link icon="trash" type="danger" @click="delManyResults">清空</Link>
                            </div>
                            <div class="results-box" v-if="currentResults.length > 0">
                                <div class="results-item" v-for="(val, k) of currentResults" :key="k" :title="val.title"
                                    :class="{ locked: val.hide === 1 }">
                                    <span>{{ val.title }}</span>
                                    <span>[{{ val.episode }}] 上传时间: {{ val.pubDate }} <i v-if="val.hide === 1"
                                            class="icon-lock"></i></span>
                                    <div class="results-btn-box">
                                        <Button icon="edit" border-less plain @click="toEditResult(val)"></Button>
                                        <Button :icon="'lock' + (val.hide === 1 ? '-open' : '')" border-less plain
                                            :loading="val.loading" :type="val.hide ? '' : 'info'"
                                            @click="hideOneResult(val)"></Button>
                                        <Button icon="trash del" border-less type="danger" plain
                                            @click="delResult(val)"></Button>
                                    </div>
                                </div>
                            </div>
                            <div class="results-box" v-else>
                                <span class="results-item empty">无数据</span>
                            </div>
                        </div>
                        <div class="subs-column gap-6" v-if="isEditResult">
                            <span class="box-edit-title">{{ editResult.id > 0 ? '修改番剧结果' : '新增番剧结果' }}</span>
                            <div class="subs-row padding-5-lr">
                                <InputBox label="标题" v-model="editResult.title" auto-select></InputBox>
                            </div>
                            <div class="subs-row gap-4 padding-5-lr">
                                <InputBox label="剧集" v-model="editResult.episode" width="100" input-align="center"
                                    auto-select>
                                    <template #append>
                                        <Button class="episode-calc" icon="calc" border-less plain
                                            @click="calcResultEpisode"></Button>
                                    </template>
                                </InputBox>
                                <InputBox label="排序" v-model="editResult.sort" type="number" width="70" auto-select
                                    input-align="center"></InputBox>
                            </div>
                            <div class="subs-row gap-4 padding-5-lr">
                                <DatetimeBox label="日期" v-model="editResult.pubDate"></DatetimeBox>
                            </div>
                            <div class="subs-row padding-5-lr">
                                <InputBox label="磁链" v-model="editResult.torrent" type="textarea" :rows="3"></InputBox>
                            </div>
                            <div class="subs-row center box-edit-footer">
                                <Link icon="cancel" @click="cancelEditResult">取消</Link>
                                <Link icon="check" type="primary" @click="submitEditResult">保存</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="subs-column gap-4" v-show="!isResultsView">
                <div class="subs-row gap-0 border-radius-group">
                    <InputBox class="flex-shrink lt" ignore-input label="原作类型" width="56"></InputBox>
                    <Select class="flex-shrink ct" :options="originTypeOptions" v-model="subscribe.originType[0]"
                        width="60"></Select>
                    <InputBox class="rt" v-model="subscribe.originType[1]"></InputBox>
                </div>
                <div class="subs-row gap-4">
                    <InputBox label="番剧标签" v-model="subscribe.typeTag"></InputBox>
                </div>
                <div class="subs-row gap-4">
                    <InputBox label="番剧放送" v-model="subscribe.broadcast[0]"></InputBox>
                    <InputBox label="放送补充" v-model="subscribe.broadcast[1]"></InputBox>
                </div>
                <div class="subs-row gap-4">
                    <InputBox type="textarea" label="Staff" rows="6" v-model="subscribe.staff"></InputBox>
                    <InputBox type="textarea" label="Cast" rows="6" v-model="subscribe.cast"></InputBox>
                </div>
                <div class="subs-row center">
                    <Link :active="!isCopyrightDetail && !editDetail" @click="changeDetailView">相关链接</Link>
                    <Link :active="isCopyrightDetail && !editDetail" @click="changeDetailView">番剧版权</Link>
                </div>
                <div class="subs-detail-container" v-loading="detailLoading" loading-bg-color="rgba(0,0,0,0.6)">
                    <div class="subs-column gap-0" v-if="!editDetail">
                        <div class="subs-row center box-tools">
                            <Link icon="spin3" type="normal" @click="refreshDetail">刷新</Link>
                        </div>
                        <div class="subs-detail-box" v-show="!isCopyrightDetail">
                            <div v-for="(val, k) of subscribe.link" :key="k" class="detail-item">
                                <span class="detail-title">{{ val.title }}</span>
                                <div class="detail-btn-box">
                                    <Button icon="edit" type="info" border-less plain
                                        @click="toEditDetail(val)"></Button>
                                    <Button icon="trash" type="danger" border-less plain
                                        @click="deleteDetail(val)"></Button>
                                </div>
                            </div>
                            <div class="detail-item add">
                                <div class="detail-btn-box">
                                    <Button icon="plus-squared" type="primary" border-less plain
                                        @click="toEditDetail(null)"></Button>
                                </div>
                            </div>
                        </div>
                        <div class="subs-detail-box" v-show="isCopyrightDetail">
                            <div v-for="(val, k) of subscribe.copyright" :key="k" class="detail-item">
                                <Image :src="val.image"></Image>
                                <span class="detail-title">{{ val.area }}</span>
                                <div class="detail-btn-box">
                                    <Button icon="edit" type="info" border-less plain
                                        @click="toEditDetail(val)"></Button>
                                    <Button icon="trash" type="danger" border-less plain
                                        @click="deleteDetail(val)"></Button>
                                </div>
                            </div>
                            <div class="detail-item add">
                                <div class="detail-btn-box">
                                    <Button icon="plus-squared" type="primary" border-less plain
                                        @click="toEditDetail(null)"></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="subs-column gap-0" v-else>
                        <span class="box-edit-title">{{ (editDetail.id > 0 ? '修改' : '新增') + (isCopyrightDetail ? '版权信息'
                            : '链接信息')
                            }}</span>
                        <div class="subs-detail-box edit">
                            <InputBox label="标题" v-if="'title' in editDetail" v-model="editDetail.title"></InputBox>
                            <InputBox label="地区" v-if="'area' in editDetail" v-model="editDetail.area"></InputBox>
                            <InputBox label="链接" v-model="editDetail.href"></InputBox>
                            <InputBox label="图片" v-if="'image' in editDetail" v-model="editDetail.image"></InputBox>
                            <div class="subs-row center box-edit-footer width-full">
                                <Link icon="cancel" @click="cancelEditDetail">取消</Link>
                                <Link icon="check" type="primary" @click="submitEditDetail">保存</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <Button icon="cancel" size="small" @click="close">取消</Button>
            <Button icon="check" size="small" type="primary" @click="submitSubscribe">保存</Button>
        </template>
    </Dialog>
</template>

<script setup>
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
import Image from '../common/Image.vue';
import RadioGroup from '../common/RadioGroup.vue';
import Dialog from '../common/Dialog.vue';
import { getApi, cancel } from '@/api';
import InputBox from '../common/InputBox.vue';
import CheckBox from '../common/CheckBox.vue';
import DatetimeBox from '../common/DatetimeBox.vue';
import Tag from '../common/Tag.vue';
import Button from '../common/Button.vue';
import Link from '../common/Link.vue';
import SelectableInput from '../common/SelectableInput.vue';
import message from '@/message';
import { handleEpisode } from '@/utils/rssUtils';
import Select from '../common/Select.vue';

const initSubscribe = () => {
    subscribe.value = null;
    unique.value = -1;
    testResults.value = [];
    currentResults.value = [];
    isCurrentResults.value = false;
    resultsLoading.value = false;
    isEditResult.value = false;
    editResult.value = null;
    isResultsView.value = true;
}

const emit = defineEmits(['research']);

// refs
const dialogRef = useTemplateRef("dialog");
const visible = ref(false);
const loading = ref(true);
const unique = defineModel();
const subscribe = ref(null);
const subsCover = ref('');
const matcherIndex = ref(-1);
const { matchers } = defineProps({
    matchers: {
        type: Array,
        required: true
    }
})
let matcherOps = [];
const regexArr = ref([]);
const regexInput = ref('');
const regexInputVisible = ref(false);
const regexInputRef = useTemplateRef('regexAdd');
const regexHistory = ref([]);
const regexHistoryLoading = ref(false);

const isCurrentResults = ref(false);
const testResults = ref([]);
const currentResults = ref([]);
const resultsLoading = ref(false);

const isEditResult = ref(false);
const editResult = ref(null);

const isResultsView = ref(true);

const seasonMonthOps = ref([{ label: '冬季', value: '01' }, { label: '春季', value: '04' }, { label: '夏季', value: '07' }, { label: '秋季', value: '10' }]);
const animeTypeOps = ref([{ label: '季番', value: 1 }, { label: '网络放送', value: 2 }, { label: '剧场版', value: 3 }]);
const inputValidator = {
    year: v => /^[0-9]{4}$/.test(v),
    month: v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 12,
    date: v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 31,
    hours: v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 30,
    minutes: v => /^[0-9]{1,2}$/.test(v) && Number(v) < 60,
}

const originTypeDict = {
    a: '原创',
    b: '漫画',
    c: '小说',
    d: '游戏',
    e: '其他',
    o: '未知'
}
const originTypeOptions = ref(Object.entries(originTypeDict).map(o => ({ value: o[0], label: o[1], customClass: `origin-type origin-type-${o[0]}` })));

/* details */
const isCopyrightDetail = ref(false);
const detailLoading = ref(false);
const editDetail = ref(null);

let flushSearch = false;
let lastRequest = null;

watch(() => unique.value, (v) => {
    if (v > 0) {
        cancel(lastRequest);
        show();
        getApi().getOneSubs({ id: v }, data => {
            loading.value = false;
            const { season, isShort, goon, url, broadcast, originType, ...val } = data;
            matcherIndex.value = matchers.findIndex(o => url.includes(o.source));
            setupSubsCover(val.cover);
            regexArr.value = (val.regex && val.regex.trim() !== '') ? val.regex.split(',') : [];
            subscribe.value = {
                season: season?.split('-') || ['', ''],
                isShort: isShort === 1,
                goon: goon === 1,
                keyword: getKeywordFormUrl(url),
                url,
                broadcast: (broadcast ?? '').split('-'),
                originType: (originType ?? '').split('-'),
                ...val
            }
        }, () => {
            setTimeout(close, 1000);
        })
    }
})

/* subscribe save */
const submitSubscribe = () => {
    const { season, isShort, goon, url, keyword, broadcast, originType, copyright, link, regex, ...val } = subscribe.value;
    const body = {
        season: [...season].join('-'),
        isShort: isShort ? 1 : 0,
        goon: goon ? 1 : 0,
        url: getUrlFormKeyword(keyword),
        broadcast: [...broadcast].join('-'),
        originType: [...originType].join('-'),
        regex: regexArr.value.join(','),
        ...val
    }
    loading.value = true;
    getApi().editOneSubs(body, () => (flushSearch = true, close()), ()=> loading.value = false);
}

const getDialogEl = () => dialogRef.value.$el;

const setupSubsCover = (cover) => {
    subsCover.value = cover;
}

const getMatch = () => {
    return matchers[matcherIndex.value]?.match ?? '';
}

/* keyword & url transform */
const getKeywordFormUrl = (url) => {
    const match = getMatch();
    if (match === '') return '';
    const reg = '#{keyword}';
    const index = match.indexOf(reg);
    const endMatch = match.slice(index + reg.length);
    let u = decodeURI(url);
    const endIndex = endMatch === '' ? void 0 : u.indexOf(endMatch);
    return u.slice(index, endIndex).replace(/\+/g, " ");
}

const getUrlFormKeyword = (keyword) => {
    const match = getMatch();
    if (match === '') return '';
    const reg = '#{keyword}';
    return encodeURI(match.replace(reg, keyword).replace(/\x20/g, "+"));
}

/* change active results label */
const resultsChange = (toCurrent) => {
    isEditResult.value = false;
    editResult.value = null;
    isCurrentResults.value = toCurrent === 1;
    if (isCurrentResults.value && currentResults.value.length === 0) {
        getCurrentResults();
    }
}

const changeResultsView = () => {
    isResultsView.value = !isResultsView.value;
    cancelEditResult();
    cancelEditDetail();
}

/* regex */
const tagClose = (i) => {
    regexArr.value.splice(i, 1);
}

const getRegexHistory = () => {
    regexHistoryLoading.value = true;
    getApi().getRegexHistory(null, data => {
        regexHistory.value = Array.from(data).map(s => ({ value: s, label: s }));
        regexHistoryLoading.value = false;
    })
}

const addRegexHistory = (regex) => {
    getApi().addRssRegex({ regex })
}

const regAddClicked = () => {
    regexInputVisible.value = true;
    nextTick(() => {
        regexInputRef.value?.focus();
        getRegexHistory();
    })
}

const regAddSubmit = () => {
    const reg = regexInput.value;
    if (reg !== '') {
        regexArr.value.push(reg);
        addRegexHistory(reg);
    }
    regexAddInit();
}

const regexAddInit = () => {
    regexInput.value = '';
    regexInputVisible.value = false;
}

const regexAddCancel = () => {
    regexInput.value !== '' ? regAddSubmit() : regexAddInit();
}

/* subscribe results */
const copyTorrent = (res) => {
    const dialog_ = getDialogEl();
    const textarea = document.createElement("textarea");
    textarea.value = res.torrent;
    dialog_.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    dialog_.removeChild(textarea);
    message.success('已复制种子链接到剪贴板.', { duration: 2000, appendTo: dialog_ })
    return
}

const getCurrentResults = () => {
    if (resultsLoading.value) return;
    resultsLoading.value = true;
    getApi().getOneSubsResults({ id: unique.value }, data => {
        currentResults.value = data.map(o => (o.loading = false, o));
        resultsLoading.value = false;
    }, () => resultsLoading.value = false)
}

const delManyResults = () => {
    if (resultsLoading.value) return;
    resultsLoading.value = true;
    getApi().delManyResults({pid: unique.value}, data => {
        resultsLoading.value = false;
        getCurrentResults()
    }, () => resultsLoading.value = false)
}

const getTestResults = () => {
    if (resultsLoading.value || matcherIndex.value < 0 || subscribe.value.keyword === '') return;
    resultsLoading.value = true;
    getApi().getSubsTestResults({ url: getUrlFormKeyword(subscribe.value.keyword), regex: regexArr.value.join(',') }, data => {
        testResults.value = data;
        resultsLoading.value = false;
    }, () => {
        resultsLoading.value = false;
    })
}

const hideOneResult = (val) => {
    if (val.loading) return;
    val.loading = true;
    const hide = Math.abs(val.hide - 1);
    getApi().updateOneResultHide({ id: val.id, hide }, () => (val.hide = hide, val.loading = false, flushSearch = true), () => val.loading = false);
}

const toAddResult = (val) => {
    let sort = 0;
    if (val.hasOwnProperty('episode')) {
        const episode = val.episode + '';
        let s = episode.split('-')[0];
        if (s > 0) {
            sort = s;
        }
    }
    editResult.value = {
        id: -1,
        pid: subscribe.value.id,
        title: val.title,
        torrent: val.torrent,
        episode: val.episode,
        sort: Number(sort),
        pubDate: val.pubDate
    }
    isEditResult.value = true;
}

const toEditResult = (val) => {
    editResult.value = {
        id: val.id,
        pid: val.pid,
        title: val.title,
        torrent: val.torrent,
        episode: val.episode,
        sort: val.sort,
        pubDate: val.pubDate
    }
    isEditResult.value = true;
}

const calcResultEpisode = () => {
    editResult.value.episode = handleEpisode(editResult.value.title)
}

const cancelEditResult = () => {
    editResult.value = null;
    isEditResult.value = false;
}

const submitEditResult = () => {
    if (resultsLoading.value) return;
    let result = editResult.value
    if (!result) return;
    resultsLoading.value = true;
    const resolve = ({ rows }) => {
        message.success(`处理${rows}条.`, { appednTo: getDialogEl() });
        cancelEditResult();
        resultsLoading.value = false;
        getCurrentResults();
        flushSearch = true;
    }
    if (result.id > 0) {
        getApi().editOneResult(result, resolve, () => resultsLoading.value = false)
    } else {
        const { id, ...newResult } = result;
        getApi().addOneResult(newResult, resolve, () => resultsLoading.value = false)
    }
}

const delResult = (val) => {
    if (resultsLoading.value) return;
    resultsLoading.value = true;
    getApi().delOneResult({ id: val.id }, () => {
        resultsLoading.value = false;
        getCurrentResults()
    }, () => resultsLoading.value = true);
}

/* subscribe details */
const changeDetailView = () => {
    isCopyrightDetail.value = !isCopyrightDetail.value;
    editDetail.value = null;
}

const refreshDetail = (needReload) => {
    detailLoading.value = true;
    flushSearch = !!needReload;
    if (isCopyrightDetail.value) {
        getApi().getOneCopyrights({ pid: unique.value }, data => {
            subscribe.value.copyright = data;
            detailLoading.value = false;
        }, () => detailLoading.value = false)
    } else {
        getApi().getOneLinks({ pid: unique.value }, data => {
            subscribe.value.link = data;
            detailLoading.value = false;
        }, () => detailLoading.value = false)
    }
}

const toEditDetail = (val) => {
    if (isCopyrightDetail.value) {
        editDetail.value = val ? val : {
            pid: unique.value,
            href: '',
            area: '',
            image: ''
        }
    } else {
        editDetail.value = val ? val : {
            pid: unique.value,
            href: '',
            title: ''
        }
    }
}

const cancelEditDetail = () => {
    editDetail.value = null;
}

const deleteDetail = (val) => {
    detailLoading.value = true;
    const isLink = 'title' in val;
    const methodName = `delOne${isLink ? 'Link' : 'Copyright'}`;
    getApi()[methodName]({ id: val.id }, () => (detailLoading.value = false, refreshDetail(1)), () => detailLoading.value = false);
}

const submitEditDetail = () => {
    detailLoading.value = true;
    const isEdit = (editDetail.value.id ?? 0) > 0;
    const isLink = 'title' in editDetail.value;
    const methodName = `${isEdit ? 'edit' : 'add'}One${isLink ? 'Link' : 'Copyright'}`;
    getApi()[methodName](editDetail.value, () => (detailLoading.value = false, editDetail.value = null, refreshDetail(1)), () => detailLoading.value = false);
}

/* dialog visible handler */
const show = () => {
    loading.value = true;
    visible.value = true;
}

const close = () => {
    visible.value = false;
    loading.value = false;
}

const closed = () => {
    cancel(lastRequest);
    initSubscribe();
    if (flushSearch) {
        emit('research');
    }
    flushSearch = false;
}

onMounted(() => {
    matcherOps = matchers.map((o, i) => ({ label: o.name, value: i }));
})

</script>

<style scoped>
.subs-main {
    --subs-gap: 3px;
    padding: 4px;
    font-size: var(--font-size-mini);
}

.subs-main :deep(.input-box) {
    --input-box-height: var(--subs-row-height);
    --input-box-font-size: var(--font-size-mini);
}

.subs-main :deep(.radio-group) {
    --radio-group-height: var(--subs-row-height);
    --radio-group-font-size: var(--font-size-mini);
}

.subs-main :deep(.checkbox) {
    --checkbox-height: var(--subs-row-height);
    --checkbox-font-size: var(--font-size-mini);
}

.subs-main :deep(.datetime-box) {
    --datetime-box-height: var(--subs-row-height);
    --datetime-font-size: var(--font-size-mini);
}

.subs-main :deep(.switch-box) {
    --switch-box-height: var(--subs-row-height);
    --switch-font-size: var(--font-size-mini);
}

.subs-main :deep(.tag-box) {
    --tag-box-height: calc(var(--subs-row-height) - 2px);
}

.reg-add-box :deep(.sel-input-box) {
    --input-height: var(--box-height);
}

.subs-main :deep(.select-box) {
    --select-height: var(--subs-row-height);
}

div.gap-0 {
    gap: 0;
}

div.gap-4 {
    gap: 4px;
}

div.gap-6 {
    gap: 6px;
}

div.gap-10 {
    gap: 10px;
}

div.padding-5 {
    padding: 5px;
}

div.padding-5-lr {
    padding: 0 5px;
}

div.width-full {
    width: 100%;
}

div.border-radius-group .lt {
    border-radius: 8px 0 0 8px;
}

div.border-radius-group .ct :deep(div.select-label),
div.border-radius-group .ct :deep(div.select-label span) {
    border-radius: 0;
}

div.border-radius-group .rt {
    border-radius: 0 8px 8px 0;
}

.subs-column {
    display: flex;
    flex-direction: column;
    gap: var(--subs-gap);
}

.subs-row {
    display: flex;
    flex-direction: row;
    gap: var(--subs-gap);
}

.subs-row.center {
    justify-content: center;
}

.flex-grow {
    flex-grow: 1;
}

.flex-shrink {
    flex-shrink: 0;
}

.subs-cover {
    width: var(--subs-cover-width);
    height: calc(var(--subs-cover-width) / 0.8);
}

.subs-season-month {
    max-width: 168px;
    width: calc(100% - 96px);
}

.reg-box {
    --padding: 3px;
    height: calc(var(--subs-row-height) * 2 + var(--subs-gap) + var(--padding) * 2);
    line-height: var(--subs-row-height);
}

.reg-label {
    padding: var(--padding) 0;
    width: 56px;
    flex-shrink: 0;
}

.reg-label span {
    height: var(--subs-row-height);
    font-size: var(--font-size-mini);
    display: block;
    position: relative;
    text-align: right;
    box-sizing: border-box;
    background-color: #f5f7fa;
    box-shadow: 0 0 2px 1px #dcdfe6;
    color: #909399;
    border-radius: 8px 0 0 8px;
    flex-shrink: 0;
    user-select: none;
}

.reg-label button {
    --ani-btn-height: var(--subs-row-height);
    font-size: var(--font-size-mini);
}

.reg-container {
    flex-wrap: wrap;
    flex-grow: 1;
    align-items: flex-start;
    padding: var(--padding) 5px;
    box-shadow: inset 0 0 3px 1px #dcdfe6;
    border-radius: 6px;
}

.reg-add-box {
    --box-height: calc(var(--subs-row-height) - 2px);
    width: 110px;
    height: var(--box-height);
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid #e9e9eb;
}

.reg-add-box:hover span {
    color: #409eff;
    text-decoration: underline;
}

.reg-add-box span {
    cursor: pointer;
    text-align: center;
    background-color: #f4f4f5;
    color: #909399;
    user-select: none;
}

.reg-add-box:has(input:focus) {
    box-shadow: 0 0 2px 1px #409eff;
}

.reg-add-box span,
.reg-add-box :deep(input) {
    display: block;
    width: 100%;
    line-height: var(--box-height);
    font-size: var(--font-size-mini);
}

.subs-results-container {
    --results-item-height: var(--subs-header-height);
    --results-item-height-1: var(--subs-header-height-1);
    --results-item-height-2: var(--subs-header-height-2);
    --results-box-height: calc(var(--subs-gap) * 6 + var(--results-item-height) * 5);
    box-sizing: border-box;
    box-shadow: inset 0 0 3px 1px #dcdfe6;
    border-radius: 6px;
    overflow-y: scroll;
    position: relative;
    height: calc(var(--subs-row-height) + var(--results-box-height));
}

.box-tools {
    height: var(--subs-row-height);
    line-height: var(--subs-row-height);
    box-shadow: 0 0 3px 0px var(--color-gray-0);
}

.results-box {
    display: flex;
    flex-direction: column;
    gap: var(--subs-gap);
    padding: var(--subs-gap);
    height: var(--results-box-height);
    overflow-y: scroll;
    box-sizing: border-box;
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

.results-item.empty {
    color: var(--color-black-0);
    cursor: default;
    text-align: center;
    line-height: var(--results-item-height);
    user-select: none;
}

.results-item:not(.empty, .locked):hover,
.results-item:not(.empty).locked {
    background-color: #c1c1c1;
}

.results-item>span {
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

.results-item>span:last-of-type {
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
    visibility: hidden;
}

.results-item:hover .results-btn-box {
    visibility: visible;
}

.results-btn-box button {
    padding: 0;
    width: var(--subs-btn-size);
    height: var(--subs-btn-size);
    line-height: var(--subs-btn-size);
}

/* .result-edit-box {} */

.box-edit-title {
    height: var(--subs-row-height);
    line-height: var(--subs-row-height);
    text-align: center;
    font-size: var(--font-size-small);
    box-shadow: 0 0 3px 0px var(--color-gray-0);
    user-select: none;
    color: #303133;
    background-color: #eee;
}

.episode-calc,
.episode-calc :deep(i),
.episode-calc :deep(i:before) {
    height: var(--input-box-height);
    line-height: var(--input-box-height);
    margin: 0;
    font-size: var(--font-size-mini);
    display: block;
}

.box-edit-footer button {
    font-size: var(--font-size-small);
}

.detail-switch {
    height: var(--subs-row-height);
    line-height: var(--subs-row-height);
}

.subs-main :deep(.origin-type span),
.subs-main :deep(span.origin-type) {
    display: inline-block;
    background-color: var(--origin-type-color);
    color: #f4f4f5;
    padding: 0 5px;
    border-radius: 8px;
    height: var(--subs-row-height);
    line-height: var(--subs-row-height);
}

.subs-detail-container {
    --box-height: 54px;
    --padding: 5px;
    --gap: 4px;
    box-sizing: border-box;
    box-shadow: inset 0 0 3px 1px #dcdfe6;
    border-radius: 6px;
    overflow-y: scroll;
    position: relative;
}

.subs-detail-box {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    flex-grow: 1;
    align-items: flex-start;
    padding: var(--padding);
    gap: var(--gap);
    height: calc(var(--box-height) * 2 + var(--gap));
}

.subs-detail-box.edit {
    flex-direction: column;
    flex-wrap: nowrap;
}

.detail-item {
    width: var(--subs-cover-width);
    text-align: center;
    position: relative;
    height: var(--box-height);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: inset 0 0 2px 1px #dcdfe6;
    border-radius: 4px;
}

.detail-item .detail-btn-box {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    display: flex;
    justify-content: center;
    width: 75px;
    height: 28px;
    gap: var(--gap);
    visibility: hidden;
}

.detail-item:hover .detail-btn-box,
.detail-item.add .detail-btn-box {
    visibility: visible;
}

:deep(.dialog-footer) {
    padding: 4px 0;
    display: flex;
    justify-content: center;
    gap: 10px;
}
</style>