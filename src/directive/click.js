/**
 * click指令,代替@click
 * 如果点击来源是子组件, 且点击事件从来源冒泡到该元素之间的所有元素如果使用了该指令且有修饰符.stop, 则不会触发方法调用
 */

const shouldStop = (elem, endElem) => {
    if (elem === endElem) return false;
    let el = elem;
    do {
        if (el.__click_modifiers?.stop) {
            return true;
        }
        el = el.parentElement;
    } while (el && el !== endElem);
    return false;
}

const loadingPlugin = {
    install(app) {
        app.directive('click', {
            mounted(el, { value, modifiers }) {
                if (value instanceof Function) {
                    el.__click_modifiers = { ...modifiers };
                    el.addEventListener('click', (e) => {
                        if (modifiers.prevent) {
                            e.preventDefault();
                        }
                        shouldStop(e.target, el) || value(e);
                    });
                }
            },
            beforeUnmount(el, { value }) {
                if (value instanceof Function) {
                    el.removeEventListener('click', value);
                }
            }
        })
    }
}

export default loadingPlugin;