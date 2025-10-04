import { getNowDay } from '@/utils/dateUtils';

const initDataDict = (nowDay) => {
    if (!nowDay) {
        nowDay = getNowDay();
    }
    return [
        { timeline: [], isToday: nowDay === 1 },
        { timeline: [], isToday: nowDay === 2 },
        { timeline: [], isToday: nowDay === 3 },
        { timeline: [], isToday: nowDay === 4 },
        { timeline: [], isToday: nowDay === 5 },
        { timeline: [], isToday: nowDay === 6 },
        { timeline: [], isToday: nowDay === 0 }
    ];
}

export default {
    getSeason: {
        path: "/rss/v2/getSeason"
    },
    getSearch: {
        path: "/rss/v2/getSearch",
        handle: (data) => {
            // prepare to handle data.
            let list = Array.from(data);
            const listRef = {};
            const resultCount = list.length;
            const nowDay = getNowDay();
            let dayDictArray = initDataDict(nowDay);
            let webArray = [];
            const now = new Date();
            // group by day.
            for (const obj of list) {
                let cover = String(obj.C);
                const d = obj.D + '';
                const startDate = [d.substring(0, 4), d.substring(4, 6), d.substring(6, 8)];
                const updateTime = [d.substring(8, 10), d.substring(10, 12)];
                const startTime = new Date(startDate.join('/') + ' ' + updateTime.join(':') + ':00').getTime();
                let day = Number(d.substring(12, 13));
                const val = {
                    titleCN: obj.Z,
                    titleJP: obj.J,
                    startDate: startDate.join('/'),
                    cover,
                    type: obj.T,
                    status: obj.S,
                    latestEp: obj.E,
                    hasNew: obj.N,
                    unique: obj.U,
                    epCount: obj.R,
                    goon: obj.G ?? 0,
                    checked: false,
                    finLoading: false
                }
                if (val.type.split("")[1] === '1') {
                    webArray.push(val);
                    listRef[val.unique] = {
                        isWeb: true,
                        startTime
                    }
                    continue;
                }
                day = day - 1;
                if (day < 0) day = 6;
                listRef[val.unique] = {
                    isWeb:false,
                    day,
                    updateTime: updateTime.join(':'),
                    startTime
                }
                dayDictArray[day].timeline.push({ ...val, updateTime: updateTime.join(":") });
            }
            // sort day dict.
            for (const dayDict of dayDictArray) {
                const arr = dayDict.timeline;
                const timeline = {};
                for (const val of arr) {
                    const { updateTime, ...newVal } = val;
                    if (updateTime in timeline) {
                        timeline[updateTime].push(newVal);
                    } else {
                        timeline[updateTime] = [newVal];
                    }
                }
                dayDict.timeline = Object.keys(timeline).map(key => ({
                    time: key,
                    list: timeline[key]
                })).sort((a, b) => a.time.localeCompare(b.time));
                // handle published and timer.
                if (dayDict.isToday) {
                    let hours = now.getHours();
                    if (hours < 6) {
                        hours += 24;
                    }
                    const minutes = now.getMinutes();
                    const nowMinutes = minutes + hours * 60;
                    let index = -1;
                    dayDict.timeline.some((obj, i) => {
                        const timeSplit = String(obj.time).split(":");
                        const objMinutes = Number(timeSplit[0]) * 60 + Number(timeSplit[1]);
                        if (nowMinutes < objMinutes) {
                            return true;
                        }
                        index = i;
                        obj.published = true;
                        return false;
                    })
                    if (index === -1) continue;
                    const obj = {
                        time: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
                        list: [],
                        isTimer: true
                    }
                    if (index === dayDict.timeline.length) {
                        dayDict.timeline.push(obj);
                    } else {
                        dayDict.timeline.splice(index + 1, 0, obj);
                    }
                }
            }
            // sort web array.
            webArray = webArray.sort((a, b) => a.startDate.localeCompare(b.startDate));
            // setup data.
            return { dayDictArray, webArray, nowDay, resultCount, listRef };
        }
    },
    getResults: {
        path: '/rss/v2/getOne.detail'
    },
    setOneSubsFin: {
        path: '/rss/subscribe/setFin',
        method: 'post'
    },
    getMatchers: {
        path: '/rss/getMatchers'
    },
    getRegexHistory: {
        path: '/rss/regex/history'
    },
    addRssRegex: {
        path: '/rss/regex/add',
        method: 'post'
    },
    getOneLinks: {
        path: '/rss/link/getMany'
    },
    addOneLink: {
        path: '/rss/link/addOne',
        method: 'post'
    },
    editOneLink: {
        path: '/rss/link/editOne',
        method: 'post'
    },
    delOneLink: {
        path: '/rss/link/delOne',
        method: 'post'
    },
    getOneCopyrights: {
        path: '/rss/copyright/getMany'
    },
    delOneCopyright: {
        path: '/rss/copyright/delOne',
        method: 'post'
    },
    addOneCopyright: {
        path: '/rss/copyright/addOne',
        method: 'post'
    },
    editOneCopyright: {
        path: '/rss/copyright/editOne',
        method: 'post'
    }
}