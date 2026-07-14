<template>
    <div class="ani-item" :class="{ checked: props.checked }">
        <div class="ani-item-cover" v-click="() => itemClick(props.unique)">
            <Image class="ani-item-cover-img" :src="props.cover"></Image>
        </div>
        <div class="ani-item-info">
            <div class="ani-item-title" v-click.stop="() => itemViewer(props.unique)">
                <span class="title-cn limited-box one-line" :title="props.titleCN">{{ props.titleCN }}</span>
                <span class="title-jp limited-box one-line" :title="props.titleJP">{{ props.titleJP }}</span>
            </div>
            <div class="ani-item-similarity" v-if="props.similarity" title="搜索结果相似度">
                <Similarity class="similarity-svg"></Similarity>
                <span :style="similarityColor">{{ similarityLabel }}</span>
            </div>
            <div v-if="authorized" class="ani-item-favorites" :class="{ 'favorites-on': favorites }"
                v-click.stop="() => favoritesClicked(props.unique)">
                <Favorites class="favorites-svg" :on="favorites" :loading="favoritesLoading"></Favorites>
                <span>{{ favoritesLabel }}</span>
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
import Favorites from '../common/Favorites.vue';
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
    checked: Boolean,
    finLoading: { type: Boolean, default: false },
    favoritesLoading: { type: Boolean, default: false },
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

const favorites = computed(() => isFavorites(props.unique))

const favoritesLabel = computed(() => {
    return isFavorites(props.unique) ? '已订阅' : '订阅'
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

const favoritesClicked = (val) => isFavorites(props.unique) ? delFavorites(val) : addFavorites(val)

const itemClick = inject('animeItemClick')
const itemViewer = inject('animeItemViewer')
const itemEdit = inject('animeItemEdit')
const itemUpdate = inject('animeItemUpdate')
const itemFin = inject('animeItemFin')

const authorized = inject('authorization')
const isFavorites = inject('isFavorites')
const addFavorites = inject('addFavorites')
const delFavorites = inject('delFavorites')
</script>