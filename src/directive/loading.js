const defaultLoadingText = 'Loading...';

const toLoading = (el) => {
    if (el.classList.contains("directive-loading-parent")) return;
    const loadingText = el.hasAttribute('loading-text') ? el.getAttribute('loading-text') : defaultLoadingText;
    const bgColor = el.hasAttribute('loading-bg-color') ? el.hasAttribute('loading-bg-color')?.trim() : '';
    el.classList.add("directive-loading-parent");
    const mask = document.createElement('div');
    mask.classList.add('directive-loading');
    if (bgColor !== '') {
        mask.style.backgroundColor = bgColor;
    }
    const label = document.createElement("div");
    label.classList.add('directive-loading-spinner');
    mask.appendChild(label);
    const icon = document.createElement("i");
    icon.className = 'directive-loading-icon icon-loading animate-spin';
    label.appendChild(icon);
    const p = document.createElement("p");
    p.classList.add('directive-loading-label');
    p.innerText = loadingText;
    label.appendChild(p);
    el.appendChild(mask);
}

const outLoading = (el) => {
    Array.from(el.querySelectorAll('.directive-loading')).forEach(e => {
        e.remove();
    })
    el.classList.remove('directive-loading-parent');
}

const loadingPlugin = {
    install(app) {
        app.directive('loading', {
            mounted(el, {value}) {
                if (value) {
                    toLoading(el);
                }
            },
            updated(el, { value }) {
                if (value) {
                    toLoading(el);
                } else {
                    outLoading(el);
                }
            }
        })
    }
}

export default loadingPlugin;