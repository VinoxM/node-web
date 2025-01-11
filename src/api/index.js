import axios from "axios";

let basePath = "https://vinoxm.fun/server";
// basePath = "https://www.vinoxm.fun/server";
const defaultHeaders = {
    'content-type': 'application/json;charset=UTF-8',
    'secret': "mAou5820"
}

const http = {
    get: (url, params, headers) => {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                params,
                headers
            }).then(response => {
                const res = response.data;
                if (res.code === 0) {
                    resolve(res.data);
                } else {
                    reject(res.message);
                }
            }).catch(_ => {
                console.error(_);
                reject('Request fail.');
            })
        })
    },
    post: (url, data, headers) => {
        return new Promise((resolve, reject) => {
            axios.post(url, data, { headers }).then(response => {
                const res = response.data;
                if (res.code === 0) {
                    resolve(res.data);
                } else {
                    reject(res.message);
                }
            }).catch(_ => {
                console.error(_);
                reject('Request fail.');
            })
        })
    }
}

const apiPlugin = {
    install(app) {
        const api = {};
        const files = import.meta.glob('./*.js');
        const supportMethod = Object.keys(http);
        Object.keys(files).forEach(async key => {
            const module = await files[key]();
            const configs = module.default || module;
            for (const m in configs) {
                let { method, path, handle, headers } = configs[m];
                if (!method) {
                    method = 'get';
                }
                if (supportMethod.includes((method + '').toLocaleLowerCase())) {
                    api[m] = (data) => {
                        return http[method](basePath + path, data, { ...defaultHeaders, ...headers }).then(data => {
                            return handle ? handle(data) : data;
                        })
                    }
                }
            }
        })
        app.config.globalProperties.$api = api;
    }
}

export default apiPlugin;