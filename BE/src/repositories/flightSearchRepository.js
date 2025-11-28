const { Op, Sequelize, where } = require('sequelize');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { formatDatetime } = require('../utils/formatDatetime')
const { formatDuration, formatHoursOnly } = require('../utils/formatDuration')

const {
    FlightSchedule, Flight, Airline, Airport, Airplane, FlightFare, SeatClass
} = require('../models');

const CrudRepository = require('./crud-repository');

class FlightSearchRepository extends CrudRepository {
    static async fullSearch({ depCode, arrCode, date, ps, seatClassCode }) {
        dayjs.extend(utc)
        dayjs.extend(timezone)

        // lấy timezone của sân bay đi
        const depAiport = await Airport.findOne({ where: { iata_code: depCode }, attributes: ['iata_code', 'timezone'] })

        if (!depAiport) throw new Error('Invalid departure airport code')
        // tính start/end UTC theo ngày local của sân bay đi
        const startOfDayUTC = dayjs.tz(`${date} 00:00:00`, depAiport.timezone).utc().toDate()
        const endOfDayUTC = dayjs.tz(`${date} 23:59:59`, depAiport.timezone).utc().toDate()

        console.log('Start of day UTC:', startOfDayUTC)
        console.log('End of day UTC:', endOfDayUTC)
        // query db
        const result = await FlightSchedule.findAll({
            attributes: ['id', 'departure_time', 'arrival_time', 'status'],
            include: [
                {
                    model: Flight,
                    as: 'flight',
                    required: true,
                    include: [
                        { model: Airline, as: 'airline', attributes: ['id', 'name', 'iata_code', 'logo_url'] },
                        { model: Airport, as: 'departureAirport', where: { iata_code: depCode }, required: true, attributes: ['name', 'iata_code', 'city', 'timezone'] },
                        { model: Airport, as: 'arrivalAirport', where: { iata_code: arrCode }, required: true, attributes: ['name', 'iata_code', 'city', 'timezone'] }
                    ],
                    attributes: ['flight_number', 'duration_minutes']
                },
                { model: Airplane, as: 'airplane', attributes: ['registration_number', 'model', 'total_seats'] },
                {
                    model: FlightFare,
                    as: 'flightFares',
                    required: true,
                    attributes: ['base_price', 'tax', 'service_fee', 'seats_available'],
                    where: {
                        seats_available: { [Op.gte]: ps },
                        status: 'available'
                    },
                    include: seatClassCode ? [
                        {
                            model: SeatClass,
                            as: 'seatClass',
                            where: { class_name: seatClassCode },
                            attributes: ['class_name', 'class_code']
                        }
                    ] : [],
                }
            ],
            where: {
                departure_time: { [Op.between]: [startOfDayUTC, endOfDayUTC] },
                status: { [Op.in]: ['scheduled', 'active'] }
            },
            order: [['departure_time', 'ASC']]
        });

        // convert time utc sang local của từng sân bay đi và sân bay đến

        const formattedResult = result.map(schedule => {
            const depTZ = schedule.flight.departureAirport.timezone;
            const arrTZ = schedule.flight.arrivalAirport.timezone;
            const departure = formatDatetime(schedule.departure_time, depTZ)
            const arrival = formatDatetime(schedule.arrival_time, arrTZ)
            console.log("Raw schedule.departure_time:", schedule.departure_time);
            console.log("converted:", dayjs.utc("2025-11-16T18:00:00.000Z").tz("Asia/Ho_Chi_Minh").format());

            console.log('depature: ', departure)

            const fare = schedule.flightFares[0]
            const base = Number(fare.base_price)
            const tax = Number(fare.tax)
            const service_fee = Number(fare.service_fee)

            const adultPrice = base + tax + service_fee
            const childPrice = adultPrice * 0.75
            const infantPrice = base * 0.1 + service_fee



            return {
                id: schedule.id,
                duration: formatDuration(schedule.flight.duration_minutes),
                flight: schedule.flight,
                airplane: schedule.airplane,
                flightFares: schedule.flightFares,
                price: {
                    adult: adultPrice,
                    child: childPrice,
                    infant: infantPrice
                },

                pricePerson: adultPrice,

                departureDate: departure.date,
                departureTime: departure.time,

                arrivalDate: arrival.date,
                arrivalTime: arrival.time,
            }
        })
        if (!formattedResult.length) throw new Error('No flights found')
        // result filter airline dynamic
        const airlineData = {}

        formattedResult.forEach(flight => {
            const airline = flight.flight.airline
            const code = airline.iata_code
            if (!airlineData[code]) {
                airlineData[code] = {
                    airlineId: airline.id,
                    name: airline.name,
                    code: airline.iata_code,
                    logo: airline.logo_url,
                    count: 1,
                    minPrice: flight.pricePerson,
                }
            }
            else {
                airlineData[code].count++
                if (flight.pricePerson < airlineData[code].minPrice) {
                    airlineData[code].minPrice = flight.pricePerson
                }
            }
        })

        // result duration min
        const durations = result.map(s => s.flight.duration_minutes)

        const minDuration = Math.min(...durations)
        const maxDuration = Math.max(...durations)

        const roundedMax = Math.ceil(maxDuration / 60) * 60

        const durationRange = {
            minDuration: formatDuration(minDuration),
            maxDuration: formatHoursOnly(roundedMax)
        }

        // result min price + duration tương ứng

        const priceFlights = formattedResult.map(f => {
            const fare = f.flightFares[0]

            const base = Number(fare.base_price)
            const tax = Number(fare.tax)
            const serviceFee = Number(fare.service_fee)

            const pricePerson = base + tax + serviceFee

            return {
                ...f,
                pricePerson
            }
        })

        const allPrices = priceFlights.map(f => f.pricePerson)
        const maxPrice = Math.max(...allPrices)


        const minPrice = Math.min(...allPrices)

        const minPriceFlight = priceFlights.filter(f => f.pricePerson === minPrice)

        // chọn flight có duration min
        const bestFlight = minPriceFlight.reduce((a, b) => a.flight.duration_minutes < b.flight.duration_minutes ? a : b)

        const durationMin = formatDuration(bestFlight.flight.duration_minutes)

        console.log('Result: ', formattedResult);
        return {
            flights: formattedResult,
            airlineData: airlineData,
            durationRange,
            minPrice,
            maxPrice,
            durationMin
        };
    }
}

module.exports = FlightSearchRepository;