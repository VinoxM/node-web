<template>
    <div tabindex="1" class="sel-input-box" ref="box">
        <input ref="input" class="sel-input" v-model="model" @focus="inputFocus" @keydown="inputKeyPress"
            @blur="inputBlur" />
        <div ref="label" class="sel-input-label" v-show="labelVisible" v-loading="loading">
            <span class="label-item" :class="{ active: activeIndex === k }" v-for="(val, k) of options" :key="k"
                @mouseenter="itemHover(k)" @click="itemConfirm">{{ val.label }}</span>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, useTemplateRef, watch, ref, nextTick } from 'vue';

const model = defineModel({ type: [String, Number] });
const { options, loading } = defineProps({
    options: {
        type: Array,
        required: true,
        default: []
    },
    loading: {
        type: Boolean,
        required: false,
        default: false
    }
})
const labelVisible = ref(false);
const activeIndex = ref(-1);

const boxRef = useTemplateRef("box");
const inputRef = useTemplateRef("input");
const labelRef = useTemplateRef("label");

const emit = defineEmits(['submit', 'cancel']);

watch(() => options, () => activeIndex.value = -1);

const inputFocus = () => {
    labelVisible.value = true;
    nextTick(setupPosition);
}

const inputBlur = e => {
    if (e.relatedTarget === boxRef.value) {
        e.preventDefault();
        inputRef.value?.focus();
    } else {
        labelVisible.value = false;
        emit('cancel');
    }
}

const inputKeyPress = e => {
    switch (e.code) {
        case 'Enter':
            e.preventDefault();
            itemConfirm();
            break;
        case 'ArrowDown':
            setupActiveIndex(1);
            break;
        case 'ArrowUp':
            setupActiveIndex(-1);
            break;
    }
}

const itemConfirm = () => {
    if (model.value.trim() !== '') {
        emit('submit');
    } else if (options[activeIndex.value]) {
        model.value = options[activeIndex.value].value;
        emit('submit');
    } else {
        emit('cancel')
    }
    labelVisible.value = false;
}

const itemHover = (i) => {
    activeIndex.value = i
}

const setupActiveIndex = (step = 0) => {
    const newIndex = Math.max(activeIndex.value + step, 0);
    if (options[newIndex]) {
        activeIndex.value = newIndex;
        Array.from(labelRef.value.querySelectorAll('.label-item'))[newIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
}

const setupPosition = () => {
    if (labelVisible.value) {
        const inputRect = inputRef.value?.getBoundingClientRect();
        const { x, y, height, width } = inputRect;
        labelRef.value?.style.setProperty('--react-x', x + 'px');
        labelRef.value?.style.setProperty('--react-y', y + height + 5 + 'px');
        labelRef.value?.style.setProperty('width', width + 'px');
    }
}

const boundedElement = [];

const bindSetupPosition = () => {
    const elem = labelRef?.value;
    let el = elem?.parentElement;
    window.addEventListener('resize', setupPosition);
    while (el) {
        el.addEventListener('scroll', setupPosition);
        boundedElement.push(el);
        if (el.tagName === 'DIALOG') break;
        el = el.parentElement;
    }
}

const unbindSetupPosition = () => {
    let el = boundedElement.pop();
    window.removeEventListener('resize', setupPosition);
    while (el) {
        el.removeEventListener('scroll', setupPosition);
        el = boundedElement.pop();
    }
}

onMounted(() => {
    bindSetupPosition();
    setupPosition();
})

onUnmounted(() => {
    unbindSetupPosition();
})

defineExpose({
    focus: () => {
        inputRef.value.focus();
    }
})
</script>

<style scoped>
.sel-input-box {
    --input-height: 24px;
}

.sel-input {
    border: none;
    outline: none;
    height: var(--input-height);
}

.sel-input-box:has(input:focus) {
    box-shadow: 0 0 2px 1px #409eff;
}

.sel-input-label {
    --react-x: 0;
    --react-y: 0;
    position: fixed;
    display: flex;
    top: var(--react-y);
    left: var(--react-x);
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 12px 0px;
    background-color: #fff;
    height: calc(var(--input-height) * 4);
    border-radius: 6px;
    overflow-y: scroll;
    z-index: 20;
}

.sel-input-label .label-item {
    height: var(--input-height);
    line-height: var(--input-height);
    border-radius: 6px;
    background-color: #fff;
    color: rgb(96, 98, 102);
    padding: 0 4px;
    user-select: none;
    overflow: hidden;
    width: 100%;
    flex-shrink: 0;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    box-sizing: border-box;
}

.sel-input-label .label-item.active {
    background-color: rgb(245, 247, 250);
    color: rgb(96, 98, 102);
}
</style>