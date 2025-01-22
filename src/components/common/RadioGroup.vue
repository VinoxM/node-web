<template>
    <div class="radio-group">
        <span class="prepend" v-if="needLabel">{{ label }}</span>
        <label v-for="(val, k) of arr" :key="k" class="radio-label" :class="{ active: model === val.value }"
            @click="labelClicked(val)">
            <input :value="val.value" type="radio" class="radio-input" />
            <span class="radio-span">{{ val.label }}</span>
        </label>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const model = defineModel();
const { arr, label } = defineProps({
    arr: Array,
    label: {
        type: [String, Boolean],
        required: false,
        default: false
    }
})

const labelClicked = (val) => {
    model.value = val.value;
}

const needLabel = computed(() => {
    if (typeof label === 'boolean') {
        return label;
    } else if (typeof label === 'string') {
        return label !== 'false';
    }
    return true;
})
</script>

<style scoped>
.radio-group {
    --radio-group-height: var(--input-height);
    --radio-group-font-size: var(--font-size-normal);
    display: flex;
    flex-direction: row;
    gap: 0;
    font-size: var(--radio-group-font-size);
    line-height: var(--radio-group-height);
    height: var(--radio-group-height);
    box-shadow: 0 0 2px 1px #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
}

.radio-group .prepend {
    display: block;
    position: relative;
    width: 55px;
    text-align: right;
    box-sizing: border-box;
    font-size: var(--radio-group-font-size);
    height: var(--radio-group-height);
    line-height: var(--radio-group-height);
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 8px 0 0 8px;
    padding-right: 4px;
    flex-shrink: 0;
    user-select: none;
}

.radio-group .prepend::after {
    content: ": ";
    display: block;
    height: var(--radio-group-height);
    line-height: var(--radio-group-height);
    position: absolute;
    right: 1px;
    top: 0;
}

.radio-label {
    display: flex;
    position: relative;
    cursor: pointer;
    user-select: none;
    color: #606266;
}

.radio-input {
    opacity: 0;
    position: absolute;
    z-index: -1;
    height: var(--radio-group-height);
    margin: 0;
    padding: 0;
}

.radio-span {
    display: block;
    line-height: var(--radio-group-height);
    height: var(--radio-group-height);
    text-align: center;
    background: #fff;
    padding: 0 2px;
}

.radio-label.active .radio-span {
    color: #fff;
    background-color: #409eff;
}
</style>