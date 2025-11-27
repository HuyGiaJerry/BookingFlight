const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc)
dayjs.extend(timezone)

const formatDatetime = (datetime, timezone) => {

    if (!datetime) throw new Error('Invalid datetime')
    if (!timezone) throw new Error('Invalid timezone')

    const d = dayjs.utc(datetime).tz(timezone)

    return {
        date: {
            year: d.format('YYYY'),
            month: d.format('MM'),
            day: d.format('DD')
        },
        time: {
            hour: d.format('HH'),
            minute: d.format('mm')
        }
    }
}

module.exports = { formatDatetime }
