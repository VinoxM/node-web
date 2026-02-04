import axios from "axios";
import message from '@/message';

axios.defaults.timeout = 10 * 1000;

let basePath = "https://server.vinoxm.name";
if (import.meta.env.DEV) {
    basePath = `https://server.vinoxm.cloud`;
    basePath = `https://28000--main--code-server--maou864--coder.vinoxm.cloud`;
} else {
    basePath = `${location.protocol}//${location.host.replace("anime", 'server')}`;
}

const defaultHeaders = {
    'content-type': 'application/json;charset=UTF-8',
    'secret': "mAou5820"
}

const http = {
    get: (url, params, headers, cancelToken, options = {}) => {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                params,
                headers,
                cancelToken,
                ...options
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
    post: (url, data, headers, cancelToken, options = {}) => {
        return new Promise((resolve, reject) => {
            axios.post(url, data ?? {}, { headers, cancelToken, ...options }).then(response => {
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
const interceptors = [];

const apiPlugin = {
    install() {
        api = new Map();
        const api_ = {}
        api.set('default', api_)
        const files = import.meta.glob('./*.js');
        const supportMethod = Object.keys(http);
        Object.keys(files).forEach(async key => {
            const module = await files[key]();
            const configs = module.default || module;
            for (const m in configs) {
                let { basePath: base, method, path, preHandle, handle, headers, ignoreError, label = 'default', options = {} } = configs[m];
                if (!method) {
                    method = 'get';
                }
                if (supportMethod.includes((method + '').toLocaleLowerCase())) {
                    const func = (data, resolve, reject) => {
                        const source = axios.CancelToken.source();
                        const headers_ = { ...defaultHeaders, ...headers };
                        interceptors.reduce((prev, { func }) => prev.then(func), Promise.resolve({ headers: headers_, data }))
                            .then(opts => {
                                let todo = Promise.resolve(opts)
                                if (preHandle && preHandle instanceof Function) {
                                    todo = todo.then(preHandle)
                                }
                                todo.then(opts_ => {
                                    return http[method](
                                        (base ?? basePath) + path,
                                        opts_?.data ?? data,
                                        opts_?.headers ?? headers_,
                                        source.token,
                                        options
                                    ).then(data => {                                        
                                        if (handle && handle instanceof Function) {
                                            const res = handle(data)
                                            if (res instanceof Promise) {
                                                res.then(resolve)
                                            } else {
                                                resolve?.(res)
                                            }
                                        } else {
                                            resolve?.(data)
                                        }
                                    })
                                }).catch(e => {
                                    if (!ignoreError && typeof e === 'string') {
                                        message.error(e);
                                    }
                                    console.error(e);
                                    if (reject instanceof Function) reject(e);
                                });
                            })
                        return source;
                    }
                    api_[m] = func
                    const labelApi_ = api.get(label) || {}
                    labelApi_[m] = func
                    api.set(label, labelApi_)
                }
            }
        })
    },
    registerInterceptor(label, func, order = 0) {
        if (!label || typeof label !== 'string' || label.trim().length === 0) {
            return
        }
        if (func && func instanceof Function && !interceptors.some(o => o.label === label)) {
            interceptors.push({ func, order, label })
            interceptors.sort((a, b) => b.order ?? 0 - a.order ?? 0)
        }
    },
    unregisterInterceptor(label) {
        if (!label || typeof label !== 'string' || label.trim().length === 0) {
            return
        }
        const index = interceptors.findIndex(o => o.label === label)
        if (index > -1) {
            interceptors.splice(index, 1)
        }
    }
}

export const getApi = (label = 'default') => {
    if (api === null) {
        apiPlugin.install();
    }
    return api.get(label) || {};
}

export const cancel = (source) => {
    if (source) {
        source.cancel('Request canceled.');
    }
}

export default apiPlugin;