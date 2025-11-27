const FlightSearchRepository = require('../repositories/flightSearchRepository');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

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

        if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
            departureDate = datePart;
        } else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(datePart)) {
            const [d, m, y] = datePart.split('-');
            departureDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        } else {
            throw new Error('Invalid date format');
        }

        console.log('Departure date:', departureDate);
        // === 3. Parse passengers ===
        const [adultsStr = '1', childrenStr = '0', infantsStr = '0'] = (ps || '1.0.0').split('.');
        const adults = Math.max(1, parseInt(adultsStr, 10) || 1);
        const children = parseInt(childrenStr, 10) || 0;
        const infants = parseInt(infantsStr, 10) || 0;
        const totalPax = adults + children;

        // === 4. Normalize seat class ===
        const seatClassMap = {
            'ECONOMY': 'Economy',
            'BUSINESS': 'Business',
            'FIRST': 'First',
            'PREMIUM': 'Premium Economy',
            'PREMIUM_ECONOMY': 'Premium Economy'
        };
        const normalizedSeatClass = sc ? seatClassMap[sc.toUpperCase().replace(' ', '_')] || null : null;

        // === 5. Lấy dữ liệu từ DB ===
        const schedules = await FlightSearchRepository.fullSearch({
            depCode,
            arrCode,
            date: departureDate,
            ps: totalPax,
            seatClassCode: normalizedSeatClass
        });

        // // === 6. Format kết quả chuẩn OTA ===
        // const results = schedules
        //     .map(schedule => {
        //         try {
        //             const flight = schedule.flight;
        //             const airline = flight?.airline;
        //             const dep = flight?.departureAirport;
        //             const arr = flight?.arrivalAirport;
        //             const airplane = schedule.airplane;

        //             if (!flight || !airline || !dep || !arr) return null;

        //             const depTime = new Date(schedule.departure_time);
        //             const arrTime = new Date(schedule.arrival_time);
        //             if (isNaN(depTime) || isNaN(arrTime)) return null;

        //             // === Tính duration chính xác (xử lý qua đêm) ===
        //             let diffMin = Math.round((arrTime - depTime) / 60000);
        //             if (diffMin < 0) diffMin += 24 * 60;
        //             const durationH = Math.floor(diffMin / 60);
        //             const durationM = diffMin % 60;

        //             // === Tìm giá tốt nhất có đủ ghế ===
        //             let bestFare = null;
        //             let minPrice = Infinity;


        //             const pricePerPax = bestFare ? Math.round(minPrice) : null;
        //             const totalPrice = pricePerPax ? Math.round(pricePerPax * totalPax) : null;

        //             // === Ghế còn lại (tối đa hiển thị 9) ===
        //             const availableSeats = schedule.flightFares
        //                 .filter(f => f.seats_available > 0)
        //                 .map(f => f.seats_available);
        //             const seatsLeft = availableSeats.length > 0 ? Math.min(...availableSeats) : 0;
        //             const displaySeats = seatsLeft >= 9 ? 9 : seatsLeft;

        //             // === Format thời gian theo đúng timezone ===
        //             const format = (date, tz) => ({
        //                 time: date.toLocaleTimeString('en-GB', {
        //                     timeZone: tz || 'Asia/Ho_Chi_Minh',
        //                     hour: '2-digit',
        //                     minute: '2-digit'
        //                 }),
        //                 date: date.toLocaleDateString('en-CA', {
        //                     timeZone: tz || 'Asia/Ho_Chi_Minh'
        //                 })
        //             });

        //             const depFormatted = format(depTime, dep.timezone);
        //             const arrFormatted = format(arrTime, arr.timezone);

        //             return {
        //                 id: schedule.id,
        //                 flight_number: `${airline.iata_code}${flight.flight_number}`,
        //                 airline: {
        //                     name: airline.name,
        //                     code: airline.iata_code,
        //                     logo: airline.logo_url || null
        //                 },
        //                 departure: {
        //                     code: dep.iata_code,
        //                     name: dep.name,
        //                     city: dep.city,
        //                     time: depFormatted.time,
        //                     date: depFormatted.date,
        //                     timezone: dep.timezone || 'Asia/Ho_Chi_Minh'
        //                 },
        //                 arrival: {
        //                     code: arr.iata_code,
        //                     name: arr.name,
        //                     city: arr.city,
        //                     time: arrFormatted.time,
        //                     date: arrFormatted.date,        // đúng ngày đến dù qua đêm hay khác múi giờ
        //                     timezone: arr.timezone || 'Asia/Ho_Chi_Minh'
        //                 },
        //                 duration: `${durationH}h${durationM > 0 ? `${durationM}m` : ''}`,
        //                 aircraft: airplane?.model || flight.aircraft_type || 'Airbus A321',
        //                 stops: 0,
        //                 seats_available: displaySeats,
        //                 price: {
        //                     currency: 'VND',
        //                     per_adult: pricePerPax,
        //                     total: totalPrice,
        //                     class: bestFare?.seatClass?.class_name || 'Economy'
        //                 },
        //                 fares: schedule.flightFares.map(f => ({
        //                     class_code: f.seatClass?.class_code || 'ECO',
        //                     class_name: f.seatClass?.class_name || 'Economy',
        //                     price: Math.round(this.#calculateFareTotal(f)),
        //                     seats_available: f.seats_available
        //                 }))
        //             };
        //         } catch (err) {
        //             console.error('Format flight error:', err);
        //             return null;
        //         }
        //     })
        //     .filter(Boolean);
        return schedules;
    }
}

module.exports = FlightSearchService;