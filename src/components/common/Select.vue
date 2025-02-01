<template>
    <div tabindex="1" class="select-box" :class="{ active: opsVisible }" :style="widthStyle" ref="box">
        <div class="select-label" ref="select-label" @click="labelClicked">
            <input @blur="labelBlur" ref="select-input" readonly />
            <span :class="labelClass">{{ label }}</span>
            <i class="icon-right-open"></i>
        </div>
        <div ref="select-options" class="option-box" v-show="opsVisible">
            <div class="option-item" :class="itemClass(k)" v-for="(val, k) of options" :key="k"
                @mouseenter="itemHover(k)" @click="itemConfirm">
                <span>{{ val.label }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, useTemplateRef, ref, computed, watch } from 'vue';

const model = defineModel();
const label = ref('');
const activedIndex = ref(-1);
const opsVisible = ref(false);
const { options, width } = defineProps({
    options: {
        type: Array,
        required: false,
        default: []
    },
    width: {
        type: String,
        required: false,
        default: '120px'
    }
})

const boxRef = useTemplateRef('box');
const opsRef = useTemplateRef('select-options');
const labelRef = useTemplateRef("select-label");
const inputRef = useTemplateRef('select-input');

const labelClass = ref('');

watch(model, val => {
    activedIndex.value = options.findIndex(o=>o.value === val);
    label.value = options[activedIndex.value]?.label;
    labelClass.value = options[activedIndex.value]?.customClass || '';
}, {
    immediate: true
})

const labelClicked = () => {
    opsVisible.value = true;
    inputRef.value?.focus();
    setupPosition();
}

const widthStyle = computed(() => Number(width) > -1 ? { width: width + 'px' } : { width });

const labelBlur = e => {
    if (e.relatedTarget === boxRef.value) {
        e.preventDefault();
        inputRef.value?.focus();
    } else {
        opsVisible.value = false;
    }
}

const itemClass = (i) => {
    let cl = [];
    if (options[i]?.customClass) {
        cl.push(options[i]?.customClass);
    }
    if (activedIndex.value === i) {
        cl.push('active')
    }
    return cl.join(' ');
}

const itemHover = (i) => {
    activedIndex.value = i;
}

const itemConfirm = () => {
    const i = activedIndex.value;
    model.value = options[i].value;
    opsVisible.value = false;
}

const setupPosition = () => {
    if (opsVisible.value) {
        const labelRect = labelRef.value?.getBoundingClientRect();
        const { x, y, height, width } = labelRect;
        opsRef.value?.style.setProperty('--react-x', x + 'px');
        opsRef.value?.style.setProperty('--react-y', y + height + 5 + 'px');
        opsRef.value?.style.setProperty('width', width + 'px');
    }
}

const bindedElement = [];

const bindSetupPosition = () => {
    const elem = opsRef?.value;
    let el = elem?.parentElement;
    window.addEventListener('resize', setupPosition);
    while (el) {
        el.addEventListener('scroll', setupPosition);
        bindedElement.push(el);
        if (el.tagName === 'DIALOG') break;
        el = el.parentElement;
    }
}

const unbindSetupPosition = () => {
    let el = bindedElement.pop();
    window.removeEventListener('resize', setupPosition);
    while (el) {
        el.removeEventListener('scroll', setupPosition);
        el = bindedElement.pop();
    }
}

onMounted(() => {
    bindSetupPosition();
    setupPosition();
})

onUnmounted(() => {
    unbindSetupPosition();
})

</script>

<style scoped>
.select-box {
    --select-height: 24px;
}

.select-label {
    height: var(--select-height);
    line-height: var(--select-height);
    display: flex;
    position: relative;
    box-shadow: 0 0 2px 1px #dcdfe6;
    border-radius: 6px;
}

.select-label input {
    border: none;
    outline: none;
    width: 0;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0;
    z-index: -1;
}

.select-label span {
    height: var(--select-height);
    line-height: var(--select-height);
    padding: 0 20px 0 5px;
    cursor: pointer;
    width: 100%;
    font-size: var(--font-size-mini);
}

.select-box.active .select-label {
    box-shadow: 0 0 2px 1px #409eff;
}

.select-label i,
.select-label i::before {
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: block;
    margin: 0;
    padding: 0;
    text-align: center;
    font-size: var(--font-size-mini);
}

.select-box .select-label i {
    position: absolute;
    right: 4px;
    top: calc(var(--select-height) / 2 - 8px);
    transform: rotate(90deg);
    transition: all var(--transition-delay);
    color: #92959b;
}

.select-box.active .select-label i {
    transform: rotate(270deg);
    color: #409eff;
}

.option-box {
    --react-x: 0;
    --react-y: 0;
    position: fixed;
    display: flex;
    top: var(--react-y);
    left: var(--react-x);
    flex-direction: column;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 12px 0px;
    background-color: #fff;
    height: calc(var(--select-height) * 4);
    border-radius: 6px;
    overflow-y: scroll;
    z-index: 20;
}

.option-item {
    height: var(--select-height);
    line-height: var(--select-height);
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

.option-item.active {
    background-color: rgb(245, 247, 250);
    color: rgb(96, 98, 102);
}
</style>