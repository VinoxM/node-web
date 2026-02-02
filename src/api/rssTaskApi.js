const apis = {
    addTask: {
        path: "/rss/task/addTask"
    },
    generateMinioLink: {
        path: "/rss/task/generateMinioLink"
    },
    taskInfo: {
        path: '/rss/task/taskInfo'
    },
    getTasks: {
        path: '/rss/task/getTasks'
    },
    deleteTask: {
        path: '/rss/task/deleteTask'
    },
    pauseTask: {
        path: '/rss/task/pauseTask'
    },
    resumeTask: {
        path: '/rss/task/resumeTask'
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