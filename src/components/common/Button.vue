<template>
    <button class="ani-btn" :class="btnClass">
        <i v-if="needIcon" :class="iconClass"></i>
        <slot></slot>
    </button>
</template>

<script setup>
import { computed } from 'vue';

const { plain, size, icon, type, disabled, loading } = defineProps({
    plain: {
        type: Boolean,
        required: false,
        default: false
    },
    size: {
        type: String,
        required: false,
        default: 'normal',
        validator: (val) => ['large', 'normal', 'small', 'mini'].includes(val)
    },
    icon: {
        type: String,
        required: false,
        default: ''
    },
    type: {
        type: String,
        required: false,
        default: '',
        validator: (val) => ['', 'primary', 'success', 'info', 'warning', 'danger'].includes(val)
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    },
    loading: {
        type: Boolean,
        required: false,
        default: false
    }
})

const btnClass = computed(() => {
    let result = [];
    if (plain) {
        result.push('plain');
    }
    result.push(size);
    if (type !== '') {
        result.push(type);
    }
    if (disabled || loading) {
        result.push('disabled');
    }
    return result.join(' ');
})

const needIcon = computed(() => loading || icon !== '')

const iconClass = computed(() => loading ? 'icon-loading animate-spin' : `icon-${icon}`);
</script>