const apis = {
    getClientMatchers: {
        path: '/media/display/getClientMatchers',
        ignoreError: true
    }
}

const defaultProp = {
    label: 'media',
    method: 'post',
    headers: {
        secret: 'mAou5820.media.display'
    }
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;