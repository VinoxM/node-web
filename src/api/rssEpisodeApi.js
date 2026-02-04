const apis = {
    generateMinioLink: {
        path: "/rss/episode/generateSharedLink"
    },
    getEpisodes: {
        path: "/rss/episode/getEpisodes"
    },
    deleteEpisode: {
        path: '/rss/episode/deleteEpisode'
    },
    getFailedEpisodes: {
        path: '/rss/episode/getFailedEpisodes'
    },
    retryFailedEpisode: {
        path: '/rss/episode/retryFailedEpisode',
        options: {
            timeout: 120000
        }
    },
    deleteFailedEpisode: {
        path: '/rss/episode/deleteFailedEpisode'
    },
    updateFailedEpisode: {
        path: '/rss/episode/updateFailedEpisode'
    }
}

const defaultProp = {
    label: 'episode',
    headers: {
        secret: "mAou5820.rssEpisode"
    },
    method: "post"
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;