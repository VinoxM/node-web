<template>
    <dialog class="dialog" ref="dialog" v-if="!destroyed" :class="{ modaless: !modal }">
        <div class="dialog-container-loading" v-loading="loading" mask-index="99" v-if="loading"
            :style="{ minHeight: minHeight + 'px' }">
            <div class="dialog-close" @click="visible = false">
                <i class="icon-cancel"></i>
            </div>
        </div>
        <div class="dialog-container" v-else :style="{ minHeight: minHeight + 'px' }">
            <div class="dialog-header" v-if="needTitle">
                <slot name="header"><span class="limit-box one-line">{{ title }}</span></slot>
            </div>
            <div class="dialog-close" @click="visible = false">
                <i class="icon-cancel"></i>
            </div>
            <div class="dialog-main">
                <slot></slot>
            </div>
            <div class="dialog-footer">
                <slot name="footer"></slot>
            </div>
        </div>
        <div class="dialog-mask" v-if="!modal" ref="dialog-mask"></div>
    </dialog>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, useTemplateRef, watch } from 'vue';

const dialog = useTemplateRef("dialog");
const mask = useTemplateRef("dialog-mask");
const destroyed = ref(false);
const visible = defineModel('visible', { type: Boolean, required: true, default: false });

const { title, destroyOnClose, loading, minHeight, closeOnClickModal, closeOnPressEsc, modal } = defineProps({
    title: {
        type: [String, Boolean],
        required: false,
        default: ''
    },
    destroyOnClose: {
        type: Boolean,
        required: false,
        default: false
    },
    beforeClose: {
        type: Function,
        required: false
    },
    loading: {
        type: Boolean,
        required: false,
        default: false
    },
    minHeight: {
        type: Number,
        required: false,
        default: 500
    },
    closeOnClickModal: {
        type: Boolean,
        required: false,
        default: false
    },
    closeOnPressEsc: {
        type: Boolean,
        required: false,
        default: false
    },
    modal: {
        type: Boolean,
        required: false,
        default: false
    }
})

const emit = defineEmits(['opened', 'closed', 'close']);

watch(() => visible.value, (val) => {
    if (val) {
        show();
    } else {
        close();
    }
})

watch(() => closeOnClickModal, (v) => {
    dialog.value?.[v ? 'addEventListener' : 'removeEventListener']('click', clickModel);
})

const needTitle = computed(() => {
    if (typeof title === 'boolean') {
        return title;
    } else if (typeof title === 'string') {
        return title !== 'false';
    }
    return true;
})

const clickModel = (e) => {
    if (modal && e.target === dialog.value) {
        visible.value = false;
    } else if (!modal && e.target === mask.value) {
        visible.value = false;
    }
}

const addListener = (callback) => {
    nextTick(() => {
        dialog.value?.addEventListener('keydown', e => {
            if (e.key !== 'Escape') return;
            if (!closeOnPressEsc) {
                e.preventDefault();
            } else if (visible.value) {
                visible.value = false;
            }
        })
        if (closeOnClickModal) {
            dialog.value?.addEventListener('click', clickModel);
        }
        if (callback && callback instanceof Function) {
            callback();
        }
    })
}

const show = () => {
    const showModal = () => {
        cancelClosed();
        if (modal) {
            dialog.value.showModal();
        } else {
            dialog.value.show();
        }
        emit('opened');
    }
    if (destroyOnClose) {
        destroyed.value = false;
        addListener(showModal);
    } else {
        showModal();
    }
}

let closedTimeout = null;

const cancelClosed = () => {
    if (closedTimeout) {
        clearTimeout(closedTimeout);
        closedTimeout = null;
    }
}

const close = () => {
    dialog.value?.close();
    emit('close');
    closedTimeout = setTimeout(() => {
        if (destroyOnClose) destroyed.value = true;
        emit('closed');
    }, 500);
}

onMounted(() => {
    if (destroyOnClose) {
        destroyed.value = true;
    }
    addListener();
})

</script>

<style>
.dialog {
    padding: 0;
    border: 0;
    border-radius: 8px;
    overflow: hidden;
    max-width: 100%;
    background-color: #fff;
}

dialog.modaless {
    position: fixed;
    top: var(--holder-height);
    left: 0;
    height: calc(var(--vh) - var(--holder-height));
    width: 100%;
    background-color: transparent;
    z-index: 999;
}

.dialog-mask {
    position: absolute;
    z-index: 900;
    height: calc(var(--vh) - var(--holder-height));
    width: 100%;
    top: 0;
}

dialog[open] .dialog-mask {
    background-color: rgba(0, 0, 0, 0.2);
}

dialog.dialog:focus-visible {
    outline: 0;
}

.dialog-container {
    width: var(--dialog-width);
    background-color: #fff;
    position: relative;
}

.dialog-container-loading {
    display: block;
    width: var(--dialog-width);
    position: relative;
}

dialog.modaless .dialog-container,
.dialog-container-loading {
    z-index: 998;
    top: 50%;
    transform: translateY(-50%);
    margin: auto;
}

.dialog-header {
    height: 36px;
    line-height: 36px;
    text-align: center;
    box-shadow: 0 0 3px 0px var(--color-gray-0);
    position: relative;
    user-select: none;
    color: #303133;
    background-color: #eee;
}

.dialog-close {
    height: 24px;
    width: 24px;
    position: absolute;
    right: 6px;
    top: 6px;
    line-height: 24px;
    color: var(--color-gray-0);
    user-select: none;
    cursor: pointer;
    transition: all var(--transition-delay);
    z-index: 100;
}

.dialog-close:hover {
    color: var(--color-red-0);
}
</style>