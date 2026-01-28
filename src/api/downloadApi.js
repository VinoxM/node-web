const apis = {
    addAria2Torrent: {
        path: "/download/aria2/addTorrent",
        method: "post",
        headers: {
            secret: "mAou5820.download"
        }
    },
    addTorrent: {
        path: "/download/qbit/addTorrent",
        method: "post",
        headers: {
            secret: "mAou5820.download"
        }
    }
}


const defaultProp = {
    label: 'download'
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;