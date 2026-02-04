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
    },
    deleteManySubs: {
        path: '/rss/subscribe/delMany'
    },
    addOneSubs: {
        path: '/rss/subscribe/addOne'
    }
}

const defaultProp = {
    method: 'post',
    headers: {
        secret: 'mAou5820.subscribe'
    },
    label: 'rssSubscribe'
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;