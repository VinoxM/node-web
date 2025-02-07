const openTagA = (href) => {
    window.shellOpenUrl?.(href);
}

const loadingPlugin = {
    install(app) {
        app.directive('href', {
            mounted(el) {
                if (el.tagName === 'A') {
                    el.addEventListener('click', (e) => {
                        openTagA(el.href);
                    });                    
                }
            }
        })
    }
}

export default loadingPlugin;