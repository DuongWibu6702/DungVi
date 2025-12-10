module.exports = {
    truncate(text, len) {
        if (!text) return "";
        return text.length > len ? text.substring(0, len) + "..." : text;
    },

    plus(a, b) { return a + b; },
    minus(a, b) { return a - b; },

    eq(a, b) { return a === b; },
    lt(a, b) { return a < b; },
    gt(a, b) { return a > b; },

    or(a, b) { return a || b; },
    and(a, b) { return a && b; },
    not(a) { return !a; },

    inc(v) { return v + 1; },

    range(start, end) {
        let arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    },

    queryString(query) {
        let params = [];
        for (let key in query) {
            if (key !== "page" && query[key]) {
                params.push(`${key}=${encodeURIComponent(query[key])}`);
            }
        }
        return params.length > 0 ? "&" + params.join("&") : "";
    },

    selected(current, value) {
        return current === value ? 'selected="selected"' : "";
    },

    timeAgo(date) {
        const now = new Date();
        const diff = (now - new Date(date)) / 1000;

        if (diff < 60) return "vừa xong";
        if (diff < 3600) return Math.floor(diff / 60) + " phút trước";
        if (diff < 86400) return Math.floor(diff / 3600) + " giờ trước";
        if (diff < 2592000) return Math.floor(diff / 86400) + " ngày trước";

        return new Date(date).toLocaleDateString("vi-VN");
    },

    toString(value) {
        return value ? value.toString() : "";
    },

    chunk(arr, size) {
        if (!Array.isArray(arr)) return [];
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    },

    formatDay(date) {
        return new Date(date).getDate();
    },

    formatMonthShort(date) {
        const m = new Date(date).getMonth() + 1;
        return `Th${m}`;
    },

    json(context) {
        return JSON.stringify(context);
    },

    formatDateTimeVN(date) {
        if (!date) return "";
        const d = new Date(date);
        const hh = String(d.getHours()).padStart(2, "0");
        const mm = String(d.getMinutes()).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const mo = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        return `${hh}:${mm} ${dd}/${mo}/${yyyy}`;
    }
};
