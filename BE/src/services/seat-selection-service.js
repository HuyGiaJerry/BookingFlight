const { BookingSession, FlightSeat } = require('../models');
const { SeatRepository } = require('../repositories');
const SeatService = require('./seat-service');
const AppError = require('../utils/errors/app-error');
const crypto = require('crypto');  // ✅ Use built-in crypto instead of uuid
const SessionManagerService = require('./session-manager-service');

class SeatSelectionService {
    constructor() {
        this.seatRepository = new SeatRepository();
        this.seatService = new SeatService();
    }

    /**
     * 🎯 REAL-TIME: Select individual seat (1 click = 1 API call)
     * Frontend gọi mỗi khi user click 1 ghế
     */
    async selectIndividualSeat(payload) {
        try {
            const { booking_session_id, flight_schedule_id, passenger_index, flight_seat_id, account_id = null } = payload;

            if (!booking_session_id) {
                throw new AppError('booking_session_id is required. Please start from flight selection.', 400);
            }

            console.log('🎯 === SEAT SELECTION START ===');
            console.log('Request payload:', { booking_session_id, flight_schedule_id, passenger_index, flight_seat_id });

            // ✅ GET session
            const session = await SessionManagerService.getUnifiedSession(booking_session_id);

            if (!session) {
                throw new AppError('Session not found.', 404);
            }

            // ✅ Validate session chứa flights 
            const sessionData = session.session_data || {};
            if (!sessionData.flights) {
                throw new AppError('Invalid session.', 400);
            }

            // ✅ Validate seat availability
            const availability = await this.seatRepository.checkSeatAvailability([flight_seat_id]);
            if (!availability[0]?.is_available) {
                throw new AppError('Seat is not available', 400);
            }

            // ✅ Xóa , Cập nhật lại cái status,các trường khác... của ghế cũ (nếu có)
            await this.releaseSeatForPassenger(session.id, flight_schedule_id, passenger_index);

            // ✅ Block ghế mới chọn 15p 
            const blocked = await this.seatRepository.blockSeats([flight_seat_id], session.id, 15);
            if (blocked !== 1) {
                throw new AppError('Unable to block seat', 500);
            }

            // ✅ Cập nhật sesion_data với ghế mới
            const updatedSession = await this.updatePassengerSeatInSession(session, flight_schedule_id, passenger_index, flight_seat_id);

            // ✅ Tính toán lại pricing
            const flightPricing = await this.recalculateFlightPricing(updatedSession, flight_schedule_id);
            const sessionTotals = await SessionManagerService.calculateUnifiedTotal(updatedSession);

            // ✅ Get seat details
            const seatDetails = await this.getSeatDetails(flight_seat_id, flight_schedule_id);

            return {
                booking_session_id: session.id,
                flight_schedule_id,
                passenger_index,
                seat_selected: {
                    flight_seat_id,
                    seat_number: seatDetails.seat_number,
                    seat_adjustment: seatDetails.adjustment,
                    features: seatDetails.features
                },
                flight_seat_subtotal: flightPricing.total_seat_adjustment,
                session_totals: sessionTotals,
                expires_at: updatedSession.expire_at
            };

        } catch (error) {
            console.error('❌ Error selecting individual seat:', error);
            throw error;
        }
    }

    /**
     * 🗑️ Remove seat for specific passenger
     */
    async removeSeatForPassenger(payload) {
        try {
            const {
                booking_session_id,
                flight_schedule_id,
                passenger_index
            } = payload;

            const session = await BookingSession.findByPk(booking_session_id);
            if (!session) {
                throw new AppError('Booking session not found', 404);
            }

            // ✅ Release ghế về available
            await this.releaseSeatForPassenger(booking_session_id, flight_schedule_id, passenger_index);

            // ✅ Remove từ session data
            await this.removePassengerSeatFromSession(session, flight_schedule_id, passenger_index);

            // ✅ Recalculate pricing
            const flightPricing = await this.recalculateFlightPricing(session, flight_schedule_id);
            const sessionTotals = await SessionManagerService.calculateUnifiedTotal(session);

            return {
                booking_session_id,
                flight_schedule_id,
                passenger_index,
                seat_removed: true,
                flight_seat_subtotal: flightPricing.total_seat_adjustment,
                session_totals: sessionTotals,
                expires_at: session.expire_at
            };

        } catch (error) {
            console.error('❌ Error removing seat for passenger:', error);
            throw error;
        }
    }

    /**
     * 📊 Get current session selections (for page reload)
     */
    async getSessionSeatSelections(sessionId) {
        try {
            const session = await BookingSession.findByPk(sessionId);

            if (!session) {
                throw new AppError('Booking session not found', 404);
            }

            if (session.expire_at < new Date()) {
                await this.releaseAllSessionSeats(sessionId);
                throw new AppError('Session expired', 410);
            }

            const sessionData = session.session_data || {};
            const seatSelections = sessionData.seat_selections || {};

            // Format response
            const flightSelections = {};
            for (const [flightId, selections] of Object.entries(seatSelections)) {
                flightSelections[flightId] = {
                    flight_schedule_id: parseInt(flightId),
                    passenger_selections: selections.passenger_selections,
                    seat_pricing: selections.seat_pricing,
                    selected_at: selections.selected_at
                };
            }

            return {
                booking_session_id: sessionId,
                flight_selections: flightSelections,
                total_amount: session.total_estimate,
                expires_at: session.expire_at
            };

        } catch (error) {
            console.error('Error getting session seat selections:', error);
            throw error;
        }
    }

    /**
     * 🔄 Extend session expiry
     */
    async extendSession(sessionId, minutes = 15) {
        try {
            const session = await BookingSession.findByPk(sessionId);

            if (!session) {
                throw new AppError('Booking session not found', 404);
            }

            const newExpiry = new Date(Date.now() + minutes * 60000);

            await session.update({
                expire_at: newExpiry
            });

            return {
                session_id: sessionId,
                new_expiry: newExpiry,
                extended_minutes: minutes
            };

        } catch (error) {
            console.error('Error extending session:', error);
            throw error;
        }
    }

    /**
     * ❌ Release all session seats
     */
    async releaseAllSessionSeats(sessionId) {
        try {
            const releasedCount = await this.seatRepository.releaseBlockedSeats(sessionId);
            await BookingSession.destroy({ where: { id: sessionId } });
            return releasedCount;
        } catch (error) {
            console.error('Error releasing all session seats:', error);
            throw error;
        }
    }

    // ===== HELPER METHODS =====

    async updatePassengerSeatInSession(session, flightScheduleId, passengerIndex, flightSeatId) {
        try {
            const currentData = session.session_data || {};

            if (!currentData.seat_selections) {
                currentData.seat_selections = {};
            }

            if (!currentData.seat_selections[flightScheduleId]) {
                currentData.seat_selections[flightScheduleId] = {
                    passenger_selections: [],
                    seat_pricing: { seats: [], total_seat_adjustment: 0 },
                    selected_at: new Date(),
                    type: 'seat_selection'
                };
            }

            const flightSelection = currentData.seat_selections[flightScheduleId];
            const existingIndex = flightSelection.passenger_selections.findIndex(
                p => p.passenger_index === passengerIndex
            );

            const newSelection = {
                passenger_index: passengerIndex,
                flight_seat_id: flightSeatId,
                selected_at: new Date().toISOString()
            };

            if (existingIndex >= 0) {
                flightSelection.passenger_selections[existingIndex] = newSelection;
            } else {
                flightSelection.passenger_selections.push(newSelection);
            }

            // ✅ RAW SQL UPDATE
            const jsonData = JSON.stringify(currentData);
            const expireAt = new Date(Date.now() + 15 * 60000);
            
            await session.sequelize.query(`
                UPDATE BookingSessions 
                SET session_data = :sessionData, 
                    expire_at = :expireAt,
                    updatedAt = NOW()
                WHERE id = :sessionId
            `, {
                replacements: {
                    sessionData: jsonData,
                    expireAt: expireAt,
                    sessionId: session.id
                }
            });

            await session.reload();
            return session;

        } catch (error) {
            console.error('❌ Raw update failed:', error);
            throw error;
        }
    }

    async removePassengerSeatFromSession(session, flightScheduleId, passengerIndex) {
        try {
            const sessionData = session.session_data || {};
            const flightSelection = sessionData.seat_selections?.[flightScheduleId];

            if (!flightSelection) {
                return;
            }

            // ✅ Remove passenger từ array
            flightSelection.passenger_selections = flightSelection.passenger_selections.filter(
                p => p.passenger_index !== passengerIndex
            );

            // ✅ Reset pricing nếu không còn passenger
            if (flightSelection.passenger_selections.length === 0) {
                flightSelection.seat_pricing = { seats: [], total_seat_adjustment: 0 };
            }

            // ✅ RAW SQL UPDATE
            const jsonData = JSON.stringify(sessionData);

            await session.sequelize.query(`
                UPDATE BookingSessions 
                SET session_data = :sessionData,
                    updatedAt = NOW()
                WHERE id = :sessionId
            `, {
                replacements: {
                    sessionData: jsonData,
                    sessionId: session.id
                }
            });

        } catch (error) {
            console.error('❌ Error removing passenger from session:', error);
            throw error;
        }
    }

    async releaseSeatForPassenger(sessionId, flightScheduleId, passengerIndex) {
        try {
            const session = await BookingSession.findByPk(sessionId);
            if (!session) {
                return;
            }

            const sessionData = session.session_data || {};
            const flightSelection = sessionData.seat_selections?.[flightScheduleId];

            if (!flightSelection) {
                return;
            }

            const existingSelection = flightSelection.passenger_selections.find(
                p => p.passenger_index === passengerIndex
            );

            if (!existingSelection?.flight_seat_id) {
                return;
            }

            // ✅ Release ghế về available
            const [updatedRows] = await FlightSeat.update({
                status: 'available',
                blocked_session_id: null,
                blocked_at: null,
                blocked_until: null
            }, {
                where: {
                    id: existingSelection.flight_seat_id,
                    blocked_session_id: sessionId
                }
            });

            return updatedRows;

        } catch (error) {
            console.error('Error releasing seat for passenger:', error);
            throw error;
        }
    }

    async recalculateFlightPricing(session, flightScheduleId) {
        try {
            const sessionData = session.session_data || {};
            const flightSelection = sessionData.seat_selections?.[flightScheduleId];

            if (!flightSelection || !flightSelection.passenger_selections.length) {
                return { seats: [], total_seat_adjustment: 0 };
            }

            const currentSelections = flightSelection.passenger_selections.filter(p => p.flight_seat_id);

            if (currentSelections.length === 0) {
                return { seats: [], total_seat_adjustment: 0 };
            }

            // ✅ Calculate pricing
            const newPricing = await this.calculateSeatPricing(flightScheduleId, currentSelections);

            // ✅ Update pricing trong session
            flightSelection.seat_pricing = {
                seats: newPricing.seats,
                total_seat_adjustment: newPricing.total_seat_adjustment,
                currency: newPricing.currency,
                updated_at: new Date().toISOString()
            };

            // ✅ Update session data
            const jsonData = JSON.stringify(sessionData);

            await session.sequelize.query(`
                UPDATE BookingSessions 
                SET session_data = :sessionData,
                    updatedAt = NOW()
                WHERE id = :sessionId
            `, {
                replacements: {
                    sessionData: jsonData,
                    sessionId: session.id
                }
            });

            return flightSelection.seat_pricing;

        } catch (error) {
            console.error('❌ Error recalculating flight pricing:', error);
            throw error;
        }
    }

    async calculateSeatPricing(flightScheduleId, passengerSelections) {
        try {
            const seatMatrix = await this.seatService.getTravelokaSeatMatrix(flightScheduleId);

            let totalSeatAdjustment = 0;
            const seatDetails = [];

            passengerSelections.forEach(selection => {
                const seatId = selection.flight_seat_id;

                const seatNumber = Object.keys(seatMatrix.seatIds).find(
                    seatNum => seatMatrix.seatIds[seatNum] === seatId
                );

                const pricing = seatMatrix.seatPricing[seatNumber];
                const seatAdjustment = pricing.adjustment || 0;
                totalSeatAdjustment += seatAdjustment;

                seatDetails.push({
                    passenger_index: selection.passenger_index,
                    flight_seat_id: seatId,
                    seat_number: seatNumber,
                    seat_adjustment: seatAdjustment,
                    features: pricing.features
                });
            });

            return {
                flight_schedule_id: flightScheduleId,
                seats: seatDetails,
                total_seat_adjustment: totalSeatAdjustment,
                currency: 'VND'
            };

        } catch (error) {
            console.error('Error calculating seat pricing:', error);
            throw error;
        }
    }

    async getSeatDetails(flightSeatId, flightScheduleId) {
        try {
            const seatMatrix = await this.seatService.getTravelokaSeatMatrix(flightScheduleId);

            const seatNumber = Object.keys(seatMatrix.seatIds).find(
                seatNum => seatMatrix.seatIds[seatNum] === flightSeatId
            );

            if (!seatNumber) {
                throw new AppError('Seat not found', 404);
            }

            const pricing = seatMatrix.seatPricing[seatNumber];
            return {
                seat_number: seatNumber,
                adjustment: pricing.adjustment,
                features: pricing.features
            };

        } catch (error) {
            console.error('Error getting seat details:', error);
            throw error;
        }
    }

    /**
     * ✅ Complete seat selection process
     */
    async completeSeatSelection(sessionId, passengerCount) {
        try {
            const session = await BookingSession.findByPk(sessionId);

            if (!session) {
                throw new AppError('Booking session not found', 404);
            }

            if (session.expire_at < new Date()) {
                throw new AppError('Session expired', 410);
            }

            if (!passengerCount || passengerCount < 1) {
                throw new AppError('passengers_count must be provided and greater than 0', 400);
            }

            const sessionData = session.session_data || {};
            const seatSelections = sessionData.seat_selections || {};

            // ✅ Build flight summaries
            const flightSummaries = await this.buildFlightSummaries(seatSelections, passengerCount);
            const seatSummary = this.calculateSeatSummary(flightSummaries, passengerCount);

            // ✅ Extend session for booking (30 minutes)
            await session.update({
                expire_at: new Date(Date.now() + 30 * 60000)
            });

            return {
                booking_session_id: sessionId,
                seat_selection_complete: true,
                total_passengers: passengerCount,
                flight_summaries: flightSummaries,
                seat_summary: seatSummary,
                booking_ready: true,
                expires_at: session.expire_at,
            };

        } catch (error) {
            console.error('Error completing seat selection:', error);
            throw error;
        }
    }

    async buildFlightSummaries(seatSelections, totalPassengers) {
        const flightSummaries = [];

        for (const [flightScheduleId, selections] of Object.entries(seatSelections)) {
            const flightInfo = await this.getFlightInfo(parseInt(flightScheduleId));

            const selectedSeats = [];
            const pendingAssignments = [];

            // ✅ Process each passenger
            for (let passengerIndex = 0; passengerIndex < totalPassengers; passengerIndex++) {
                const passengerSelection = selections.passenger_selections.find(
                    p => p.passenger_index === passengerIndex
                );

                if (passengerSelection && passengerSelection.flight_seat_id) {
                    // ✅ User selected seat
                    const seatDetails = await this.getSeatDetails(
                        passengerSelection.flight_seat_id,
                        parseInt(flightScheduleId)
                    );

                    selectedSeats.push({
                        passenger_index: passengerIndex,
                        flight_seat_id: passengerSelection.flight_seat_id,
                        seat_number: seatDetails.seat_number,
                        seat_charges: seatDetails.adjustment,
                        selection_type: 'user_selected'
                    });
                } else {
                    // ✅ Auto-assignment pending
                    pendingAssignments.push({
                        passenger_index: passengerIndex,
                        status: 'will_be_auto_assigned',
                        seat_charges: 0
                    });
                }
            }

            flightSummaries.push({
                flight_schedule_id: parseInt(flightScheduleId),
                flight_info: flightInfo,
                selected_seats: selectedSeats,
                pending_assignments: pendingAssignments,
                seat_charges_total: selectedSeats.reduce((sum, seat) => sum + seat.seat_charges, 0),
                passengers_total: totalPassengers,
                seats_selected_count: selectedSeats.length,
                seats_pending_count: pendingAssignments.length,
                flight_complete: selectedSeats.length + pendingAssignments.length === totalPassengers
            });
        }

        return flightSummaries;
    }

    calculateSeatSummary(flightSummaries, totalPassengers) {
        const totalSeatsSelected = flightSummaries.reduce((sum, flight) =>
            sum + flight.seats_selected_count, 0
        );

        const totalSeatsPending = flightSummaries.reduce((sum, flight) =>
            sum + flight.seats_pending_count, 0
        );

        const totalSeatCharges = flightSummaries.reduce((sum, flight) =>
            sum + flight.seat_charges_total, 0
        );

        return {
            total_passengers: totalPassengers,
            total_seats_selected: totalSeatsSelected,
            total_seats_pending: totalSeatsPending,
            pending_auto_assignments: totalSeatsPending,
            total_seat_charges: totalSeatCharges,
            currency: 'VND',
            selection_status: {
                complete_percentage: Math.round((totalSeatsSelected / (totalPassengers * flightSummaries.length)) * 100),
                has_pending: totalSeatsPending > 0,
                all_selected: totalSeatsPending === 0
            }
        };
    }

    async getFlightInfo(flightScheduleId) {
        try {
            const { FlightSchedule, Flight, Airline, Airport } = require('../models');

            const flightSchedule = await FlightSchedule.findByPk(flightScheduleId, {
                include: [
                    {
                        model: Flight,
                        as: 'flight',
                        include: [
                            {
                                model: Airline,
                                as: 'airline',
                                attributes: ['id', 'name', 'iata_code', 'logo_url']
                            },
                            {
                                model: Airport,
                                as: 'departureAirport',
                                attributes: ['id', 'name', 'iata_code', 'city']
                            },
                            {
                                model: Airport,
                                as: 'arrivalAirport',
                                attributes: ['id', 'name', 'iata_code', 'city']
                            }
                        ]
                    }
                ]
            });

            if (!flightSchedule) {
                throw new AppError(`Flight schedule ${flightScheduleId} not found`, 404);
            }

            return {
                flight_schedule_id: flightScheduleId,
                airline: {
                    name: flightSchedule.flight.airline.name,
                    iata_code: flightSchedule.flight.airline.iata_code,
                    logo_url: flightSchedule.flight.airline.logo_url
                },
                departure: {
                    airport_code: flightSchedule.flight.departureAirport.iata_code,
                    airport_name: flightSchedule.flight.departureAirport.name,
                    city: flightSchedule.flight.departureAirport.city,
                    time: flightSchedule.departure_time
                },
                arrival: {
                    airport_code: flightSchedule.flight.arrivalAirport.iata_code,
                    airport_name: flightSchedule.flight.arrivalAirport.name,
                    city: flightSchedule.flight.arrivalAirport.city,
                    time: flightSchedule.arrival_time
                },
                duration_minutes: flightSchedule.flight.duration_minutes
            };

        } catch (error) {
            console.error('Error getting flight info:', error);
            throw error;
        }
    }

    generateSessionId() {
        return crypto.randomUUID(); // ✅ Native Node.js UUID generation
    }
}

module.exports = SeatSelectionService;