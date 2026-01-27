<template>
    <div class="ani-item" :class="{ checked: props.checked }" v-click="() => itemClick(props.unique)">
        <div class="ani-item-cover">
            <Image class="ani-item-cover-img" :src="props.cover"></Image>
        </div>
        <div class="ani-item-info">
            <div class="ani-item-title" v-click.stop="() => itemViewer(props.unique)">
                <span class="title-cn limited-box one-line" :title="props.titleCN">{{ props.titleCN }}</span>
                <span class="title-jp limited-box one-line" :title="props.titleJP">{{ props.titleJP }}</span>
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
            <div class="ani-item-edit-box">
                <Switch class="ani-item-fin" :value="props.status === 2" inline :loading="props.finLoading"
                    @change="itemFin(props.unique)" active-text="完结" inactive-text="放送" active-color="#6A0808"
                    inactive-color="#00a1d6" inline-inactive-color="#fff">
                </Switch>
                <Link icon="spin3" v-click.stop="() => itemUpdate(props.unique)">更新</Link>
                <Link icon="edit" v-click.stop="() => itemEdit(props.unique)">编辑</Link>
            </div>
        </div>
        <div class="ani-item-check-box">
            <i :class="checkboxClass"></i>
        </div>
    </div>
</template>

<script setup>
import { computed, inject } from 'vue';
import Noodle from '../common/Noodle.vue';
import Switch from '../common/Switch.vue';
import Link from '../common/Link.vue';
import Image from '../common/Image.vue';
import CheerLeading from '../common/CheerLeading.vue';

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
    checked: Boolean,
    finLoading: { type: Boolean, default: false }
});

const emit = defineEmits(['itemClick', 'itemUpdate', 'itemEdit', 'itemViewer'])

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

const checkboxClass = computed(() => {
    return props.checked ? 'icon-check' : 'icon-check-empty';
})

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

const itemClick = inject('animeItemClick')
const itemViewer = inject('animeItemViewer')
const itemEdit = inject('animeItemEdit')
const itemUpdate = inject('animeItemUpdate')
const itemFin = inject('animeItemFin')
</script>

<style></style>