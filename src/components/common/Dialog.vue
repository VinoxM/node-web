<template>
    <dialog class="dialog" ref="dialog">
        <div class="dialog-container">
            <div class="dialog-header">
                <slot name="header"><span class="limit-box one-line">{{ title }}</span></slot>
                <div class="dialog-close" @click="closeDialog">X</div>
            </div>
            <div class="dialog-main">
                <slot></slot>
            </div>
            <div class="dialog-footer">
                <slot name="footer"></slot>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { onMounted, useTemplateRef, watch } from 'vue';

const dialog = useTemplateRef("dialog");

const emit = defineEmits(['update:visible'])

const { visible } = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        required: false
    }
})

onMounted(() => {
    dialog.value.addEventListener('cancel', () => {
        if (visible) {
            emit('update:visible', false);
        }
    })

    dialog.value.addEventListener('click', e => {
        if (e.target === dialog.value) {
            emit('update:visible', false);
        }
    })
})

const closeDialog = () => {
    emit('update:visible', false);
}

watch(() => visible, (v) => {
    if (v) {
        dialog.value.showModal();
    } else {
        dialog.value.close();
    }
})

</script>

<style scoped>
.dialog {
    padding: 0;
    border: 0;
    border-radius: 8px;
    overflow: hidden;
}

dialog.dialog:focus-visible {
    outline: 0;
}

.dialog-container {
    width: var(--dialog-width);
}

.dialog:modal {
    animation: fadeInUp 0.3s;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translate3d(0, 20%, 0);
    }

    to {
        opacity: 1;
        -webkit-transform: translate3d(0, 0, 0);
        transform: translate3d(0, 0, 0);
    }
}

.dialog-header {
    height: 36px;
    line-height: 36px;
    text-align: center;
    box-shadow: 0 0 3px 0px var(--color-gray-0);
    position: relative;
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
    transition: all 0.3s;
}

.dialog-close:hover {
    color: var(--color-red-0);
}

.dialog-main {
    padding: 15px;
    height: 500px;
}
</style>