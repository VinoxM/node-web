const apis = {
    updateManySubs: {
        path: '/rss/subscribe/updateMany'
    },
    updateOneSubs: {
        path: '/rss/subscribe/updateOne'
    },
    editOneSubs: {
        path: '/rss/subscribe/editOne'
    },
    getOneSubs: {
        path: '/rss/v2/getOneForEdit',
        method: 'get'
    }
}

const defaultProp = {
    method: 'post',
    headers: {
        secret: 'mAou5820.subscribe'
    }
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;