<template>
    <Dialog v-model:visible="visible" ref="dialog" title="编辑番剧信息" :destroy-on-close="false" :loading="loading"
        :min-height="535" @closed="closed">
        <div class="subs-main subs-column" v-if="subscribe !== null">
            <div class="subs-column">
                <InputBox label="番剧中文" v-model="subscribe.name"></InputBox>
                <InputBox label="番剧日文" v-model="subscribe.nameJP"></InputBox>
            </div>
            <div class="subs-row">
                <Image class="subs-cover" :src="subscribe.cover"></Image>
                <div class="subs-column flex-grow gap-4">
                    <div class="subs-row">
                        <InputBox label="番剧封面" v-model="subscribe.cover"></InputBox>
                    </div>
                    <div class="subs-row">
                        <InputBox class="flex-shrink" label="开播年份" width="90" type="number" auto-select
                            :validator="inputValidator.year" v-model="subscribe.season[0]"></InputBox>
                        <RadioGroup class="flex-grow subs-season-month" v-model="subscribe.season[1]"
                            :arr="seasonMonthOps" label="开播季节"></RadioGroup>
                    </div>
                    <div class="subs-row gap-0">
                        <InputBox label="开播日期" width="90" input-align="center" type="number" auto-select
                            :validator="inputValidator.year" @change="startTimeChanged"
                            v-model="subscribe.startTime[0]"></InputBox>
                        <span class="separator">/</span>
                        <InputBox label="false" width="26" input-align="center" type="number" auto-select
                            :validator="inputValidator.month" @change="startTimeChanged"
                            v-model="subscribe.startTime[1]"></InputBox>
                        <span class="separator">/</span>
                        <InputBox label="false" width="26" input-align="center" type="number" auto-select
                            :validator="inputValidator.date" @change="startTimeChanged"
                            v-model="subscribe.startTime[2]"></InputBox>
                        <span class="separator"> </span>
                        <InputBox label="false" width="26" input-align="center" type="number" auto-select
                            :validator="inputValidator.hours" @change="startTimeChanged"
                            v-model="subscribe.startTime[3]"></InputBox>
                        <span class="separator">:</span>
                        <InputBox label="false" width="26" input-align="center" type="number" auto-select
                            :validator="inputValidator.minutes" @change="startTimeChanged"
                            v-model="subscribe.startTime[4]"></InputBox>
                    </div>
                    <div class="subs-row gap-10">
                        <RadioGroup v-model="subscribe.animeType" :arr="animeTypeOps" label="番剧类型">
                        </RadioGroup>
                        <CheckBox v-model="subscribe.isShort" label="泡面番"></CheckBox>
                    </div>
                    <div class="subs-row">
                        <CheckBox v-model="subscribe.goon" label="顺延续播"></CheckBox>
                    </div>
                </div>
            </div>
            <div></div>
        </div>
    </Dialog>
</template>

<script setup>
import { ref, useTemplateRef, watch } from 'vue';
import Image from '../common/Image.vue';
import RadioGroup from '../common/RadioGroup.vue';
import Dialog from '../common/Dialog.vue';
import { getApi, cancel } from '@/api';
import InputBox from '../common/InputBox.vue';
import CheckBox from '../common/CheckBox.vue';

const initSubscribe = () => {
    subscribe.value = null;
    unique.value = -1;
}

// refs
const dialogRef = useTemplateRef("dialog");
const visible = ref(false);
const loading = ref(true);
const unique = defineModel();
const subscribe = ref(null);

const seasonMonthOps = ref([{ label: '冬季', value: '01' }, { label: '春季', value: '04' }, { label: '夏季', value: '07' }, { label: '秋季', value: '10' }]);
const animeTypeOps = ref([{ label: '季番', value: 1 }, { label: '网络放送', value: 2 }, { label: '剧场版', value: 3 }]);
const inputValidator = {
    year: v => /^[0-9]{4}$/.test(v),
    month: v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 12,
    date: v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 31,
    hours: v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 30,
    minutes: v => /^[0-9]{1,2}$/.test(v) && Number(v) < 60,
}

let lastRequest = null;

watch(() => unique.value, (v) => {
    if (v > 0) {
        cancel(lastRequest);
        show();
        getApi().getOneSubs({ id: v }, data => {
            loading.value = false;
            const { season, startTime, isShort, goon, ...val } = data;
            subscribe.value = {
                season: season?.split('-') || ['', ''],
                startTime: convertTimeStr2Array(startTime),
                isShort: isShort === 1,
                goon: goon === 1,
                ...val
            }
            console.log(subscribe.value);
        }, () => {
            setTimeout(close, 1000);
        })
    }
})

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
}

const convertTimeStr2Array = (startTime) => {
    const s = new Date(startTime);
    return startTime ? [s.getFullYear(), s.getMonth() + 1, s.getDate(), s.getHours(), s.getMinutes()] : ['', '', '', '', ''];
}

const convertArray2TimeStr = (arr) => {
    if (Number(arr[3]) >= 24) {
        arr[2] += 1;
        arr[3] -= 24;
    }
    return `${arr[0]}/${arr[1]}/${arr[2]} ${arr[3]}:${arr[4]}:00`;
}

const startTimeChanged = () => {
    const str = convertArray2TimeStr(subscribe.value.startTime)
    subscribe.value.startTime = convertTimeStr2Array(str);
}

</script>

<style scoped>
.subs-main {
    --subs-gap: 3px;
    padding: 4px;
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

div.gap-0 {
    gap: 0;
}

div.gap-4 {
    gap: 4px;
}

div.gap-10 {
    gap: 10px;
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

.separator {
    font-size: var(--font-size-mini);
    height: var(--subs-row-height);
    line-height: var(--subs-row-height);
    width: 10px;
    display: block;
    text-align: center;
    user-select: none;
}

.subs-season-month {
    max-width: 167px;
    width: calc(100% - 96px);
}
</style>