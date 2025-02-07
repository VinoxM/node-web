const defaultLoadingText = 'Loading...';
const defaultLoadingIcon = 'loading';

const toLoading = (el) => {
    if (el.classList.contains("directive-loading-parent")) return;
    const loadingText = el.hasAttribute('loading-text') ? el.getAttribute('loading-text') : defaultLoadingText;
    const bgColor = el.hasAttribute('loading-bg-color') ? el.getAttribute('loading-bg-color')?.trim() : '';
    const textColor = el.hasAttribute('loading-text-color') ? el.getAttribute('loading-text-color')?.trim() : '';
    const loadingIcon = el.hasAttribute('loading-icon') ? el.getAttribute('loading-icon') : defaultLoadingIcon;
    el.classList.add("directive-loading-parent");
    const mask = document.createElement('div');
    mask.classList.add('directive-loading');
    if (bgColor !== '') {
        mask.style.backgroundColor = bgColor;
    }
    if (textColor !== '') {
        mask.style.color = textColor;
    }
    if (el.hasAttribute('mask-index')) {
        const maskIndex = Number(el.getAttribute('mask-index')?.trim());
        mask.style.zIndex = maskIndex;
    }
    const label = document.createElement("div");
    label.classList.add('directive-loading-spinner');
    mask.appendChild(label);
    const icon = document.createElement("i");
    icon.className = 'directive-loading-icon animate-spin icon-' + loadingIcon;
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