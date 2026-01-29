<template>
    <div class="ani-edit-box">
        <div class="ani-edit-tools">
            <div class="ani-edit-label">
                <span>{{ checkedCount }}</span> / <span>{{ resultCount }}</span>
            </div>
            <Button size="small" icon="trash" type="danger" :disabled="checkedCount === 0" :loading="isUpdating"
                @click="deleteCheckedClicked">删除选中</Button>
            <Button size="small" icon="spin3" type="success" :disabled="checkedCount === 0" :loading="isUpdating"
                @click="updateCheckedClicked">更新选中</Button>
        </div>
        <div class="ani-edit-icon" @click="emitEdit">
            <span>编辑模式</span>
            <i class="icon-edit"></i>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import Button from '../common/Button.vue';
const { editMode, resultCount, checkedCount } = defineProps({
    editMode: Boolean,
    resultCount: Number,
    checkedCount: Number
})

const isUpdating = ref(false)

// emit
const emit = defineEmits(['update:editMode', 'updateChecked', 'deleteChecked'])

const emitEdit = () => {
    emit('update:editMode', !editMode);
}

const emitUpdateChecked = () => {
    isUpdating.value = true;
    emit('updateChecked', () => isUpdating.value = false);
}

const emitDeleteChecked = () => {
    isUpdating.value = true;
    emit('deleteChecked', () => isUpdating.value = false);
}

const deleteCheckedClicked = () => checkedCount > 0 && emitDeleteChecked()

const updateCheckedClicked = () => checkedCount > 0 && emitUpdateChecked()
</script>

<style scoped>
.ani-edit-box {
    --edit-icon-width: 20px;
    --edit-width: var(--edit-icon-width);
    --edit-text-width: 58px;
    display: flex;
    flex-direction: row-reverse;
    position: fixed;
    right: 4px;
    bottom: 4px;
    height: var(--edit-box-height);
    line-height: var(--edit-box-height);
    width: var(--edit-width);
    overflow: hidden;
    transition: all var(--transition-delay);
    z-index: 2001;
}

.ani-main.edit-mode .ani-edit-box {
    --edit-width: var(--edit-box-width);
}

.ani-main.edit-mode .ani-edit-box .ani-edit-icon,
.ani-main:not(.edit-mode) .ani-edit-box:hover,
.ani-main:not(.edit-mode) .ani-edit-box:hover .ani-edit-icon {
    width: calc(var(--edit-icon-width) + var(--edit-text-width));
}

.ani-main.edit-mode .ani-edit-box .ani-edit-icon,
.ani-main:not(.edit-mode) .ani-edit-box:hover .ani-edit-icon {
    background-color: var(--color-blue-0);
    border-radius: 4px;
    color: var(--color-white-0);
}

.ani-main.edit-mode .ani-edit-box .ani-edit-icon:hover {
    background-color: var(--color-red-0);
    color: var(--color-white-0);
}

.ani-edit-box .ani-edit-icon {
    cursor: pointer;
    display: flex;
    flex-direction: row-reverse;
    transition: all var(--transition-delay);
    position: relative;
    width: var(--edit-icon-width);
    overflow: hidden;
}

.ani-edit-box .ani-edit-icon i::before {
    width: var(--edit-icon-width);
    height: var(--edit-box-height);
    line-height: var(--edit-box-height);
    text-align: center;
    margin: 0;
}

.ani-edit-box .ani-edit-icon span {
    display: block;
    position: absolute;
    width: var(--edit-text-width);
    top: 0;
    right: var(--edit-icon-width);
    text-align: right;
    font-size: var(--font-size-small);
}

.ani-edit-tools {
    position: absolute;
    right: calc(var(--edit-icon-width) + var(--edit-text-width));
    display: flex;
    justify-content: center;
    gap: 4px;
    width: calc(var(--edit-box-width) - var(--edit-icon-width) - var(--edit-text-width));
    height: var(--edit-box-height);
    line-height: var(--edit-box-height);
}

.ani-edit-tools button {
    height: var(--edit-box-height) !important;
    line-height: calc(var(--edit-box-height) - 2px) !important;
}

.ani-edit-label {
    border-radius: 5px;
    background-color: #909399;
    color: #fff;
    padding: 0 5px;
    user-select: none;
    font-size: 14px;
}
</style>