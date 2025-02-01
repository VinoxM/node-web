<template>
    <div class="ani-box" :class="{'is-published': published, 'is-timer': isTimer}">
        <div class="ani-timeline">
            <span>{{ time }}</span>
        </div>
        <div class="ani-item-box" v-if="isTimer">
            <span class="ani-item-timer"></span>
        </div>
        <div class="ani-item-box" v-else>
            <CalendarItem v-for="(val, i) in list" v-bind="val" :key="i"
             @item-click="$emit('itemClick', $event)" 
             @item-edit="$emit('itemEdit', $event)"
             @item-update="$emit('itemUpdate', $event)"
             @item-fin="$emit('itemFin', $event)"></CalendarItem>
        </div>
    </div>
</template>

<script setup>
import CalendarItem from './CalendarItem.vue';
const { list, time } = defineProps({
    list: Array,
    time: String,
    published: {
        type: Boolean,
        default: false
    },
    isTimer: {
        type: Boolean,
        default: false
    }
});

</script>

<style>
</style>