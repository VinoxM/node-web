import { aesDecrypt, encryptPassword, aesEncrypt } from '@/utils/cryptoUtils';

const apis = {
    login: {
        path: '/auth/login',
        preHandle: async (opts) => {
            const data = opts.data
            return encryptPassword(data.password)
                .then(aesEncrypt)
                .then(pwd => {
                    opts.data.password = pwd
                    return opts
                })
        },
        handle: async (data) => {
            return aesDecrypt(data).then(token => {
                localStorage.setItem('token', token)
                return token
            })
        }
    },
    checkAuth: {
        path: '/auth/checkAuth',
        ignoreError: true
    },
    logout: {
        path: '/auth/logout',
        handle(d) {
            localStorage.removeItem('token')
            return d
        }
    }
}

const defaultProp = {
    label: 'authorization',
    method: 'post',
    headers: {
        secret: 'mAou5820.authorization'
    }
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;