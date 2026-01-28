const apis = {
    getFavorites: {
        path: '/favorites/getUserSubscriptions',
        method: 'get',
        ignoreError: true
    },
    addFavorites: {
        path: '/favorites/userSubscription/add',
    },
    delFavorites: {
        path: '/favorites/userSubscription/del',
    }
}

const defaultProp = {
    label: 'favorites',
    method: 'post',
    headers: {
        secret: 'mAou5820.userFavorites'
    }
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;