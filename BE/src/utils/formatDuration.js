function formatDuration(minutes) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return `${h}h ${m}m`
}

function formatHoursOnly(minutes) {
    const h = Math.floor(minutes / 60)
    return `${h}h`
}

module.exports = { formatDuration, formatHoursOnly }