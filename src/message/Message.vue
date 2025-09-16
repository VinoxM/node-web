<template>
    <div class="msg-container" :class="{ plain: config.plain }">
        <i :class="iconClass"></i>
        <p class="msg-content" v-text="config.content"></p>
    </div>
</template>

<script setup>
import { computed, nextTick, onMounted } from 'vue';

const { config, remove } = defineProps({
    config: Object,
    remove: {
        type: Function,
        required: false,
        default: () => { }
    }
})

const open = () => {
    setTimeout(() => {
        close();
    }, config?.duration || 2000)
}

const close = () => {
    nextTick(remove)
}

const iconClass = computed(() => {
    return 'icon-msg-' + (config?.type || 'info')
})

onMounted(() => {
    open();
})
</script>