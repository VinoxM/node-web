<template>
    <div class="input-box" :style="widthStyle">
        <span class="prepend" v-if="needLabel">{{ label }}</span>
        <input class="input" :type="type" :class="inputAlign" v-if="!ignoreInput" v-model="model" @focus="inputFocus"
            @change="changed" />
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';

const model = defineModel();

const emit = defineEmits(['change']);

let oldVal = '';

const { label, width, ignoreInput, inputAlign, type, autoSelect, validator } = defineProps({
    label: {
        type: [String, Boolean],
        required: false,
        default: false
    },
    width: {
        type: String,
        required: false,
        default: '100%'
    },
    ignoreInput: {
        type: Boolean,
        required: false,
        default: false
    },
    inputAlign: {
        type: String,
        required: false,
        default: 'left',
        validator: v => ['left', 'center', 'right'].includes(v)
    },
    type: {
        type: String,
        default: 'input'
    },
    autoSelect: {
        type: Boolean,
        default: false
    },
    validator: {
        type: Function,
        required: false
    }
})

const widthStyle = computed(() => Number(width) > -1 ? { width: width + 'px' } : { width })

const needLabel = computed(() => {
    if (typeof label === 'boolean') {
        return label;
    } else if (typeof label === 'string') {
        return label !== 'false';
    }
    return true;
})

const inputFocus = (el) => {
    if (autoSelect) {
        el?.target?.select();
    }
}

const changed = () => {
    if (validator && !validator(model.value)) {
        model.value = oldVal;
    } else {
        oldVal = model.value;
    }
    emit('change', oldVal);
}

onMounted(() => {
    oldVal = model.value
})
</script>

<style scoped>
.input-box {
    --input-box-height: var(--input-height);
    --input-box-font-size: var(--font-size-normal);
    display: flex;
    flex-direction: row;
    gap: 0;
    height: var(--input-box-height);
    box-shadow: 0 0 2px 1px #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    transition: all var(--transition-delay);
}

.input-box:has(input:focus) {
    box-shadow: 0 0 2px 1px #409eff;
}

.input-box .prepend {
    display: block;
    position: relative;
    width: 55px;
    text-align: right;
    box-sizing: border-box;
    font-size: var(--input-box-font-size);
    height: var(--input-box-height);
    line-height: var(--input-box-height);
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 8px 0 0 8px;
    padding-right: 4px;
    flex-shrink: 0;
    user-select: none;
}

.input-box .prepend::after {
    content: ": ";
    display: block;
    height: var(--input-box-height);
    line-height: var(--input-box-height);
    position: absolute;
    right: 0;
    top: 0;
}

.input-box .prepend~input.input {
    width: calc(100% - 64px);
}

.input-box input {
    border: none;
    border-radius: 0;
    flex-grow: 1;
    height: var(--input-box-height);
    line-height: var(--input-box-height);
    font-size: var(--input-box-font-size);
    padding: 0 4px;
    width: calc(100% - 8px);
}

.input-box input.left {
    text-align: left;
}

.input-box input.center {
    text-align: center;
}

.input-box input.right {
    text-align: right;
}

.input-box input:focus {
    outline: none;
    border: none;
}
</style>