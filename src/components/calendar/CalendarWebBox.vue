<template>
    <div class="ani-web-box card-panel">
        <div class="ani-web-header">
            <span>网络放送 & 其他</span>
        </div>
        <div class="ani-web-container">
            <CalendarItem v-for="(val, k) of arr" :key="k" v-bind="val"></CalendarItem>
        </div>
    </div>
</template>

<script setup>
import CalendarItem from './CalendarItem.vue';

const { arr } = defineProps({
    arr: {
        type: Array,
        required: true
    }
})
</script>