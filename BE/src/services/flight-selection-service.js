const SessionManagerService = require('./session-manager-service');
const crypto = require('crypto');
const AppError = require('../utils/errors/app-error');
const { Flight, FlightSchedule, Airline, Airport } = require('../models'); // chỉnh theo path models của bạn

class FlightSelectionService {
    // 🔹 Helper: build flight summary từ flight_schedule_id (hoặc id bạn đang dùng)
    async buildFlightSummary(flightScheduleId) {
        if (!flightScheduleId) return null;

        const schedule = await FlightSchedule.findByPk(flightScheduleId, {
            include: [
                {
                    model: Flight,
                    as: 'flight',
                    include: [
                        { model: Airline, as: 'airline' },
                        { model: Airport, as: 'departureAirport' },
                        { model: Airport, as: 'arrivalAirport' }
                    ]
                }
            ]
        });

        if (!schedule) {
            throw new AppError(
                `FlightSchedule not found for id ${flightScheduleId}`,
                404
            );
        }

        const flight = schedule.flight;
        const airline = flight.airline;
        const departureAirport = flight.departureAirport;
        const arrivalAirport = flight.arrivalAirport;

        return {
            flight_schedule_id: schedule.id,
            flight_id: flight.id,
            airline_name: airline?.name,
            airline_code: airline?.iata_code,
            airline_logo: airline?.logo_url,
            flight_number: flight.flight_number,
            departure_airport_code: departureAirport?.iata_code,
            departure_airport_name: departureAirport?.name,
            arrival_airport_code: arrivalAirport?.iata_code,
            arrival_airport_name: arrivalAirport?.name,
            departure_time: schedule.departure_time,
            arrival_time: schedule.arrival_time,
            duration_minutes: flight.duration_minutes
        };
    }

    /**
     * 🛫 STEP 1: User select flights → CREATE BOOKING SESSION
     */
    async createFlightSelectionSession(payload) {
        try {
            const {
                outbound_flight_id,
                return_flight_id = null,
                passengers = [],
                seat_class_name,
                service_selection = [],
                fare_price = null,
                account_id = null
            } = payload;

            console.log('🛫 Creating flight selection session...');

            if (!outbound_flight_id || !seat_class_name) {
                throw new AppError(
                    'outbound_flight_id and seat_class_name are required',
                    400
                );
            }

            // OPTIONAL: chuẩn hóa type passenger (nếu bạn muốn ép về 3 giá trị này)
            const normalizedPassengers = passengers.map(p => ({
                ...p,
                type: (p.type || '').toUpperCase() // ADULT / CHILDREN / INFANT
            }));

            const outbound_flight_summary = await this.buildFlightSummary(
                outbound_flight_id
            );
            const return_flight_summary = return_flight_id
                ? await this.buildFlightSummary(return_flight_id)
                : null;

            const sessionId = crypto.randomUUID();

            const session =
                await SessionManagerService.getOrCreateUnifiedSession(
                    sessionId,
                    account_id
                );

            const sessionData = {
                flights: {
                    outbound_flight_id,
                    return_flight_id,
                    seat_class_name, // ✅ lưu tên class
                    trip_type: return_flight_id ? 'round_trip' : 'one_way',
                    outbound_flight_summary,
                    return_flight_summary
                },
                passengers: normalizedPassengers,   // ✅ dùng type ADULT/CHILDREN/INFANT
                passenger_details: [],
                seat_selections: [],
                service_selection,
                fare_price
            };

            const expireAt = new Date(Date.now() + 30 * 60000); // 30 phút

            const transaction = await session.sequelize.transaction();

            try {
                await session.sequelize.query(
                    `
                    UPDATE BookingSessions
                    SET session_data = :sessionData,
                        expire_at   = :expireAt,
                        updatedAt   = NOW()
                    WHERE id = :sessionId
                    `,
                    {
                        replacements: {
                            sessionData: JSON.stringify(sessionData),
                            expireAt,
                            sessionId
                        },
                        transaction
                    }
                );

                await transaction.commit();
            } catch (updateError) {
                await transaction.rollback();
                throw updateError;
            }

            await session.reload();

            return {
                booking_session_id: sessionId,
                session_data: sessionData,
                expires_at: expireAt.toISOString()
            };
        } catch (error) {
            console.error('❌ Error creating flight selection session:', error);
            throw error;
        }
    }
}

module.exports = FlightSelectionService;