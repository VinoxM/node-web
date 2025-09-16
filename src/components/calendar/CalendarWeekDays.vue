<template>
    <div class="ani-day-header" :class="{ 'is-today': isToday }">
        <div class="ani-day-indicator"></div>
        <div class="ani-day-box">
            <div class="ani-day ani-background" :class="aniDayClass"></div>
            <span>{{ dayStr }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const aniDayClass = computed(() => {
    return `${props.isToday ? 'active' : ''} day-${props.day}`
})

const props = defineProps({
    dayStr: String,
    isToday: Boolean,
    day: Number
})
</script>