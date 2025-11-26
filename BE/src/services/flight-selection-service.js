const SessionManagerService = require('./session-manager-service');
const crypto = require('crypto');
const AppError = require('../utils/errors/app-error');

class FlightSelectionService {
    /**
     * 🛫 STEP 1: User select flights → CREATE SESSION
     * TRIGGER: User clicks "Select Flights" after search
     */
    async createFlightSelectionSession(payload) {
        try {
            const {
                outbound_flight_id,
                return_flight_id = null,
                passengers_count,
                seat_class_id,
                account_id = null
            } = payload;

            console.log('🛫 Creating flight selection session...');

            const sessionId = crypto.randomUUID();
            const session = await SessionManagerService.getOrCreateUnifiedSession(sessionId, account_id);

            // ✅ Build flight selections data
            const flightSelectionsData = {
                outbound_flight_id,
                return_flight_id,
                passengers_count,
                seat_class_id,
                created_at: new Date().toISOString(),
                trip_type: return_flight_id ? 'round_trip' : 'one_way'
            };

            // ✅ Update session data
            const currentData = session.session_data || {};
            const updatedSessionData = {
                ...currentData,
                flight_selection
                
                : flightSelectionsData
            };

            // ✅ Update with transaction
            const transaction = await session.sequelize.transaction();

            try {
                await session.sequelize.query(`
                    UPDATE BookingSessions 
                    SET session_data = :sessionData,
                        expire_at = :expireAt,
                        updatedAt = NOW()
                    WHERE id = :sessionId
                `, {
                    replacements: {
                        sessionData: JSON.stringify(updatedSessionData),
                        expireAt: new Date(Date.now() + 30 * 60000),
                        sessionId: sessionId
                    },
                    transaction
                });

                await transaction.commit();

            } catch (updateError) {
                await transaction.rollback();
                throw updateError;
            }

            // ✅ Verify update
            await session.reload();

            if (!session.session_data?.flight_selections) {
                throw new AppError('Failed to save flight selections to session', 500);
            }

            console.log('✅ Flight selection session created successfully');

            return {
                booking_session_id: sessionId,
                flight_selections: session.session_data.flight_selections,
                passengers_count,
                expires_at: session.expire_at,
                next_step: 'seat_selection',
                redirect_url: `/seat-selection?session_id=${sessionId}&passengers=${passengers_count}`
            };

        } catch (error) {
            console.error('❌ Error creating flight selection session:', error);
            throw error;
        }
    }

    /**
     * 📊 Get flight selection session data
     */
    async getFlightSelectionSession(sessionId) {
        try {
            const sessionData = await SessionManagerService.getUnifiedSessionData(sessionId);

            return {
                booking_session_id: sessionId,
                flight_selections: sessionData.flight_selections || {},
                seat_selections: sessionData.seat_selections || {},
                service_selections: sessionData.service_selections || {},
                total_estimate: sessionData.total_estimate,
                expires_at: sessionData.expires_at
            };

        } catch (error) {
            console.error('Error getting flight selection session:', error);
            throw error;
        }
    }
}

module.exports = FlightSelectionService;