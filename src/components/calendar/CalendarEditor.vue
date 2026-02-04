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
            <div v-if="!isAddSubscribe" class="subs-row center">
                <Link v-for="(val, key) of subTabs" :key="key" :active="subTabActive === val"
                    @click="subTabClicked(key)">{{ val }}</Link>
            </div>
            <div v-if="!isAddSubscribe" class="subs-column gap-4" v-show="subTabActive === subTabs[0]">
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
                <div class="subs-column" v-loading="resultsLoading" loading-bg-color="rgba(0,0,0,0.6)"
                    loading-mask-index="19">
                    <div class="subs-row center">
                        <Link v-for="(val, key) of resultTabs" :key="key" :active="resultTabActive === val"
                            @click="resultTabClicked(key)">{{ val }}</Link>
                    </div>
                    <div class="subs-results-container">
                        <div class="subs-column gap-0" v-show="resultTabActive === resultTabs[0]">
                            <div class="subs-row center box-tools">
                                <Link icon="spin3" type="normal" @click="getTestResults">刷新</Link>
                            </div>
                            <div class="results-box" v-if="testResults.length > 0">
                                <div class="results-item" v-for="(val, k) of testResults" :key="k" :title="val.title"
                                    @click.right="copyTorrent(val)">
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
                        <div class="subs-column gap-0" v-show="resultTabActive === resultTabs[1]">
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
                        <div class="subs-column gap-0" v-show="resultTabActive === resultTabs[2]">
                            <div class="subs-row center box-tools">
                                <Link icon="spin3" type="normal" @click="getTasks">刷新</Link>
                            </div>
                            <div class="results-box" v-if="taskResults.length > 0">
                                <div class="results-item" v-for="(val, k) of taskResults" :key="k" :title="val.title"
                                    :class="{ locked: val.hide === 1 }">
                                    <span>{{ val.title || '---' }}</span>
                                    <span>
                                        [{{ val.episode || '-' }}] 上传时间: {{ val.pubDate || '-' }}
                                        <i v-if="val.hide === 1" class="icon-lock"></i>
                                    </span>
                                    <span>{{ taskInfo(val) }}</span>
                                    <div class="results-btn-box">
                                        <Button
                                            v-if="['DOWNLOADING', 'STOPED', 'SEEDING', 'COMPLETE'].includes(val.state)"
                                            border-less plain @click="pauseOrResumeTask(val)">
                                            <PauseResume></PauseResume>
                                        </Button>
                                        <Button v-if="['6'].includes(val.status)" icon="check" border-less plain
                                            type="success" @click="completeTask(val)">
                                        </Button>
                                        <Button v-if="['0', '1', '3', '5'].includes(val.status)" icon="trash del"
                                            border-less type="danger" plain @click="delTask(val)"></Button>
                                    </div>
                                </div>
                            </div>
                            <div class="results-box" v-else>
                                <span class="results-item empty">无数据</span>
                            </div>
                        </div>
                        <div class="subs-column gap-0" v-show="resultTabActive === resultTabs[3]">
                            <div class="subs-row center box-tools">
                                <Link icon="spin3" type="normal" @click="getEpisodes">刷新</Link>
                            </div>
                            <div class="results-box" v-if="episodeResults.length > 0">
                                <div class="results-item" v-for="(val, k) of episodeResults" :key="k" :title="val.link">
                                    <span>
                                        [{{ val.episode || '-' }}] {{ val.link || '---' }}
                                    </span>
                                    <span>{{ episodeInfo(val) }}</span>
                                    <div class="results-btn-box">
                                        <Button icon="trash del" border-less type="danger" plain
                                            @click="delEpisode(val)"></Button>
                                    </div>
                                </div>
                            </div>
                            <div class="results-box" v-else>
                                <span class="results-item empty">无数据</span>
                            </div>
                        </div>
                        <div class="subs-column gap-0" v-show="resultTabActive === resultTabs[4]">
                            <div class="subs-row center box-tools">
                                <Link icon="spin3" type="normal" @click="getFailedEpisodes">刷新</Link>
                            </div>
                            <div class="results-box" v-if="failedEpisodeResults.length > 0">
                                <div class="results-item" v-for="(val, k) of failedEpisodeResults" :key="k"
                                    :title="val.fileName">
                                    <span>[{{ val.episode || '-' }}] {{ val.fileName }}</span>
                                    <span>{{ failedEpisodeInfo(val) }}</span>
                                    <div class="results-btn-box">
                                        <Button v-if="'3' !== val.reason" icon="edit" border-less plain
                                            @click="toEditFailedEpisode(val)"></Button>
                                        <Button v-if="'3' !== val.reason" icon="spin3" border-less plain
                                            @click="retryFailedEpisode(val)"></Button>
                                        <Button v-if="!val.taskStatus" icon="trash del" border-less type="danger" plain
                                            @click="delFailedEpisode(val)"></Button>
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
                        <div class="subs-column gap-6" v-if="isEditFailedEpisode">
                            <span class="box-edit-title">修改失败剧集信息</span>
                            <div class="subs-row padding-5-lr">
                                <InputBox label="文件路径" v-model="editFailedEpisode.rootPath"></InputBox>
                            </div>
                            <div class="subs-row padding-5-lr">
                                <InputBox label="文件名称" v-model="editFailedEpisode.fileName"></InputBox>
                            </div>
                            <div class="subs-row gap-4 padding-5-lr">
                                <InputBox label="Minio链接" v-model="editFailedEpisode.link"></InputBox>
                            </div>
                            <div class="subs-row gap-4 padding-5-lr">
                                <InputBox label="剧集" v-model="editFailedEpisode.episode" width="100"
                                    input-align="center" auto-select>
                                    <template #append>
                                        <Button class="episode-calc" icon="calc" border-less plain
                                            @click="calcFailedEpisode"></Button>
                                    </template>
                                </InputBox>
                            </div>
                            <div class="subs-row padding-5-lr">
                                <span class="row-span">{{ failedEpisodeInfo(editFailedEpisode) }}</span>
                            </div>
                            <div class="subs-row center box-edit-footer">
                                <Link icon="cancel" @click="cancelEditFailedEpisode">取消</Link>
                                <Link icon="check" type="primary" @click="submitEditFailedEpisode">保存</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="subs-column gap-4" v-show="subTabActive === subTabs[1]">
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
                    <Link v-for="(val, key) of detailTabs" :key="key" :active="detailTabActive === val"
                        @click="detailTabClicked(key)">{{ val }}</Link>
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
                        <span class="box-edit-title">
                            {{ (editDetail.id > 0 ? '修改' : '新增') + (isCopyrightDetail ? '版权信息' : '链接信息') }}
                        </span>
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
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';
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
import PauseResume from '../common/PauseResume.vue';
import { getCurSeason, pubDateFormat } from '@/utils/dateUtils';

const initSubscribe = () => {
    subscribe.value = null;
    unique.value = 0;
    resultsLoading.value = false;
    // clear results
    testResults.value = [];
    currentResults.value = [];
    taskResults.value = [];
    episodeResults.value = [];
    failedEpisodeResults.value = [];
    // clear regex
    regexArr.value = [];
    // clear edit
    clearEditResult();
    clearEditFailedEpisode();
    // tabs init
    subTabActive.value = subTabs[0];
    resultTabActive.value = resultTabs[0];
    detailTabActive.value = detailTabs[0];
    // stop task info interval
    taskInfoInterval.stop();
}

const emit = defineEmits(['research']);

// refs
const dialogRef = useTemplateRef("dialog");
const visible = ref(false);
const loading = ref(true);
const unique = defineModel();
const subscribe = ref(null);
const subsCover = ref('');

// matchers
const matcherIndex = ref(-1);
const { matchers } = defineProps({
    matchers: {
        type: Array,
        required: true
    }
})
let matcherOps = [];

// regex
const regexArr = ref([]);
const regexInput = ref('');
const regexInputVisible = ref(false);
const regexInputRef = useTemplateRef('regexAdd');
const regexHistory = ref([]);
const regexHistoryLoading = ref(false);

// results
const testResults = ref([]);
const currentResults = ref([]);
const resultsLoading = ref(false);

// result edit
const isEditResult = ref(false);
const editResult = ref(null);

// details
const detailLoading = ref(false);
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
const editDetail = ref(null);

// tasks
const taskResults = ref([])

// episode
const episodeResults = ref([])
const failedEpisodeResults = ref([])
const isEditFailedEpisode = ref(false)
const editFailedEpisode = ref(null)

/* active tabs */
// sub tabs
const subTabs = ['订阅结果', '番剧详情']
const subTabActive = ref(subTabs[0])
const subTabClicked = (index) => {
    subTabActive.value = subTabs[index]
    clearEditResult();
    clearEditDetail();
}

// result tabs
const resultTabs = ['测试结果', '当前结果', '种子任务', '剧集结果', '失败剧集']
const resultTabActive = ref(resultTabs[0])
const resultTabClicked = (index) => {
    resultTabActive.value = resultTabs[index]
    clearEditResult();
    taskInfoInterval.stop();
    if (index === 1 && currentResults.value.length === 0) {
        getCurrentResults();
    }
    if (index === 2 && taskResults.value.length === 0) {
        getTasks();
    }
    if (index === 3 && episodeResults.value.length === 0) {
        getEpisodes();
    }
    if (index === 4 && failedEpisodeResults.value.length === 0) {
        getFailedEpisodes();
    }
}
let resultTabStore = ''
const clearResultTabActive = () => {
    resultTabStore = resultTabActive.value
    resultTabActive.value = ''
}
const restoreResultTabActibe = () => resultTabActive.value = resultTabStore

// detail tabs
const detailTabs = ['番剧版权', '相关链接']
const detailTabActive = ref(detailTabs[0])
const detailTabClicked = (index) => {
    detailTabActive.value = detailTabs[index]
    editDetail.value = null;
}
let detailTabStore = ''
const clearDetailTabActive = () => {
    detailTabStore = detailTabActive.value
    detailTabActive.value = ''
}
const restoreDetailTabActibe = () => detailTabActive.value = detailTabStore
const isCopyrightDetail = computed(() => detailTabActive.value === detailTabs[0]);

// others
let flushSearch = false;

// watch
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
            regexArr.value = (val.regex && val.regex.trim() !== '') ? JSON.parse(val.regex) : [];
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
    } else if (v === -1) {
        cancel(lastRequest);
        show();
        subTabActive.value = subTabs[1]
        const season = getCurSeason()
        subscribe.value = {
            name: '',
            nameJP: '',
            url: '',
            regex: '',
            season: season,
            startTime: `${season[0]}-${season[1]}-01 00:00:00`,
            cover: '',
            fin: 'N',
            isShort: false,
            animeType: '',
            goon: false,
            staff: '',
            cast: '',
            originType: ['', ''],
            typeTag: '',
            broadcast: ['', ''],
            keyword: '',
            link: [],
            copyright: []
        }
        loading.value = false;
    }
})

const isAddSubscribe = computed(() => unique.value === -1)

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
        regex: JSON.stringify(regexArr.value),
        ...val
    }
    loading.value = true;
    if (isAddSubscribe.value) {
        getApi().addOneSubs(body, () => (flushSearch = true, close()), () => loading.value = false);
    } else {
        getApi().editOneSubs(body, () => (flushSearch = true, close()), () => loading.value = false);
    }
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
    getApi().delManyResults({ pid: unique.value }, data => {
        resultsLoading.value = false;
        getCurrentResults()
    }, () => resultsLoading.value = false)
}

const getTestResults = () => {
    if (resultsLoading.value || matcherIndex.value < 0 || subscribe.value.keyword === '') return;
    resultsLoading.value = true;
    getApi().getSubsTestResults({ url: getUrlFormKeyword(subscribe.value.keyword), regex: JSON.stringify(regexArr.value) }, data => {
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
    clearResultTabActive();
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
    clearResultTabActive();
}

const calcResultEpisode = () => {
    editResult.value.episode = handleEpisode(editResult.value.title)
}

const clearEditResult = () => {
    editResult.value = null;
    isEditResult.value = false;
}

const cancelEditResult = () => {
    clearEditResult();
    restoreResultTabActibe();
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
    clearDetailTabActive();
}

const clearEditDetail = () => {
    editDetail.value = null;
}

const cancelEditDetail = () => {
    clearEditDetail();
    restoreDetailTabActibe();
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
    getApi()[methodName](editDetail.value, () => (detailLoading.value = false, cancelEditDetail(), refreshDetail(1)), () => detailLoading.value = false);
}

/* tasks */
const getTasks = () => {
    resultsLoading.value = true
    getApi('task').getTasks({ rssSubsId: unique.value }, data => {
        taskResults.value = data
        resultsLoading.value = false
        taskInfoInterval.start()
    }, () => resultsLoading.value = false)
}

const delTask = (val) => {
    resultsLoading.value = true
    getApi('task').deleteTask({ taskId: val.id }, () => {
        resultsLoading.value = false
        taskInfoInterval.stop();
        getTasks();
    }, () => resultsLoading.value = false)
}

const pauseOrResumeTask = (val) => {
    resultsLoading.value = true
    if (['DOWNLOADING', 'SEEDING'].includes(val.state)) {
        getApi('task').pauseTask({ taskId: val.id }, () => resultsLoading.value = false, () => resultsLoading.value = false)
    } else if (['STOPED', 'COMPLETE'].includes(val.state)) {
        getApi('task').resumeTask({ taskId: val.id }, () => resultsLoading.value = false, () => resultsLoading.value = false)
    } else {
        resultsLoading.value = false
    }
}

const completeTask = (val) => {
    resultsLoading.value = true
    if (['6'].includes(val.status)) {
        getApi('task').updateTaskStatus({ taskId: val.id }, () => resultsLoading.value = false, () => resultsLoading.value = false)
    } else {
        resultsLoading.value = false
    }
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

const taskInfo = (val) => {
    if (!val.id) return ''
    let result = taskStatusMap[val.status] || 'UNKNOWN'
    if (val.status === '1') {
        result += `: [${val.state || 'UNKNOWN'}] ${val.percent || ''}`
    }
    return result
}

const getTaskInfo = (taskIds) => {
    cancel(taskInfoInterval.lastRequest)
    taskInfoInterval.lastRequest = getApi('task').taskInfo({ taskIds }, data => {
        taskInfoInterval.lastRequest = null
        if (!data || data.length === 0) return;
        const results = taskResults.value
        Array.from(data).forEach(d => {
            results.some(r => {
                const b = r.id === d.id
                if (b) {
                    r.percent = d.percent
                    r.state = d.state
                }
                return b
            })
        })
        taskInfoInterval.next()
    }, () => taskInfoInterval.stop())
}

const taskInfoInterval = {
    lastRequest: null,
    timeout: null,
    delay: 2000,
    started: false,
    getTaskIds: () => {
        const taskIds = []
        taskResults.value.forEach(r => r.id && r.status === '1' && taskIds.push(r.id))
        return taskIds
    },
    start: () => {
        if (taskInfoInterval.started) return
        taskInfoInterval.started = true
        taskInfoInterval.next()
    },
    next: () => {
        const taskIds = taskInfoInterval.getTaskIds()
        if (taskIds.length > 0) {
            taskInfoInterval.timeout = setTimeout(() => getTaskInfo(taskIds), taskInfoInterval.delay)
        } else {
            taskInfoInterval.stop()
        }
    },
    stop: () => {
        cancel(taskInfoInterval.lastRequest)
        if (taskInfoInterval.timeout) {
            clearTimeout(taskInfoInterval.timeout)
            taskInfoInterval.timeout = null
        }
        taskInfoInterval.started = false
    }
}

/* episode */
const getEpisodes = () => {
    resultsLoading.value = true
    getApi('episode').getEpisodes({ rssSubsId: unique.value }, data => {
        episodeResults.value = data
        resultsLoading.value = false
    }, () => resultsLoading.value = false)
}

const delEpisode = (val) => {
    resultsLoading.value = true
    getApi('episode').deleteEpisode({ episodeId: val.id }, () => getEpisodes(), () => resultsLoading.value = false)
}

const episodeStatusMap = {
    '0': '准备中',
    '1': '完成',
    '2': '失败'
}

const episodeInfo = (val) => {
    const result = episodeStatusMap[val.status] || '未知'
    const taskResult = taskStatusMap[val.taskStatus] || '未知'
    return `[${result}] 种子任务[${taskResult}]`
}

/* failed episode */
const getFailedEpisodes = () => {
    resultsLoading.value = true
    getApi('episode').getFailedEpisodes({ rssSubsId: unique.value }, data => {
        failedEpisodeResults.value = data
        resultsLoading.value = false
    }, () => resultsLoading.value = false)
}

const retryFailedEpisode = (val) => {
    resultsLoading.value = true
    getApi('episode').retryFailedEpisode({ failedEpisodeId: val.id }, () => getFailedEpisodes(), () => resultsLoading.value = false)
}

const delFailedEpisode = (val) => {
    resultsLoading.value = true
    getApi('episode').deleteFailedEpisode({ failedEpisodeId: val.id }, () => getFailedEpisodes(), () => resultsLoading.value = false)
}

const failedEpisodeReasonMap = {
    '0': '未知错误',
    '1': '解析失败',
    '2': '剧集已存在'
}

const failedEpisodeInfo = (val) => {
    const reasonInfo = val.reason === '3' ? '成功 ' : `[${failedEpisodeReasonMap[val.reason] || '未知'}] `
    const taskResult = taskStatusMap[val.taskStatus] || '未知'
    return `${reasonInfo}种子任务[${taskResult}] 创建时间: ${pubDateFormat(val.createTime)}`
}

const toEditFailedEpisode = val => {
    editFailedEpisode.value = { ...val }
    clearResultTabActive()
    isEditFailedEpisode.value = true
}

const clearEditFailedEpisode = () => {
    editFailedEpisode.value = null
    isEditFailedEpisode.value = false
}

const cancelEditFailedEpisode = () => {
    clearEditFailedEpisode()
    restoreResultTabActibe()
}

const calcFailedEpisode = () => {
    const episode = handleEpisode(editFailedEpisode.value.fileName)
    editFailedEpisode.value.episode = episode === '-' ? null : episode
}

const submitEditFailedEpisode = () => {
    resultsLoading.value = true
    const data = {
        id: editFailedEpisode.value.id,
        rootPath: editFailedEpisode.value.rootPath,
        fileName: editFailedEpisode.value.fileName,
        episode: editFailedEpisode.value.episode,
        link: editFailedEpisode.value.link
    }
    getApi('episode').updateFailedEpisode(data, () => {
        resultsLoading.value = false
        cancelEditFailedEpisode()
        getFailedEpisodes()
    }, () => resultsLoading.value = false)
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

.subs-row span.row-span {
    line-height: var(--subs-row-height);
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

.results-item>span:not(:first-of-type) {
    color: grey;
    font-size: var(--font-size-small);
    line-height: var(--results-item-height-2);
}

.results-btn-box {
    height: 100%;
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

button.episode-calc,
button.episode-calc :deep(i),
button.episode-calc :deep(i:before) {
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
    --margin: 0px;
    display: inline-block;
    background-color: var(--origin-type-color);
    color: #f4f4f5;
    padding: 0 5px;
    margin: var(--margin) 0;
    height: calc(var(--subs-row-height) - var(--margin) * 2);
    line-height: calc(var(--subs-row-height) - var(--margin) * 2);
    width: calc(100% - 10px);
}

.subs-main :deep(.origin-type span) {
    --margin: 2px;
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