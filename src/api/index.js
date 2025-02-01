import axios from "axios";
import message from '@/message';

axios.defaults.timeout = 5 * 1000;

let basePath = "https://vinoxm.fun/server";
// basePath = "https://www.vinoxm.fun/server";
const defaultHeaders = {
    'content-type': 'application/json;charset=UTF-8',
    'secret': "mAou5820"
}

const http = {
    get: (url, params, headers, cancelToken) => {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                params,
                headers,
                cancelToken
            }).then(response => {
                const res = response.data;
                if (res.code === 0) {
                    resolve(res.data);
                } else {
                    reject(res.message);
                }
            }).catch(error => {
                if (!axios.isCancel(error)) {
                    console.error(error);
                    reject('Request fail.');
                }
            })
        })
    },
    post: (url, data, headers, cancelToken) => {
        return new Promise((resolve, reject) => {
            axios.post(url, data, { headers, cancelToken }).then(response => {
                const res = response.data;
                if (res.code === 0) {
                    resolve(res.data);
                } else {
                    reject(res.message);
                }
            }).catch(error => {
                if (!axios.isCancel(error)) {
                    console.error(error);
                    reject('Request fail.');
                } else {
                    reject({ msg: error.message, isCancel: true })
                }
            })
        })
    }
}

let api = null;

const apiPlugin = {
    install() {
        const api_ = {};
        const files = import.meta.glob('./*.js');
        const supportMethod = Object.keys(http);
        Object.keys(files).forEach(async key => {
            const module = await files[key]();
            const configs = module.default || module;
            for (const m in configs) {
                let { method, path, handle, headers, ignoreError } = configs[m];
                if (!method) {
                    method = 'get';
                }
                if (supportMethod.includes((method + '').toLocaleLowerCase())) {
                    api_[m] = (data, resolve, reject) => {
                        const source = axios.CancelToken.source();
                        http[method](basePath + path, data, { ...defaultHeaders, ...headers }, source.token).then(data => {
                            if (resolve instanceof Function) resolve(handle ? handle(data) : data)
                        }).catch(e => {
                            if (!ignoreError && typeof e === 'string') {
                                message.error(e);
                            }
                            console.error(e);
                            if (reject instanceof Function) reject(e);
                        });
                        return source;
                    }
                }
            }
        })
        api = api_;
    }
}

export const getApi = () => {
    if (api === null) {
        apiPlugin.install();
    }
    return api;
}

export const cancel = (source) => {
    if (source) {
        source.cancel('Request canceled.');
    }
}

export default apiPlugin;