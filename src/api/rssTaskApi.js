const apis = {
    addTask: {
        path: "/rss/task/addTask"
    },
    generateMinioLink: {
        path: "/rss/task/generateMinioLink"
    }
}

const defaultProp = {
    label: 'task',
    headers: {
        secret: "mAou5820.rssTask"
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