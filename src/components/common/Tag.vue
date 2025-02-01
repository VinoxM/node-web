<template>
    <span class="tag-box">{{ value }} <i class="icon-cancel" v-click.stop="() => $emit('close')"></i></span>
</template>

<script setup>
const { value } = defineProps({
    value: String
})
</script>

<style scoped>
.tag-box {
    --tag-box-height: var(--input-height);
    display: inline-block;
    padding: 0 20px 0 4px;
    position: relative;
    text-align: center;
    color: #909399;
    background-color: #f4f4f5;
    border: 1px solid #e9e9eb;
    border-radius: 6px;
    height: var(--tag-box-height);
    line-height: var(--tag-box-height);
    font-size: 12px;
}

.tag-box i {
    position: absolute;
    width: 16px;
    height: 16px;
    line-height: 16px;
    display: block;
    border-radius: 50%;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    color: #909399;
    cursor: pointer;
}

.tag-box i:hover {
    color: #fff;
    background: #909399;
}

.tag-box i::before {
    display: block;
    margin: 0;
    padding: 0;
    width: 16px;
    height: 16px;
    line-height: 16px;
}
</style>