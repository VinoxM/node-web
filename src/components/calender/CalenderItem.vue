<template>
    <div class="ani-item" @click="$emit('itemClick', props.unique)">
        <div class="ani-item-cover">
            <img class="ani-item-cover-img" :src="props.cover || ''" />
        </div>
        <div class="ani-item-info">
            <div class="ani-item-title">
                <span class="limited-box one-line" :title="props.titleCN">{{ props.titleCN }}</span>
                <span class="title-jp limited-box one-line" :title="props.titleJP">{{ props.titleJP }}</span>
            </div>
            <div class="ani-item-episode">
                <span :class="'ep-color-' + episodeColor" class="ani-item-episode-span" v-html="episode"></span>
                <span class="ani-item-new new-shine" v-if="props.hasNew">New</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
    cover: String,
    titleCN: String,
    titleJP: {
        type: String,
        required: false,
        default: null
    },
    epCounts: {
        type: Number,
        required: false,
        default: 0
    },
    latestEp: {
        type: String,
        required: false,
        default: null
    },
    lastPub: {
        type: String,
        required: false,
        default: null
    },
    hasNew: {
        type: Boolean,
        required: false,
        default: false
    },
    isFin: {
        type: Boolean,
        required: false,
        default: false
    },
    isShort: {
        type: Boolean,
        required: false,
        default: false
    },
    unique: {
        type: Number,
        required: true
    }
});

const episode = computed(() => {
    if (props.isFin) {
        return `已完结, 共<span>${props.epCounts}</span>结果`
    }
    return props.latestEp === null ? '无更新' : `更新至<span>${props.latestEp}</span>`
});

const episodeColor = computed(() => {
    if (props.isFin) {
        return 'fin';
    }
    return props.latestEp === null ? 'none' : 'normal';
})

</script>

<style>
</style>