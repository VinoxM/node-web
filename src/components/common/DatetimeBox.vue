<template>
    <div class="datetime-box">
        <span class="label" v-if="needLabel">{{ label }}</span>
        <input class="year" type="number" v-model="modelArr[0]" @change="timeChange(0)" @focus="inputFocus" />
        <span class="separator">/</span>
        <input class="month" type="number" v-model="modelArr[1]" @change="timeChange(1)" @focus="inputFocus" />
        <span class="separator">/</span>
        <input class="date" type="number" v-model="modelArr[2]" @change="timeChange(2)" @focus="inputFocus" />
        <span class="separator" v-if="needHours"> </span>
        <input class="hours" type="number" v-model="modelArr[3]" @change="timeChange(3)" @focus="inputFocus"
            v-if="needHours" />
        <span class="separator" v-if="needMinutes">:</span>
        <input class="minutes" type="number" v-model="modelArr[4]" @change="timeChange(4)" @focus="inputFocus"
            v-if="needMinutes" />
        <span class="separator" v-if="needSeconds">:</span>
        <input class="seconds" type="number" v-model="modelArr[5]" @change="timeChange(5)" @focus="inputFocus"
            v-if="needSeconds" />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';

const model = defineModel({ type: String, required: true });
const modelArr = ref([0, 0, 0, 0, 0, 0]);
let oldModelArr = [0, 0, 0, 0, 0, 0];

watch(() => model.value, (val, oldVal) => {
    try {
        const newModelArr = convertTimeStr2Array(val);
        oldModelArr = [...modelArr.value];
        modelArr.value = newModelArr;
    } catch (error) {
        modelArr.value = [...oldModelArr];
        model.value = oldVal;
    }
})

const inputValidator = [
    v => /^[0-9]{4}$/.test(v),
    v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 12,
    v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 31,
    v => /^[0-9]{1,2}$/.test(v) && Number(v) <= 30,
    v => /^[0-9]{1,2}$/.test(v) && Number(v) < 60,
    v => /^[0-9]{1,2}$/.test(v) && Number(v) < 60
]

const convertTimeStr2Array = (datetime) => {
    const s = new Date(datetime);
    return datetime ? [s.getFullYear(), s.getMonth() + 1, s.getDate(), s.getHours(), s.getMinutes(), s.getSeconds()] : [0, 0, 0, 0, 0, 0];
}

const convertArray2TimeStr = (arr) => {
    if (Number(arr[3]) >= 24) {
        arr[2] += 1;
        arr[3] -= 24;
    }
    return `${arr[0]}/${arr[1]}/${arr[2]} ${arr[3]}:${arr[4]}:${arr[5]}`;
}

const timeChange = (index) => {
    if (!inputValidator[index](modelArr.value[index])) {
        modelArr.value[index] = oldModelArr[index];
    } else {
        oldModelArr[index] = modelArr.value[index];
        model.value = convertArray2TimeStr(modelArr.value);
    }
}

const inputFocus = (el) => el?.target?.select();

const { type, label } = defineProps({
    type: {
        type: String,
        required: false,
        default: 'datetime',
        validator: v => ['date', 'datehours', 'dateminutes', 'datetime'].includes(v)
    },
    label: {
        type: [String, Boolean],
        required: false,
        default: false
    }
})

const needLabel = computed(() => {
    if (typeof label === 'string') {
        return label !== 'false';
    } else if (typeof label === 'boolean') {
        return label;
    }
    return false;
})
const needHours = computed(() => type !== 'date');
const needMinutes = computed(() => ['datetime', 'dateminutes'].includes(type));
const needSeconds = computed(() => type === 'datetime');

onMounted(() => {
    modelArr.value = convertTimeStr2Array(model.value);
    oldModelArr = [...modelArr.value];
})
</script>

<style scoped>
.datetime-box {
    --datetime-box-height: var(--input-height);
    --datetime-font-size: var(--font-size-normal);
    display: flex;
    gap: 0;
    height: var(--datetime-box-height);
    font-size: var(--datetime-font-size);
    background-color: #fff;
    box-shadow: 0 0 2px 1px #dcdfe6;
    border-radius: 8px;
    overflow: hidden;
    transition: all var(--transition-delay);
}

.datetime-box:has(input:focus) {
    box-shadow: 0 0 2px 1px #409eff;
}

.datetime-box .label {
    display: block;
    position: relative;
    text-align: right;
    box-sizing: border-box;
    font-size: var(--datetime-font-size);
    height: var(--datetime-box-height);
    line-height: var(--datetime-box-height);
    background-color: #f5f7fa;
    color: #909399;
    border-radius: 8px 0 0 8px;
    padding: 0 4px;
    flex-shrink: 0;
    user-select: none;
}

.datetime-box .label::after {
    content: ": ";
    display: block;
    height: var(--datetime-box-height);
    line-height: var(--datetime-box-height);
    position: absolute;
    right: 0;
    top: 0;
}

.datetime-box input {
    display: block;
    text-align: center;
    width: 25px;
    border: none;
    border-radius: 0;
    flex-grow: 1;
    height: var(--datetime-box-height);
    line-height: var(--datetime-box-height);
    font-size: var(--datetime-font-size);
    padding: 0 4px;
    background-color: #fff;
}

.datetime-box input:focus {
    outline: none;
    border: none;
}

.datetime-box input.year {
    width: 35px;
}

.datetime-box span.separator {
    display: block;
    width: 8px;
    height: var(--datetime-box-height);
    line-height: var(--datetime-box-height);
    text-align: center;
    color: #909399;
}
</style>