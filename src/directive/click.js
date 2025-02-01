/**
 * click指令,代替@click
 * 主要作用是其修饰符.stop不会真的阻止冒泡.
 * 其父元素会收到点击事件,除非父元素也使用该指令.
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