const { BookingSession } = require('../models');

const AppError = require('../utils/errors/app-error');
const crypto = require('crypto');
class SessionManagerService {

    /**
     * ✅ CHÍNH: Get or create session - SỬA LOGIC
     */
    static async getOrCreateUnifiedSession(sessionId, accountId) {
        try {
            // ✅ CASE 1: Không có sessionId → Tạo session hoàn toàn mới (từ flight selection)
            if (!sessionId) {
                const newSessionId = crypto.randomUUID();
                console.log(`🆕 Creating completely new session: ${newSessionId}`);

                const newSession = await BookingSession.create({
                    id: newSessionId,
                    account_id: accountId,
                    session_data: {
                        seat_selections: {},
                        service_selections: {},
                        created_at: new Date().toISOString(),
                        session_type: 'unified_booking'
                    },
                    total_estimate: 0,
                    expire_at: new Date(Date.now() + 30 * 60000)
                });

                return newSession;
            }

            // ✅ CASE 2: Có sessionId → Kiểm tra existing hoặc tạo mới với sessionId đó
            console.log(`🔍 Checking session: ${sessionId}`);

            const existingSession = await BookingSession.findByPk(sessionId);

            if (existingSession) {
                // ✅ Session tồn tại → Check expiry
                if (existingSession.expire_at < new Date()) {
                    console.log(`⚠️ Session ${sessionId} expired, cleaning up...`);
                    await this.cleanupExpiredSession(existingSession);

                    // ✅ Tạo session mới với cùng sessionId (cho flight selection)
                    console.log(`🔄 Creating new session with same ID: ${sessionId}`);
                    const newSession = await BookingSession.create({
                        id: sessionId,
                        account_id: accountId,
                        session_data: {
                            seat_selections: {},
                            service_selections: {},
                            created_at: new Date().toISOString(),
                            session_type: 'unified_booking'
                        },
                        total_estimate: 0,
                        expire_at: new Date(Date.now() + 30 * 60000)
                    });

                    return newSession;
                } else {
                    // ✅ Session valid → Return existing
                    console.log(`♻️ Reusing existing session: ${sessionId}`);
                    return existingSession;
                }
            } else {
                // ✅ Session không tồn tại → Tạo mới với sessionId provided
                console.log(`🆕 Creating new session with provided ID: ${sessionId}`);

                const newSession = await BookingSession.create({
                    id: sessionId,
                    account_id: accountId,
                    session_data: {
                        seat_selections: {},
                        service_selections: {},
                        created_at: new Date().toISOString(),
                        session_type: 'unified_booking'
                    },
                    total_estimate: 0,
                    expire_at: new Date(Date.now() + 30 * 60000)
                });

                return newSession;
            }

        } catch (error) {
            console.error('Error in getOrCreateUnifiedSession:', error);
            throw error;
        }
    }

    /**
     * ✅ GET-ONLY: Chỉ get session (không tạo mới)
     */
    static async getUnifiedSession(sessionId) {
        try {
            if (!sessionId) {
                throw new AppError('Session ID is required', 400);
            }

            const session = await BookingSession.findByPk(sessionId);

            if (!session) {
                return null;
            }

            // ✅ Check expiry
            if (session.expire_at < new Date()) {
                console.log(`⚠️ Session ${sessionId} expired`);
                await this.cleanupExpiredSession(session);
                return null;
            }

            console.log(`✅ Found valid session: ${sessionId}`);
            return session;

        } catch (error) {
            console.error('Error getting unified session:', error);
            throw error;
        }
    }

    /**
     * ✅ SỬA: Enhanced cleanup
     */
    static async cleanupExpiredSession(session) {
        try {
            console.log(`🧹 Cleaning up expired session: ${session.id}`);

            // ✅ 1. Release blocked seats
            try {
                const { SeatRepository } = require('../repositories');
                const seatRepo = new SeatRepository();
                const releasedSeats = await seatRepo.releaseBlockedSeats(session.id);
                console.log(`🗑️ Released ${releasedSeats} blocked seats`);
            } catch (seatError) {
                console.error('Error releasing seats:', seatError);
            }

            // ✅ 2. Delete session completely (không cần update trước)
            await session.destroy();
            console.log(`✅ Session ${session.id} deleted completely`);

        } catch (error) {
            console.error('Error cleaning up expired session:', error);
            // ✅ Không throw error để tránh block process
        }
    }

    /**
     * 🔄 Extend session (dùng chung)
     */
    static async extendSession(sessionId, minutes = 15) {
        try {
            const session = await BookingSession.findByPk(sessionId);

            if (!session) {
                throw new AppError('Session not found', 404);
            }

            const newExpiry = new Date(Date.now() + minutes * 60000);

            await session.update({
                expire_at: newExpiry
            });

            console.log(`🔄 Extended session ${sessionId} by ${minutes} minutes`);
            return session;

        } catch (error) {
            console.error('Error extending session:', error);
            throw error;
        }
    }

    /**
     * 📊 Get unified session data
     */
    static async getUnifiedSessionData(sessionId) {
        try {
            const session = await BookingSession.findByPk(sessionId);

            if (!session) {
                throw new AppError('Session not found', 404);
            }

            if (session.expire_at < new Date()) {
                await this.cleanupExpiredSession(session);
                throw new AppError('Session expired', 410);
            }

            const sessionData = session.session_data || {};

            return {
                session_id: sessionId,
                account_id: session.account_id,
                flight_selections: sessionData.flight_selections || {}, // ✅ THÊM flight_selections
                seat_selections: sessionData.seat_selections || {},
                service_selections: sessionData.service_selections || {},
                total_estimate: session.total_estimate,
                expires_at: session.expire_at,
                session_age_minutes: Math.round((new Date() - new Date(sessionData.created_at)) / 60000)
            };

        } catch (error) {
            console.error('Error getting unified session data:', error);
            throw error;
        }
    }

    /**
     * 💰 Calculate unified session total
     */
    static async calculateUnifiedTotal(session) {
        try {
            await session.reload();

            const sessionData = session.session_data || {};
            let totalSeatCharges = 0;
            let totalServiceCharges = 0;

            // ✅ Seat charges
            if (sessionData.seat_selections) {
                for (const selections of Object.values(sessionData.seat_selections)) {
                    totalSeatCharges += selections.seat_pricing?.total_seat_adjustment || 0;
                }
            }

            // ✅ Service charges (meals + baggage)
            if (sessionData.service_selections) {
                for (const services of Object.values(sessionData.service_selections)) {
                    totalServiceCharges += services.service_pricing?.total_amount || 0;
                }
            }

            const grandTotal = totalSeatCharges + totalServiceCharges;

            // ✅ Update session total
            await session.update({
                total_estimate: grandTotal
            });

            return {
                seat_charges: totalSeatCharges,
                service_charges: totalServiceCharges,
                grand_total: grandTotal,
                currency: 'VND'
            };

        } catch (error) {
            console.error('Error calculating unified total:', error);
            throw error;
        }
    }

    /**
     * 🔍 Validate session for booking
     */
    static async validateSessionForBooking(sessionId) {
        try {
            const sessionData = await this.getUnifiedSessionData(sessionId);

            const validation = {
                session_valid: true,
                has_flight_selections: Object.keys(sessionData.flight_selections).length > 0, // ✅ THÊM flight check
                has_seat_selections: Object.keys(sessionData.seat_selections).length > 0,
                has_service_selections: Object.keys(sessionData.service_selections).length > 0,
                total_amount: sessionData.total_estimate,
                expires_at: sessionData.expires_at,
                ready_for_booking: false
            };

            validation.ready_for_booking = validation.has_flight_selections; // ✅ Ready if has flights

            return validation;

        } catch (error) {
            console.error('Error validating session for booking:', error);
            throw error;
        }
    }
}

module.exports = SessionManagerService;