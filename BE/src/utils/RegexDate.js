const regexDate = (value) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
        const [d, m, y] = value.split('-');
        return `${y}-${m}-${d}`;
    }
    throw new Error('Invalid date format');
}

module.exports = { regexDate }
