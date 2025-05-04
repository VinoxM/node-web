const episodeMatches = [
    /.*?\[([0-9]{1,4}(\.5)?)(v[0-3])?\].*/i,
    /.*?[-～] ([0-9]{1,4}(\.5)?)(v[0-3])? .*/i,
    /.*?第([0-9]{1,4}(\.5)?)(v[0-3])?(集|话)(v[0-3])?.*/i,
    /.*?【([0-9]{1,4}(\.5)?)(v[0-3])?】.*/i,
    /.*? ([0-9]{1,4}(\.5)?)(v[0-3])? .*/i,
    /.*?E([0-9]{1,4}(\.5)?)(v[0-3])? .*/i,
    /.*?[S[1-9]{1}E([0-9]{1,4}(\.5)?)(v[0-3])?].*/i
]

export const handleEpisode = (str) => {
    let result = '-';
    if (!str) return '-';
    let s = String(str);
    episodeMatches.some(match => {
        const exec = new RegExp(match).exec(s);
        if (exec !== null) {
            result = exec[1];
            return true;
        }
        return false;
    })
    return result;
}