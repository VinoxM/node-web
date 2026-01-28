<template>
    <div class="ani-user-box" :class="{ authed: authorized }">
        <span class="ani-user-label">{{ authedLabel }}</span>
        <User class="ani-user-icon" v-if="authorized"></User>
        <Login class="ani-user-icon" v-else></Login>
    </div>
</template>
<script setup>
import { computed, inject } from 'vue';
import Login from '../common/Login.vue';
import User from '../common/User.vue';

const authorized = inject('authorization')
const authedLabel = computed(() => authorized.value ? '登出' : '登录')
</script>
<style scoped>
.ani-user-box {
    --box-size: 32px;
    --icon-size: 24px;
    --label-width: 38px;
    --hover-color: var(--color-white-0);
    --hover-bg-color: var(--color-blue-0);
    display: flex;
    flex-direction: row-reverse;
    gap: 0;
    position: fixed;
    right: 4px;
    bottom: 44px;
    width: var(--icon-size);
    height: var(--box-size);
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    transition: all 0.5s;
    color: #68768C;
    z-index: 2001;
}

.ani-user-box.authed {
    --hover-color: var(--color-white-0);
    --hover-bg-color: var(--color-red-0);
}

.ani-user-box:hover {
    width: calc(var(--icon-size) + var(--label-width));
    background-color: var(--hover-bg-color);
    border-radius: 4px;
    color: var(--hover-color);
}

.ani-user-label {
    position: absolute;
    top: 0;
    right: var(--icon-size);
    display: block;
    width: var(--label-width);
    height: var(--box-size);
    line-height: var(--box-size);
    text-align: right;
}

.ani-user-icon {
    padding: calc((var(--box-size) - var(--icon-size)) / 2) 0;
    width: var(--icon-size);
    height: var(--box-size);
    box-sizing: border-box;
}
</style>