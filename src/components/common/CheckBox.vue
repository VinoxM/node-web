<template>
    <div class="checkbox" :class="{ active: model }" @click="checkboxClicked">
        <i :class="iconClass"></i>
        <span class="label" v-if="needLabel">{{ label }}</span>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const model = defineModel({
    type: Boolean,
    default: false
});
const { label } = defineProps({
    label: {
        type: [String, Boolean],
        required: false,
        default: false
    }
})

const needLabel = computed(() => {
    if (typeof label === 'boolean') {
        return label;
    } else if (typeof label === 'string') {
        return label !== 'false';
    }
    return true;
})

const iconClass = computed(() => model.value ? 'icon-check' : 'icon-check-empty');

const checkboxClicked = () => {
    model.value = !model.value;
}
</script>

<style scoped>
.checkbox {
    --checkbox-height: var(--input-height);
    --checkbox-font-size: var(--font-size-normal);
    display: flex;
    flex-direction: row;
    gap: 3px;
    height: var(--checkbox-height);
    padding: 0 6px;
    border-radius: 8px;
    overflow: hidden;
    transition: all var(--transition-delay);
    cursor: pointer;
    user-select: none;
    color: #606266;
    background-color: #f5f7fa;
    box-shadow: 0 0 2px 1px #dcdfe6;
}

.checkbox.active {
    color: #fff;
    background-color: #409eff;
    box-shadow: 0 0 2px 0 #409eff;
}

.checkbox:not(.active):hover {    
    box-shadow: 0 0 3px 1px #dcdfe6;
}

.checkbox i::before {
    display: block;
    height: var(--checkbox-height);
    line-height: var(--checkbox-height);
    font-size: var(--checkbox-font-size);
    text-align: center;
    padding: 0;
    margin: 0;
    transform: translateY(1px);
}

.checkbox .label {
    display: block;
    position: relative;
    text-align: right;
    box-sizing: border-box;
    font-size: var(--checkbox-font-size);
    height: var(--checkbox-height);
    line-height: var(--checkbox-height);
    flex-shrink: 0;
    user-select: none;
}
</style>