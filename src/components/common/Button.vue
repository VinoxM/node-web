<template>
    <button class="ani-btn" :class="btnClass" :style="iconStyle">
        <i v-if="needIcon" :class="iconClass"></i>
        <slot></slot>
    </button>
</template>

<script setup>
import { computed, watch } from 'vue';

const { plain, size, icon, type, disabled, loading, borderLess, height } = defineProps({
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
    },
    borderLess: {
        type: Boolean,
        required: false,
        default: false
    },
    height: {
        type: String,
        required: false,
        default: null
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
    if (borderLess) {
        result.push('border-less');
    }
    return result.join(' ');
})

const needIcon = computed(() => loading || icon !== '')

const iconClass = computed(() => loading ? 'icon-loading animate-spin' : `icon-${icon}`);

const iconStyle = computed(() => height ? { '--ani-btn-height': Number(height.replace(/px/g, '')) + 'px'} : {});
</script>

<style scoped>
button.ani-btn {
    --ani-btn-height: 28px;
    --ani-btn-bg-color: #fff;
    --ani-btn-border-color: #dcdfe5;
    --ani-btn-text-color: #606266;
    outline: none;
    cursor: pointer;
    text-align: center;
    border: 1px solid var(--ani-btn-border-color);
    background-color: var(--ani-btn-bg-color);
    color: var(--ani-btn-text-color);
    font-size: var(--font-size-normal);
    border-radius: 4px;
    height: var(--ani-btn-height);
    line-height: calc(var(--ani-btn-height) - 2px);
    font-family: "Microsoft soft";
}

button.ani-btn.large {
    --ani-btn-height: 30px;
    font-size: var(--font-size-large);
}

button.ani-btn.normal {
    --ani-btn-height: 28px;
    font-size: var(--font-size-normal);
}

button.ani-btn.small {
    --ani-btn-height: 26px;
    font-size: var(--font-size-small);
}

button.ani-btn.mini {
    --ani-btn-height: 24px;
    font-size: var(--font-size-mini);
}

button.ani-btn:hover {
    --ani-btn-bg-color: rgb(235.9, 245.3, 255);
    --ani-btn-border-color: rgb(197.7, 225.9, 255);
    --ani-btn-text-color: #409eff;
}

button.ani-btn.primary.plain:hover,
button.ani-btn.primary {
    --ani-btn-bg-color: #409eff;
    --ani-btn-border-color: #409eff;
    --ani-btn-text-color: #fff;
}

button.ani-btn.primary:hover {
    --ani-btn-bg-color: rgb(121.3, 187.1, 255);
    --ani-btn-border-color: rgb(121.3, 187.1, 255);
    --ani-btn-text-color: #fff;
}

button.ani-btn.success.plain:hover,
button.ani-btn.success {
    --ani-btn-bg-color: #67c23a;
    --ani-btn-border-color: #67c23a;
    --ani-btn-text-color: #fff;
}

button.ani-btn.success:hover {
    --ani-btn-bg-color: rgb(148.6, 212.3, 117.1);
    --ani-btn-border-color: rgb(148.6, 212.3, 117.1);
    --ani-btn-text-color: #fff;
}

button.ani-btn.info.plain:hover,
button.ani-btn.info {
    --ani-btn-bg-color: #909399;
    --ani-btn-border-color: #909399;
    --ani-btn-text-color: #fff;
}

button.ani-btn.info:hover {
    --ani-btn-bg-color: rgb(177.3, 179.4, 183.6);
    --ani-btn-border-color: rgb(177.3, 179.4, 183.6);
    --ani-btn-text-color: #fff;
}

button.ani-btn.warning.plain:hover,
button.ani-btn.warning {
    --ani-btn-bg-color: #e6a23c;
    --ani-btn-border-color: #e6a23c;
    --ani-btn-text-color: #fff;
}

button.ani-btn.warning:hover {
    --ani-btn-bg-color: rgb(237.5, 189.9, 118.5);
    --ani-btn-border-color: rgb(237.5, 189.9, 118.5);
    --ani-btn-text-color: #fff;
}

button.ani-btn.danger.plain:hover,
button.ani-btn.danger {
    --ani-btn-bg-color: #f56c6c;
    --ani-btn-border-color: #f56c6c;
    --ani-btn-text-color: #fff;
}

button.ani-btn.danger:hover {
    --ani-btn-bg-color: rgb(248, 152.1, 152.1);
    --ani-btn-border-color: rgb(248, 152.1, 152.1);
    --ani-btn-text-color: #fff;
}

button.ani-btn.plain {
    --ani-btn-bg-color: #fff;
    --ani-btn-border-color: #dcdfe6;
    --ani-btn-text-color: #606266;
}

button.ani-btn.plain:hover {
    --ani-btn-bg-color: #fff;
    --ani-btn-border-color: #409eff;
    --ani-btn-text-color: #409eff;
}

button.ani-btn.plain.primary {
    --ani-btn-bg-color: rgb(235.9, 245.3, 255);
    --ani-btn-border-color: rgb(159.5, 206.5, 255);
    --ani-btn-text-color: #409eff;
}

button.ani-btn.plain.success {
    --ani-btn-bg-color: rgb(239.8, 248.9, 235.3);
    --ani-btn-border-color: rgb(179, 224.5, 156.5);
    --ani-btn-text-color: #67c23a;
}

button.ani-btn.plain.info {
    --ani-btn-bg-color: rgb(243.9, 244.2, 244.8);
    --ani-btn-border-color: rgb(199.5, 201, 204);
    --ani-btn-text-color: #909399;
}

button.ani-btn.plain.warning {
    --ani-btn-bg-color: rgb(252.5, 245.7, 235.5);
    --ani-btn-border-color: rgb(242.5, 208.5, 157.5);
    --ani-btn-text-color: #e6a23c;
}

button.ani-btn.plain.danger {
    --ani-btn-bg-color: rgb(254, 240.3, 240.3);
    --ani-btn-border-color: rgb(250, 181.5, 181.5);
    --ani-btn-text-color: #f56c6c;
}

button.ani-btn.disabled,
button.ani-btn.disabled:hover,
button.ani-btn.disabled:focus {
    cursor: not-allowed;
    background-image: none;
    --ani-btn-text-color: #c0c4cc;
    --ani-btn-bg-color: #fff;
    --ani-btn-border-color: #ebeef5;
}

button.ani-btn.disabled.primary,
button.ani-btn.disabled.primary:hover,
button.ani-btn.disabled.primary:focus {
    --ani-btn-text-color: #fff;
    --ani-btn-bg-color: #a0cfff;
    --ani-btn-border-color: #a0cfff;
}

button.ani-btn.disabled.success,
button.ani-btn.disabled.success:hover,
button.ani-btn.disabled.success:focus {
    --ani-btn-text-color: #fff;
    --ani-btn-bg-color: #b3e19d;
    --ani-btn-border-color: #b3e19d;
}

button.ani-btn.disabled.info,
button.ani-btn.disabled.info:hover,
button.ani-btn.disabled.info:focus {
    --ani-btn-text-color: #fff;
    --ani-btn-bg-color: #c8c9cc;
    --ani-btn-border-color: #c8c9cc;
}

button.ani-btn.disabled.warning,
button.ani-btn.disabled.warning:hover,
button.ani-btn.disabled.warning:focus {
    --ani-btn-text-color: #fff;
    --ani-btn-bg-color: #f3d19e;
    --ani-btn-border-color: #f3d19e;
}

button.ani-btn.disabled.danger,
button.ani-btn.disabled.danger:hover,
button.ani-btn.disabled.danger:focus {
    --ani-btn-text-color: #fff;
    --ani-btn-bg-color: #fab6b6;
    --ani-btn-border-color: #fab6b6;
}

button.ani-btn.disabled.plain,
button.ani-btn.disabled.plain:hover,
button.ani-btn.disabled.plain:focus {
    --ani-btn-bg-color: #fff;
    --ani-btn-border-color: #ebeef5;
    --ani-btn-text-color: #c0c4cc;
}

button.ani-btn.disabled.plain.primary,
button.ani-btn.disabled.plain.primary:hover,
button.ani-btn.disabled.plain.primary:focus {
    --ani-btn-text-color: #8cc5ff;
    --ani-btn-bg-color: #ecf5ff;
    --ani-btn-border-color: #d9ecff;
}

button.ani-btn.disabled.plain.success,
button.ani-btn.disabled.plain.success:hover,
button.ani-btn.disabled.plain.success:focus {
    --ani-btn-text-color: #a4da89;
    --ani-btn-bg-color: #f0f9eb;
    --ani-btn-border-color: #e1f3d8;
}

button.ani-btn.disabled.plain.info,
button.ani-btn.disabled.plain.info:hover,
button.ani-btn.disabled.plain.info:focus {
    --ani-btn-text-color: #bcbec2;
    --ani-btn-bg-color: #f4f4f5;
    --ani-btn-border-color: #e9e9eb;
}

button.ani-btn.disabled.plain.warning,
button.ani-btn.disabled.plain.warning:hover,
button.ani-btn.disabled.plain.warning:focus {
    --ani-btn-text-color: #f0c78a;
    --ani-btn-bg-color: #fdf6ec;
    --ani-btn-border-color: #faecd8;
}

button.ani-btn.disabled.plain.danger,
button.ani-btn.disabled.plain.danger:hover,
button.ani-btn.disabled.plain.danger:focus {
    --ani-btn-text-color: #f9a7a7;
    --ani-btn-bg-color: #fef0f0;
    --ani-btn-border-color: #fde2e2;
}

button.ani-btn.border-less {
    border: none !important;
}
</style>