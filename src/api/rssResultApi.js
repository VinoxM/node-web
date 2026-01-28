import { pubDateFormat } from '@/utils/dateUtils';
import { handleEpisode } from '@/utils/rssUtils';

const apis = {
    getOneSubsResults: {
        path: '/rss/v2/getOne.results',
        method: 'get',
        headers: {
            secret: 'mAou5820.subscribe'
        }
    },
    getSubsTestResults: {
        path: '/rss/subscribe/subTest',
        handle(data) {
            return Array.from(data).map(o => {
                o.pubDate = pubDateFormat(o.pubDate);
                o.episode = handleEpisode(o.title);
                return o;
            })
        }
    },
    updateOneResultHide: {
        path: '/rss/result/hideOne'
    },
    editOneResult: {
        path: '/rss/result/editOne'
    },
    addOneResult: {
        path: '/rss/result/addOne'
    },
    delOneResult: {
        path: '/rss/result/delOne'
    },
    delManyResults: {
        path: '/rss/result/delMany'
    },
    getEpisodeMatchers: {
        path: '/rss/result/getEpisodeMatchers',
        method: 'get',
        ignoreError: true,
        handle(data) {
            localStorage.setItem('episodeMatchers', JSON.stringify(data))
            return data
        }
    }
}

const defaultProp = {
    method: 'post',
    label: 'rssResult'
}

Object.keys(apis).forEach(key => {
    apis[key] = {
        ...defaultProp,
        ...apis[key]
    }
})

export default apis;