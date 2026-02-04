<template>
    <div class="input-box" :style="widthStyle" :class="inputClass">
        <span class="prepend" :class="{ float: type === 'textarea' }" v-if="needLabel">{{ label }}</span>
        <input class="input" :type="type" :class="inputAlign" v-if="!ignoreInput && type !== 'textarea'" v-model="model"
            :readonly="readonly" @focus="inputFocus" spellcheck="false" ref="input" @change="changed"
            @keyup.enter="enterPress" />
        <textarea class="textarea" v-if="type === 'textarea'" v-model="model" :rows="rows" spellcheck="false"
            :readonly="readonly" @focus="inputFocus" @change="changed"></textarea>
        <slot name="append"></slot>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';

const model = defineModel();

const emit = defineEmits(['change', 'enter-press']);

let oldVal = '';

const { label, width, ignoreInput, inputAlign, type, autoSelect, validator, rows, size, readonly } = defineProps({
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
    },
    rows: {
        type: [Number, String],
        required: false,
        default: 1
    },
    size: {
        type: String,
        required: false,
        default: 'normal'
    },
    readonly: {
        type: Boolean,
        default: false
    }
})

const widthStyle = computed(() => Number(width) > -1 ? { width: width + 'px' } : { width });

const inputClass = computed(() => size)

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

const enterPress = () => emit('enter-press')

onMounted(() => {
    oldVal = model.value
})
</script>

<style scoped>
.input-box {
    --input-box-height: var(--input-height);
    --input-box-font-size: var(--font-size-normal);
    position: relative;
    display: flex;
    flex-direction: row;
    gap: 0;
    box-shadow: 0 0 2px 1px #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    transition: all var(--transition-delay);
}

.input-box.large {
    --input-box-font-size: var(--font-size-large);
}

.input-box.small {
    --input-box-font-size: var(--font-size-small);
}

.input-box.mini {
    --input-box-font-size: var(--font-size-mini);
}

.input-box:has(input:focus),
.input-box:has(textarea:focus) {
    box-shadow: 0 0 2px 1px #409eff;
}

.input-box .prepend {
    display: block;
    position: relative;
    text-align: right;
    box-sizing: border-box;
    font-size: var(--input-box-font-size);
    height: var(--input-box-height);
    line-height: var(--input-box-height);
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 8px 0 0 8px;
    padding: 0 4px;
    flex-shrink: 0;
    user-select: none;
}

.input-box .prepend.float {
    position: absolute;
    bottom: 0;
    right: 0;
    border-radius: 8px 0 8px 0;
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

.input-box .prepend.float::after {
    display: none;
}

.input-box .prepend~input.input {
    width: calc(100% - 64px);
}

.input-box input,
.input-box textarea {
    border: none;
    border-radius: 0;
    flex-grow: 1;
    font-size: var(--input-box-font-size);
    padding: 0 4px;
    width: calc(100% - 8px);
}

.input-box input {
    height: var(--input-box-height);
    line-height: var(--input-box-height);
}

.input-box textarea {
    resize: none;
    line-height: calc(var(--input-box-height) * .8);
    word-break: break-all;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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

.input-box input:focus,
.input-box textarea:focus {
    outline: none;
    border: none;
}

.input-box input.none-resize {
    resize: none;
}
</style>