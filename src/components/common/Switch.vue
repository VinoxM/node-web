<template>
    <div class="switch-box" :class="{ disabled: disabled }" :style="switchStyle" v-click.stop="switchClicked">
        <span :class="inactiveClass" v-if="!inline && inactiveText !== ''">{{ inactiveText }}</span>
        <span class="core" :class="coreClass"><i class="icon-loading animate-spin" v-if="loading"></i>{{ inlineText
            }}</span>
        <span :class="activeClass" v-if="!inline && activeText !== ''">{{ activeText }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const model = defineModel({ type: [Boolean, String, Number], required: false, default: null });
const {
    value,
    activeText, inactiveText,
    activeColor, inactiveColor,
    inlineActiveColor, inlineInactiveColor,
    activeValue, inactiveValue,
    loading,
    inline, disabled } = defineProps({
        value: {
            type: [Boolean, String, Number],
            requried: false,
            default: null
        },
        activeText: {
            type: String,
            requried: false,
            default: ''
        },
        inactiveText: {
            type: String,
            requried: false,
            default: ''
        },
        activeColor: {
            type: String,
            required: false,
            default: '#409eff'
        },
        inactiveColor: {
            type: String,
            required: false,
            default: '#dcdfe6'
        },
        inlineActiveColor: {
            type: String,
            required: false,
            default: '#fff'
        },
        inlineInactiveColor: {
            type: String,
            required: false,
            default: '#303133'
        },
        activeValue: {
            type: [Boolean, String, Number],
            required: false,
            default: true
        },
        inactiveValue: {
            type: [Boolean, String, Number],
            required: false,
            default: false
        },
        loading: {
            type: Boolean,
            required: false,
            default: false
        },
        inline: {
            type: Boolean,
            required: false,
            default: false
        },
        disabled: {
            type: Boolean,
            required: false,
            default: false
        }
    });
const emit = defineEmits(['change']);

const isActive = () => value ?? model.value === activeValue;

const coreClass = computed(() => (value ?? model.value === activeValue ? 'active' : '') + (loading ? ' loading' : ' '))
const activeClass = computed(() => value ?? model.value === activeValue ? 'active' : '');
const inactiveClass = computed(() => value ?? model.value === activeValue ? 'active' : '');
const inlineText = computed(() => inline ? (value ?? model.value === activeValue ? activeText : inactiveText) : '');
const switchStyle = computed(() => ({
    '--active-bg-color': activeColor,
    '--inactive-bg-color': inactiveColor,
    '--active-color': inlineActiveColor,
    '--inactive-color': inlineInactiveColor,
}))

const switchClicked = () => {
    if (disabled || loading) return;
    const newVal = isActive() ? inactiveValue : activeValue;
    emit('change', newVal);
    if (model.value !== null) model.value = newVal;
}
</script>

<style scoped>
.switch-box {
    --switch-box-height: var(--input-height);
    --switch-font-size: var(--font-size-normal);
    --switch-bg-color: var(--inactive-bg-color);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    cursor: pointer;
    height: var(--switch-box-height);
}

.switch-box.disabled,
.switch-box:has(span.core.loading) {
    opacity: 0.6;
}

.switch-box:has(span.core.active) {
    --switch-bg-color: var(--active-bg-color);
}

.switch-box span {
    display: inline-block;
    text-align: center;
    color: #303133;
    user-select: none;
    font-size: var(--switch-font-size);
}

.switch-box span:not(.core) {
    height: var(--switch-box-height);
    line-height: var(--switch-box-height);
}

.switch-box span:not(.core).active {
    color: #409eff;
}

.switch-box span.core {
    min-width: 25px;
    padding-left: 18px;
    padding-right: 6px;
    height: 20px;
    line-height: 20px;
    border-radius: 10px;
    background: var(--switch-bg-color);
    position: relative;
    transition: all var(--transition-delay);
    color: var(--inactive-color);
}

.switch-box span.core.active {
    padding-left: 6px;
    padding-right: 18px;
    color: var(--active-color);
}

.switch-box span.core::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    border-radius: 100%;
    transition: all var(--transition-delay);
    width: 16px;
    height: 16px;
    background-color: #fff;
}

.switch-box span.core.active::after {
    left: 100%;
    margin-left: -18px;
}

.switch-box span.core.loading::after {
    opacity: 0;
}

.switch-box span.core i {    
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    line-height: 16px;
    transition: left var(--transition-delay);
}

.switch-box span.core i::before {
    border-radius: 100%;
    width: 16px;
    height: 16px;
    line-height: 16px;
    margin: 0;
    padding: 0;
    text-align: center;
}

.switch-box span.core.active i {
    left: 100%;
    margin-left: -18px;
}
</style>