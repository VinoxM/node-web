const initDataDict = (nowDay) => {
    if (!nowDay) {
        nowDay = getNowDay();
    }
    return [
        { dayStr: '周一', timeline: [], isToday: nowDay === 1, day: 1 },
        { dayStr: '周二', timeline: [], isToday: nowDay === 2, day: 2 },
        { dayStr: '周三', timeline: [], isToday: nowDay === 3, day: 3 },
        { dayStr: '周四', timeline: [], isToday: nowDay === 4, day: 4 },
        { dayStr: '周五', timeline: [], isToday: nowDay === 5, day: 5 },
        { dayStr: '周六', timeline: [], isToday: nowDay === 6, day: 6 },
        { dayStr: '周日', timeline: [], isToday: nowDay === 0, day: 0 }
    ];
}

const getNowDay = () => {
    let now = new Date();
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    return now.getDay();
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
            const nowDay = getNowDay();
            let dayDictArray = initDataDict(nowDay);
            let webArray = [];
            const protocol = document.location.protocol;
            // group by day.
            for (const obj of list) {
                const { startTime, animeType } = obj;
                if (animeType !== 1) {
                    webArray.push(obj);
                    continue;
                }
                let date = new Date(startTime);
                let hours = date.getHours();
                let minutes = date.getMinutes();
                if (hours >= 0 && hours < 6) {
                    date.setDate(date.getDate() - 1);
                    hours += 24;
                }
                let day = date.getDay() - 1;
                if (day < 0) day = 6;
                const newObj = { ...obj, updateTime: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}` };
                dayDictArray[day].timeline.push(newObj);
            }
            // sort day dict.
            for (const dayDict of dayDictArray) {
                const arr = dayDict.timeline;
                const timeline = {};
                for (const val of arr) {
                    let cover = String(val.cover);
                    const protocolIndex = cover.indexOf('://');
                    if (protocolIndex > -1) {
                        cover = protocol + cover.substring(protocolIndex + 1);
                    }
                    const newVal = {
                        cover,
                        titleCN: val.name,
                        titleJP: val.nameJP,
                        epCounts: val.count,
                        latestEp: val.latestEp,
                        lastPub: val.lastPub,
                        hasNew: val.hasNew === 1,
                        isFin: val.fin === 'Y',
                        isShort: val.isShort === 1,
                        unique: val.unique
                    }
                    if (val.updateTime in timeline) {
                        timeline[val.updateTime].push(newVal);
                    } else {
                        timeline[val.updateTime] = [newVal];
                    }
                }
                dayDict.timeline = Object.keys(timeline).map(key => ({
                    time: key,
                    list: timeline[key]
                })).sort((a, b) => a.time.localeCompare(b.time));
                if (dayDict.isToday) {
                    const now = new Date();
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
            // setup data.
            return {dayDictArray, webArray, nowDay};
        }
    },
    getResults: {
        path: '/rss/v2/getOne.results'
    }
}