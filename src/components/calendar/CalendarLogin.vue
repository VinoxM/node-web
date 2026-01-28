<template>
    <Dialog v-model:visible="visible" title="用户登录" destroy-on-close :min-height="150">
        <div class="main">
            <InputBox label="Useranme" size="small" v-model="uname" @enter-press="login"></InputBox>
            <span class="warn" :class="{ show: unameWarn.length > 0 }">{{ unameWarn }}</span>
            <InputBox label="Password" size="small" type="password" v-model="pwd" @enter-press="login"></InputBox>
            <span class="warn" :class="{ show: pwdWarn.length > 0 }">{{ pwdWarn }}</span>
            <div class="row center">
                <Link icon="check" type="primary" @click="login">登录</Link>
            </div>
        </div>
    </Dialog>
</template>
<script setup>
import { ref, watch } from 'vue';
import Dialog from '../common/Dialog.vue';
import InputBox from '../common/InputBox.vue';
import Link from '../common/Link.vue';
import { getApi } from '@/api';

const visible = defineModel(false);
const uname = ref('');
const pwd = ref('');
const unameWarn = ref('');
const pwdWarn = ref('');

watch(() => visible.value, v => {
    if (v) {
        uname.value = ''
        pwd.value = ''
        unameWarn.value = ''
        pwdWarn.value = ''
    }
})

const emits = defineEmits(['loginSuccess'])

const login = () => {
    const username = uname.value.trim()
    const password = pwd.value.trim()
    if (username.length === 0) {
        unameWarn.value = '用户名不能为空'
        return
    } else {
        unameWarn.value = ''
    }
    if (password.length === 0) {
        pwdWarn.value = '密码不能为空'
        return
    } else if (password.length <= 4) {
        pwdWarn.value = '密码长度太短'
        return
    } else {
        pwdWarn.value = ''
    }
    getApi('authorization')?.login({ uname: username, password }, () => emitLoginSuccess(), e => {
        if (typeof e === 'string') {
            unameWarn.value = e
        }
    })
}

const emitLoginSuccess = () => emits('loginSuccess')

</script>
<style scoped>
.main {
    padding: 6px 15px;
    display: flex;
    flex-direction: column;
    gap: 0;
}

.warn {
    display: block;
    height: 18px;
    line-height: 18px;
}

.row {
    display: flex;
    flex-direction: row;
    gap: 15px;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
}

.row.center {
    justify-content: center;
}
</style>