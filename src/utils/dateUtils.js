export const getNowDay = () => {
    let now = new Date();
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    return now.getDay();
}

export const getCurSeason = () => {
    let now = new Date();
    if (now.getHours() < 6) {
        now.setDate(now.getDate() - 1);
    }
    let month = now.getMonth() + 1;
    month = (Math.ceil(month / 3) - 1) * 3 + 1;
    return [now.getFullYear() + '', String(month).padStart(2, '0')];
}

export const pubDateFormat = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}