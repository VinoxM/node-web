<template>
    <div class="ani-item" :class="{checked: props.checked}" @click="$emit('itemClick', props.unique)">
        <div class="ani-item-cover">
            <ani-image class="ani-item-cover-img" :src="props.cover"></ani-image>
        </div>
        <div class="ani-item-info">
            <div class="ani-item-title">
                <span class="title-cn limited-box one-line" :title="props.titleCN">{{ props.titleCN }}</span>
                <span class="title-jp limited-box one-line" :title="props.titleJP">{{ props.titleJP }}</span>
            </div>
            <div class="ani-item-noodle" v-if="isShort">
                <Noodle class="noodle-svg"></Noodle>
                <span>泡面番</span>
            </div>
            <div class="ani-item-start-date">
                <span>{{ startDate }}</span>
            </div>
            <div class="ani-item-episode">
                <span :class="'ep-color-' + episodeColor" class="ani-item-episode-span" v-html="episode"></span>
                <span class="ani-item-new new-shine" v-if="props.hasNew">New</span>
            </div>
        </div>
        <div class="ani-item-check-box">
            <i :class="checkboxClass"></i>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Noodle from '../common/Noodle.vue';

const props = defineProps({
    titleCN: String,
    titleJP: {
        type: String,
        required: false,
        default: null
    },
    startDate: {
        type: String,
        required: false,
        default: '-'
    },
    cover: String,
    type: String,
    status: Number,
    latestEp: {
        type: String,
        required: false,
        default: null
    },
    hasNew: Number,
    unique: Number,
    epCount: Number,
    checked: Boolean
});

const episode = computed(() => {
    if (props.status === 0) {
        return '未开播';
    }
    if (props.status === 2) {
        return `已完结, 共<span>${props.epCount}</span>结果`;
    }
    return props.latestEp === null ? '无更新' : `更新至<span>${props.latestEp}</span>`;
});

const checkboxClass = computed(()=>{
    return props.checked ? 'icon-check' : 'icon-check-empty';
})

const episodeColor = computed(() => {
    if (props.status === 2) {
        return 'fin';
    }
    if (props.status === 0) {
        return 'none';
    }
    return 'normal';
})

const isShort = computed(()=>{
    return Number(props.type.split('')[0]) === 1;
})

const startDate = computed(() => {
    return props.startDate === '-' ? '-' : (props.startDate + '~');
})

</script>

<style></style>