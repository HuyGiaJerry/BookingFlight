const { FlightSeat, BookingSession } = require('../models');
const { Op } = require('sequelize');

class SeatCleanupService {
    constructor() {
        this.isRunning = false;
        this.cleanupInterval = null;
    }

    /**
     * ✅ CHÍNH: Auto-release expired blocked seats
     * CHỨC NĂNG: Tự động cleanup seats bị blocked quá hạn
     */
    async releaseExpiredBlockedSeats() {
        try {
            console.log('🧹 === AUTO-CLEANUP EXPIRED SEATS START ===');

            const now = new Date();

            // ✅ Find expired blocked seats
            const expiredSeats = await FlightSeat.findAll({
                where: {
                    status: 'blocked',
                    blocked_until: {
                        [Op.lt]: now  // blocked_until < NOW()
                    }
                },
                attributes: ['id', 'blocked_session_id', 'blocked_until']
            });

            if (expiredSeats.length === 0) {
                console.log('✅ No expired seats found');
                return { released: 0, message: 'No expired seats' };
            }

            console.log(`🎯 Found ${expiredSeats.length} expired seats:`, expiredSeats.map(s => ({
                id: s.id,
                session: s.blocked_session_id,
                expired_at: s.blocked_until
            })));

            // ✅ BULK UPDATE expired seats to available
            const [updatedCount] = await FlightSeat.update({
                status: 'available',
                blocked_session_id: null,    // ✅ Clear session
                blocked_at: null,            // ✅ Clear timestamps  
                blocked_until: null
            }, {
                where: {
                    status: 'blocked',
                    blocked_until: {
                        [Op.lt]: now
                    }
                }
            });

            console.log(`✅ Released ${updatedCount} expired seats`);
            console.log('🧹 === AUTO-CLEANUP EXPIRED SEATS END ===');

            return {
                released: updatedCount,
                expired_seats: expiredSeats.map(s => s.id),
                cleaned_at: now
            };

        } catch (error) {
            console.error('❌ Error releasing expired blocked seats:', error);
            throw error;
        }
    }

    /**
     * ✅ CLEANUP expired sessions
     * CHỨC NĂNG: Cleanup session + release tất cả seats của session đó
     */
    async cleanupExpiredSessions() {
        try {
            console.log('🧹 === CLEANUP EXPIRED SESSIONS START ===');

            const now = new Date();

            // ✅ Find expired sessions with detailed info
            const expiredSessions = await BookingSession.findAll({
                where: {
                    expire_at: {
                        [Op.lt]: now
                    }
                },
                attributes: ['id', 'session_data', 'expire_at', 'total_estimate']
            });

            if (expiredSessions.length === 0) {
                console.log('✅ No expired sessions found');
                return { sessions_cleaned: 0, seats_released: 0 };
            }

            console.log(`🎯 Found ${expiredSessions.length} expired sessions`);

            let totalSeatsReleased = 0;
            let totalSessionsWithSeats = 0;

            for (const session of expiredSessions) {
                console.log(`🧹 Processing session: ${session.id}`);

                // ✅ LOG session content trước khi xóa
                const sessionData = session.session_data || {};

                if (sessionData.seat_selections && Object.keys(sessionData.seat_selections).length > 0) {
                    console.log(`📊 Session ${session.id} had seat data:`, {
                        flights: Object.keys(sessionData.seat_selections),
                        total_estimate: session.total_estimate
                    });
                    totalSessionsWithSeats++;
                }

                // ✅ Release seats cho session này
                const [releasedSeats] = await FlightSeat.update({
                    status: 'available',
                    blocked_session_id: null,
                    blocked_at: null,
                    blocked_until: null
                }, {
                    where: {
                        blocked_session_id: session.id,
                        status: 'blocked'
                    }
                });

                totalSeatsReleased += releasedSeats;

                if (releasedSeats > 0) {
                    console.log(`🗑️ Session ${session.id}: Released ${releasedSeats} seats`);
                }

                // ✅ LOG seat_selections trước khi xóa
                if (sessionData.seat_selections) {
                    console.log(`🗃️ Clearing seat_selections for session ${session.id}:`,
                        Object.keys(sessionData.seat_selections)
                    );
                }

                if (sessionData.service_selections) {
                    console.log(`🗃️ Clearing service_selections for session ${session.id}:`,
                        Object.keys(sessionData.service_selections)
                    );
                }
            }

            // ✅ Batch delete expired sessions
            const deletedSessions = await BookingSession.destroy({
                where: {
                    expire_at: {
                        [Op.lt]: now
                    }
                }
            });

            console.log(`✅ CLEANUP SUMMARY:`);
            console.log(`   Sessions cleaned: ${deletedSessions}`);
            console.log(`   Sessions with seat data: ${totalSessionsWithSeats}`);
            console.log(`   Seats released: ${totalSeatsReleased}`);
            console.log(`   Cleanup completed at: ${now}`);
            console.log('🧹 === CLEANUP EXPIRED SESSIONS END ===');

            return {
                sessions_cleaned: deletedSessions,
                sessions_with_seat_data: totalSessionsWithSeats,
                seats_released: totalSeatsReleased,
                cleaned_at: now
            };

        } catch (error) {
            console.error('❌ Error cleaning expired sessions:', error);
            throw error;
        }
    }

    /**
     * ✅ MAIN cleanup function
     * CHỨC NĂNG: Run tất cả cleanup tasks
     */
    async runFullCleanup() {
        try {
            if (this.isRunning) {
                console.log('⚠️ Cleanup already running, skipping...');
                return;
            }

            this.isRunning = true;
            console.log('🚀 === FULL CLEANUP START ===');

            const results = {
                started_at: new Date(),
                seat_cleanup: null,
                session_cleanup: null
            };

            // 1. Release expired blocked seats
            results.seat_cleanup = await this.releaseExpiredBlockedSeats();

            // 2. Cleanup expired sessions
            results.session_cleanup = await this.cleanupExpiredSessions();

            results.completed_at = new Date();
            results.duration_ms = results.completed_at - results.started_at;

            console.log('🎉 === FULL CLEANUP COMPLETE ===');
            console.log('Results:', results);

            return results;

        } catch (error) {
            console.error('❌ Error in full cleanup:', error);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }

    /**
     * ✅ Start automatic cleanup scheduler
     * CHỨC NĂNG: Chạy cleanup mỗi 2 phút
     */
    startAutoCleanup() {
        console.log('🕐 Starting automatic seat cleanup scheduler...');

        // Cleanup ngay lúc start
        setTimeout(() => {
            this.runFullCleanup().catch(console.error);
        }, 5000); // Delay 5 giây để server khởi động xong

        // Cleanup mỗi 2 phút
        this.cleanupInterval = setInterval(async () => {
            try {
                await this.runFullCleanup();
            } catch (error) {
                console.error('❌ Auto-cleanup failed:', error);
            }
        }, 2 * 60 * 1000); // 2 minutes

        console.log('✅ Auto-cleanup scheduler started (every 2 minutes)');
    }

    /**
     * ✅ Stop automatic cleanup
     */
    stopAutoCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
            console.log('🛑 Auto-cleanup scheduler stopped');
        }
    }

    /**
     * ✅ THÊM: Manual cleanup specific session
     */
    async cleanupSpecificSession(sessionId) {
        try {
            console.log(`🧹 Manual cleanup for session: ${sessionId}`);

            const session = await BookingSession.findByPk(sessionId);
            if (!session) {
                return { message: 'Session not found', cleaned: false };
            }

            // ✅ Release seats
            const [releasedSeats] = await FlightSeat.update({
                status: 'available',
                blocked_session_id: null,
                blocked_at: null,
                blocked_until: null
            }, {
                where: {
                    blocked_session_id: sessionId,
                    status: 'blocked'
                }
            });

            // ✅ Log session content
            const sessionData = session.session_data || {};
            console.log(`📊 Session ${sessionId} content:`, {
                has_flight_selections: !!sessionData.flight_selections,
                has_seat_selections: !!sessionData.seat_selections,
                has_service_selections: !!sessionData.service_selections,
                total_estimate: session.total_estimate
            });

            // ✅ Delete session
            await session.destroy();

            console.log(`✅ Manual cleanup completed for session ${sessionId}`);

            return {
                session_id: sessionId,
                seats_released: releasedSeats,
                cleaned: true,
                cleaned_at: new Date()
            };

        } catch (error) {
            console.error('Error in manual session cleanup:', error);
            throw error;
        }
    }
}

module.exports = SeatCleanupService;