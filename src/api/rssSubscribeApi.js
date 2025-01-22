const apis = {
    updateManySubs: {
        path: '/rss/subscribe/updateMany',
        method: 'post'
    },
    updateOneSubs: {
        path: '/rss/subscribe/updateOne',
        method: 'post'
    },
    editOneSubs: {
        path: '/rss/subscribe/editOne',
        method: 'post'
    },
    getOneSubs: {
        path: '/rss/v2/getOneForEdit',
        method: 'get'
    }
}

const defaultProp = {
    headers: {
        secret: 'mAou5820.subscribe'
    }
}

Object.values(apis).forEach(obj => {
    Object.assign(obj, defaultProp);
})

export default apis;