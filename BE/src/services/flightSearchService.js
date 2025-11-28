const FlightSearchRepository = require('../repositories/flightSearchRepository');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { regexDate } = require('../utils/RegexDate');
const { VaildPassenger } = require('../utils/VaildPassenger')
const { normalizeSeatClass } = require('../utils/normalizeSeatClass')

dayjs.extend(utc)
dayjs.extend(timezone)
class FlightSearchService {
    // Hàm helper tính tổng giá 1 hành khách (rất quan trọng!)
    static #calculateFareTotal(fare) {
        const base = parseFloat(fare.base_price) || 0;
        const tax = parseFloat(fare.tax) || 0;
        const service = parseFloat(fare.service_fee) || 0;
        return base + tax + service;
    }

    static async fullSearch(params) {
        const { ap, dt, ps, sc } = params;

        // === 1. Parse airport pair ===
        if (!ap || !ap.includes('.')) throw new Error('Invalid airport pair format');
        const [depCode, arrCode] = ap.split('.').map(s => s.trim().toUpperCase());

        // === 2. Parse date ===
        if (!dt) throw new Error('Departure date required');
        const datePart = dt.split('.')[0];

        let departureDate;

        departureDate = regexDate(datePart)

        console.log('Departure date:', departureDate);
        // === 3. Parse passengers ===
        const { adults, children, infants } = VaildPassenger(ps)
        const totalPax = adults + children;

        // === 4. Normalize seat class ===
        const normalizedSeatClass = normalizeSeatClass(sc)
        // === 5. Lấy dữ liệu từ DB ===
        const schedules = await FlightSearchRepository.fullSearch({
            depCode,
            arrCode,
            date: departureDate,
            ps: totalPax,
            seatClassCode: normalizedSeatClass
        });
        return schedules;
    }
    static async RoundTripSearch(params) {
        const { ap, dt, ps, sc } = params;

        // Parse departure airport
        if (!ap || !ap.includes('.')) throw new Error('Invalid airport format')

        const [depCode, arrCode] = ap.split('.').map(s => s.trim().toUpperCase());

        // Parse departure date and return date
        if (!dt || !dt.includes('.')) throw new Error('Invalid date format')

        const [departurePart, returnPart] = dt.split('.').map(s => s.trim())

        const departureDate = regexDate(departurePart)
        const returnDate = regexDate(returnPart)

        console.log('Servie format departureDate: ', departureDate)
        console.log('Servie format returnDate: ', returnDate)

        // Parse passengers

        const { adults, children, infants } = VaildPassenger(ps)

        const totalPax = adults + children;

        console.log('Adults:', adults)
        console.log('Children:', children)
        console.log('Infants:', infants)

        // Parse seat class

        const normalizedSeatClass = normalizeSeatClass(sc)

        console.log('Normalized seat class:', normalizedSeatClass)

        // get data Database

        const outbound = await FlightSearchRepository.fullSearch({
            depCode,
            arrCode,
            date: departureDate,
            ps: totalPax,
            seatClassCode: normalizedSeatClass
        });

        console.log('Outbound:', outbound)

        const inbound = await FlightSearchRepository.fullSearch({
            depCode: arrCode,
            arrCode: depCode,
            date: returnDate,
            ps: totalPax,
            seatClassCode: normalizedSeatClass
        });

        console.log('Inbound:', inbound)

        if (!outbound?.flights?.length || !inbound?.flights?.length) throw new Error('No flights found')

        return {
            outbound,
            inbound
        }


    }
}

module.exports = FlightSearchService;