<template>
    <dialog ref="dialog" class="dialog card-panel">
        <div class="dialog-container">
            <div class="dialog-close" @click="close">
                <i class="icon-cancel"></i>
            </div>
        </div>
    </dialog>
</template>

<script setup>
import { useTemplateRef } from 'vue';

// refs
const dialogRef = useTemplateRef("dialog");

</script>

<style scoped>

</style>