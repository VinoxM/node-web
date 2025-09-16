<template>
    <span class="ani-link" :class="linkClass"><i v-if="icon !== ''" :class="iconClass"></i>
        <slot></slot>
    </span>
</template>

<script setup>
import { computed } from 'vue';

const { type, icon, active, disabled } = defineProps({
    type: {
        type: String,
        required: false,
        default: 'normal',
        validator: v => ['normal', 'primary', 'success', 'warning', 'danger', 'info'].includes(v)
    },
    icon: {
        type: String,
        required: false,
        default: ''
    },
    active: {
        type: Boolean,
        required: false,
        default: false
    },
    disabled: {
        type: Boolean,
        required: false,
        default: false
    }
})

const linkClass = computed(() => ({
    [type]: true,
    disabeld: disabled,
    active: active
}));
const iconClass = computed(() => 'icon-' + icon);
</script>

<style scoped>
.ani-link {
    --link-color: #606266;
    --link-hover-color: #409eff;
    display: inline-block;
    color: var(--link-color);
    cursor: pointer;
    user-select: none;
    padding: 0 4px;
}

.ani-link:not(.disabled):hover,
.ani-link:not(.disabled).active {
    color: var(--link-hover-color);
    text-decoration: underline;
}

.ani-link.disabled {
    cursor: not-allowed;
}

.ani-link i,
.ani-link i::before {
    display: inline-block;
    width: 16px;
    margin: 0;
    padding: 0;
}

.ani-link.primary {
    --link-color: #409eff;
    --link-hover-color: #66b1ff;
}

.ani-link.success {
    --link-color: #67c23a;
    --link-hover-color: #85ce61;
}

.ani-link.warning {
    --link-color: #e6a23c;
    --link-hover-color: #ebb563;
}

.ani-link.danger {
    --link-color: #f56c6c;
    --link-hover-color: #f78989;
}

.ani-link.info {
    --link-color: #909399;
    --link-hover-color: #a6a9ad;
}

.ani-link.normal.disabled {
    --link-color: #c0c4cc;
}

.ani-link.primary.disabled {
    --link-color: #a0cfff;
}

.ani-link.success.disabled {
    --link-color: #b3e19d;
}

.ani-link.warning.disabled {
    --link-color: #f3d19e;
}

.ani-link.danger.disabled {
    --link-color: #fab6b6;
}

.ani-link.info.disabled {
    --link-color: #c8c9cc;
}
</style>