const episodeMatches = [
    /.*?\[([0-9]{1,4}(\.5)?)(v[0-3])?\].*/i,
    /.*?[-～] ([0-9]{1,4}(\.5)?)(v[0-3])? .*/i,
    /.*?第([0-9]{1,4}(\.5)?)(v[0-3])?(集|话)(v[0-3])?.*/i,
    /.*?【([0-9]{1,4}(\.5)?)(v[0-3])?】.*/i,
    /.*? ([0-9]{1,4}(\.5)?)(v[0-3])? .*/i,
    /.*?E([0-9]{1,4}(\.5)?)(v[0-3])? .*/i,
    /.*?[S[1-9]{1}E([0-9]{1,4}(\.5)?)(v[0-3])?].*/i,
    /.*?★([0-9]{1,4}(\.5)?)(v[0-3])?★.*/i
]

export const handleEpisode = (str, episodeMatchers_ = episodeMatches) => {
    let result = '-';
    if (!str) return '-';
    let s = String(str);
    episodeMatchers_.some(match => {
        const exec = new RegExp(match, 'i').exec(s);
        if (exec !== null) {
            result = exec[1];
            return true;
        }
        return false;
    })
    return result;
}

export function getAnimeName(file) {
    let name = ''
    const regex = [
        /\s-\s\d\d/,
        /\[\d\d]/,
        /\[SP\d\d]/i,
        /\[\d\dv2]/i,
        /\[\d\dend]/i,
        /\[\d\d-\d\d]/,
        /\s-\sS\d\d/,
        /\s\d\d\s\[/i
    ]
    let array = null;
    if (regex.some(reg => {
        array = file.match(reg)
        return array !== null
    })) {
        // 截取字幕组名 + 番剧名
        name = file.substring(0, array.index)
        /**
         * 仅有番剧名
         * 例: [Tensei Shitara Slime Datta Ken]
         * -> Tensei Shitara Slime Datta Ken
         */
        if (/^\[(?!.*\[|]).*]$/.test(name)) {
            name = name.substring(1, name.length - 1)
        } else {
            /**
             * 去除番剧名外中括号
             * 例: [KTXP][Hokkaido_Gals_Are_Super_Adorable!]
             * -> [KTXP] Hokkaido_Gals_Are_Super_Adorable!
             */
            const r = name.match(/^\[.*?]\[(.*?)]/)
            if (r && r[1]) {
                name = name.replace(`[${r[1]}]`, ` ${r[1]}`)
            }
        }
    } else {
        name = file.replace(/(\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4))$/i, "")
    }
    name = name.trimEnd()
    name = name.replaceAll(/[\/:"*<>?\\|]/g, '')
    /*} else {
        const repReg = [
            /\[1080p]/i,
            /\[baha]/i,
            /\[bilibili]/i,
            /\[web-dl]/i,
            /\[cht]/i,
            /\[chs]/i,
        ]
    }*/
    return name
}