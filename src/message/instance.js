import { createApp } from "vue"
import Message from "./Message.vue"

const createInstance = (cfg) => {
    const config = cfg || {
        type: 'info'
    };
    const appendTo = config.appendTo ?? document.body;
    let messageNode = document.createElement("div");
    const cls = document.createAttribute('class');
    cls.value = `message ${config.type}`;
    messageNode.setAttributeNode(cls);

    const handleRemove = () => {
        ins.unmount(messageNode);
        appendTo.removeChild(messageNode);
        resetMsgTop();
    }
    const resetMsgTop = () => {
        const msgArr = Array.from(appendTo.querySelectorAll('div.message'));
        const heightArr = msgArr.map(t => t.offsetHeight);
        for (let i = 0; i < msgArr.length; i++) {
            const msgNode = msgArr[i];
            const sliceArr = heightArr.slice(0, i)
            msgNode.style.top = sliceArr.reduce((a, b) => a + b, 0) + (i + 1) * 5 + 'px';
            msgNode.style.opacity = 1;
        }
    }
    const ins = createApp(Message, {
        config, remove: () => handleRemove()
    })
    ins.mount(messageNode);
    appendTo.appendChild(messageNode);
    resetMsgTop();
    ins.close = () => handleRemove();
    return ins;
}

export const typeEnum = ['info','success','warning','error']

export const renderMessage = (type = 'info', message, duration = 2000, appendTo) => {
    let t = typeEnum.indexOf(type) === -1 ? 'info' : type;
    let d = duration > 0 ? duration : 2000;
    return createInstance({
        type: t, duration: d, content: message, appendTo
    });
}

typeEnum.forEach(t=> {
    renderMessage[t] = (msg, duration, appendTo) => renderMessage(t, msg, duration, appendTo);
})