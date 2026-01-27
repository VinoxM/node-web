<template>
    <div class="ani-container" :class="{ 'is-today': isToday }">
        <div class="ani-day-group" v-if="props.timeline.length > 0">
            <CalendarBox v-for="(val, key) of props.timeline" :key="key" v-bind="val"></CalendarBox>
        </div>
        <div class="ani-day-group" v-else>
            <CalendarLoadingBox v-if="loading"></CalendarLoadingBox>
            <span class="ani-day-empty" v-else>无数据</span>
        </div>
    </div>
</template>

<script setup>
import CalendarBox from './CalendarBox.vue';
import CalendarLoadingBox from './CalendarLoadingBox.vue';

const props = defineProps({
    timeline: {
        type: Array,
        default: []
    },
    isToday: Boolean,
    loading: Boolean
})
</script>

<style></style>