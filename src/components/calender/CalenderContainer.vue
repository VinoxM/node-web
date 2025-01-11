<template>
    <div class="ani-container" :class="{ 'is-today': isToday }">
        <div class="ani-day-header">
            <div class="ani-day-indicator"></div>
            <div class="ani-day-box">
                <div class="ani-day ani-background" :class="aniDayClass"></div>
                <span>{{ dayStr }}</span>
            </div>
        </div>
        <div class="ani-day-group" v-if="props.timeline.length > 0">
            <CalenderBox v-for="(val, key) of props.timeline" :key="key" v-bind="val" @item-click="$emit('itemClick', $event)"></CalenderBox>
        </div>
        <div class="ani-day-group" v-else>
            <span class="ani-day-empty">无数据</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import CalenderBox from './CalenderBox.vue';

const aniDayClass = computed(() => {
    return `${props.isToday ? 'active' : ''} day-${props.day}`
})

const props = defineProps({
    timeline: {
        type: Array,
        default: []
    },
    dayStr: String,
    isToday: Boolean,
    day: Number
})
</script>

<style></style>