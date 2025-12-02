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
        const diff = (now - new Date(date)) / 1000; // seconds

        if (diff < 60) return "vừa xong";
        if (diff < 3600) return Math.floor(diff / 60) + " phút trước";
        if (diff < 86400) return Math.floor(diff / 3600) + " giờ trước";
        if (diff < 2592000) return Math.floor(diff / 86400) + " ngày trước";

        return new Date(date).toLocaleDateString("vi-VN");
    },

    toString(value) {
        return value ? value.toString() : "";
    },
};
