<template>
    <div class="ani-item" @click="itemClick(props.unique)">
        <div class="ani-item-cover">
            <Image class="ani-item-cover-img" :src="props.cover"></Image>
        </div>
        <div class="ani-item-info">
            <div class="ani-item-title">
                <span class="title-cn limited-box one-line" :title="props.titleCN">{{ props.titleCN }}</span>
                <span class="title-jp limited-box one-line" :title="props.titleJP">{{ props.titleJP }}</span>
            </div>
            <div class="ani-item-similarity" v-if="props.similarity" title="搜索结果相似度">
                <Similarity class="similarity-svg"></Similarity>
                <span :style="similarityColor">{{ similarityLabel }}</span>
            </div>
            <div class="ani-item-is-goon" v-if="goon === 1">
                <CheerLeading class="goon-svg"></CheerLeading>
                <span class="is-goon">续播</span>
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
    </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import Noodle from '../common/Noodle.vue';
import Image from '../common/Image.vue';
import CheerLeading from '../common/CheerLeading.vue';
import Similarity from '../common/Similarity.vue';

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
    goon: {
        type: Number,
        required: false,
        default: 0
    },
    hasNew: Number,
    unique: Number,
    epCount: Number,
    similarity: { type: Number, default: null }
});

const episode = computed(() => {
    if (props.status === 2) {
        return `已完结, 共<span>${props.epCount}</span>结果`;
    }
    if (props.latestEp !== null) {
        return `更新至<span>${props.latestEp}</span>`;
    }
    if (props.status === 0) {
        return '未开播';
    }
    return '无更新';
});

const episodeColor = computed(() => {
    if (props.status === 2) {
        return 'fin';
    }
    if (props.latestEp !== null) {
        return 'normal';
    }
    if (props.status === 0) {
        return 'none';
    }
    return 'normal';
})

const isShort = computed(() => {
    return Number(props.type.split('')[0]) === 1;
})

const startDate = computed(() => {
    return props.startDate === '-' ? '-' : (props.startDate + `${props.goon === 0 ? '~' : '+'}`);
})

const similarityLabel = computed(() => {
    if (props.similarity) {
        const s = (Number.parseFloat(props.similarity) * 100).toFixed(2)
        return `${s}%`
    }
    return null;
})

const similarityColor = computed(() => {
    if (!props.similarity) {
        return ''
    }
    if (props.similarity >= 0 && props.similarity < 0.3) {
        return 'color: #C0C4CC'
    }
    if (props.similarity >= 0.3 && props.similarity < 0.55) {
        return 'color: #5B8FF9'
    }
    if (props.similarity >= 0.55 && props.similarity < 0.75) {
        return 'color: #5DC5A8'
    }
    if (props.similarity >= 0.75 && props.similarity < 0.9) {
        return 'color: #F5A623'
    }
    if (props.similarity >= 0.9 && props.similarity < 1) {
        return 'color: #F56A4A'
    }
})

const itemClick = inject('animeItemClick')

</script>

<style></style>