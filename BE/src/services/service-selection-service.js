const { BookingSession, FlightServiceOffer, ServiceOption, ServiceCatalog } = require('../models');
const { ServicesRepository } = require('../repositories');
const AppError = require('../utils/errors/app-error');
const SessionManagerService = require('./session-manager-service');

class ServiceSelectionService {
    constructor() {
        this.servicesRepository = new ServicesRepository();
    }

    /**
     * 🍽️ Add meal selection cho 1 passenger
     */
    async addMealSelection(payload) {
        try {
            const {
                booking_session_id, // ✅ BẮTBUỘC có từ frontend
                flight_schedule_id,
                passenger_index,
                service_offer_id,
                quantity = 1,
                account_id = null
            } = payload;

            console.log('🍽️ Adding meal selection:', { booking_session_id, flight_schedule_id, passenger_index, service_offer_id });

            return await this.addServiceSelection({
                booking_session_id,
                flight_schedule_id,
                passenger_index,
                service_offer_id,
                quantity,
                account_id,
                service_category: 'MEAL'
            });

        } catch (error) {
            console.error('❌ Error adding meal selection:', error);
            throw error;
        }
    }

    /**
     * 🎒 Add baggage selection cho 1 passenger  
     */
    async addBaggageSelection(payload) {
        try {
            const {
                booking_session_id, // ✅ BẮT BUỘC có từ frontend
                flight_schedule_id,
                passenger_index,
                service_offer_id,
                quantity = 1,
                account_id = null
            } = payload;

            console.log('🎒 Adding baggage selection:', { booking_session_id, flight_schedule_id, passenger_index, service_offer_id });

            return await this.addServiceSelection({
                booking_session_id,
                flight_schedule_id,
                passenger_index,
                service_offer_id,
                quantity,
                account_id,
                service_category: 'BAGGAGE'
            });

        } catch (error) {
            console.error('❌ Error adding baggage selection:', error);
            throw error;
        }
    }

    /**
     * 🔧 CORE: Add service selection (meal hoặc baggage)
     * ✅ SỬ DỤNG session có sẵn - KHÔNG tạo mới
     */
    async addServiceSelection(payload) {
        try {
            const {
                booking_session_id,
                flight_schedule_id,
                passenger_index,
                service_offer_id,
                quantity,
                account_id,
                service_category
            } = payload;

            console.log('🔍 === ADD SERVICE SELECTION START ===');
            console.log('Input:', { booking_session_id, flight_schedule_id, passenger_index, service_offer_id, service_category });

            // ✅ VALIDATION: booking_session_id bắt buộc
            if (!booking_session_id) {
                throw new AppError('booking_session_id is required for service selection', 400);
            }

            // ✅ CHỈ GET session - KHÔNG tạo mới
            let session = await SessionManagerService.getUnifiedSession(booking_session_id);

            if (!session) {
                throw new AppError('Session not found. Please start from flight selection.', 404);
            }

            console.log('✅ Found existing session:', booking_session_id);

            // ✅ Validate session có flight_selections
            const sessionData = session.session_data || {};
            if (!sessionData.flight_selections) {
                throw new AppError('Invalid session. Please start from flight selection.', 400);
            }

            // ✅ Validate service availability & get pricing
            const availability = await this.servicesRepository.checkServiceAvailability([service_offer_id], [quantity]);
            const serviceAvailability = availability[0];

            console.log('🔍 Service availability:', serviceAvailability);

            if (!serviceAvailability || !serviceAvailability.is_available) {
                throw new AppError(`${service_category.toLowerCase()} option is not available`, 400);
            }

            // ✅ Validate service category
            if (serviceAvailability.category !== service_category) {
                throw new AppError(`Service is not a ${service_category.toLowerCase()} option`, 400);
            }

            // ✅ Remove previous selection + Add new
            await this.removePreviousServiceSelection(session, flight_schedule_id, passenger_index, service_category);

            session = await this.addServiceToSession(session, flight_schedule_id, passenger_index, {
                service_category,
                service_offer_id,
                service_title: serviceAvailability.service_title,
                quantity,
                unit_price: serviceAvailability.unit_price,
                total_price: serviceAvailability.total_price,
                selected_at: new Date()
            });

            console.log('✅ Service added to session');

            // ✅ ⚠️ UPDATE INVENTORY - Giảm capacity, tăng sold_count
            await this.updateServiceInventory(service_offer_id, quantity);

            // ✅ Recalculate pricing
            await session.reload();
            const flightPricing = await this.recalculateFlightServicePricing(session, flight_schedule_id);
            const sessionTotals = await SessionManagerService.calculateUnifiedTotal(session);

            console.log('🔍 Flight pricing after recalc:', flightPricing);
            console.log('🔍 Session totals after recalc:', sessionTotals);

            const serviceTypeName = service_category.toLowerCase();

            const result = {
                booking_session_id: session.id,
                flight_schedule_id,
                passenger_index,
                [`${serviceTypeName}_selected`]: {
                    service_offer_id,
                    service_title: serviceAvailability.service_title,
                    quantity,
                    unit_price: serviceAvailability.unit_price,
                    total_price: serviceAvailability.total_price
                },
                flight_service_subtotal: flightPricing.total_amount,
                session_totals: sessionTotals,
                expires_at: session.expire_at
            };

            console.log('🎯 === ADD SERVICE SELECTION RESULT ===');
            console.log('Result:', JSON.stringify(result, null, 2));

            return result;

        } catch (error) {
            console.error('❌ Error adding service selection:', error);
            throw error;
        }
    }

    // ✅ NEW: Update service inventory (capacity, sold_count)
    async updateServiceInventory(serviceOfferId, quantitySelected) {
        try {
            console.log(`📦 Updating inventory: service ${serviceOfferId}, quantity ${quantitySelected}`);

            const [affectedRows] = await FlightServiceOffer.update({
                sold_count: require('sequelize').literal(`sold_count + ${quantitySelected}`)
            }, {
                where: {
                    id: serviceOfferId,
                    status: 'available'
                }
            });

            console.log(`✅ Updated ${affectedRows} service offer inventory`);

            // ✅ Check if service is sold out
            const updatedService = await FlightServiceOffer.findByPk(serviceOfferId, {
                attributes: ['id', 'capacity', 'sold_count', 'status']
            });

            if (updatedService && updatedService.capacity && updatedService.sold_count >= updatedService.capacity) {
                await updatedService.update({ status: 'sold_out' });
                console.log(`🚫 Service ${serviceOfferId} marked as sold out`);
            }

            return affectedRows;

        } catch (error) {
            console.error('❌ Error updating service inventory:', error);
            throw error;
        }
    }

    // ✅ ENHANCED: Add service to session với proper structure
    async addServiceToSession(session, flightScheduleId, passengerIndex, serviceData) {
        try {
            console.log('🔍 === ADD SERVICE TO SESSION START ===');
            console.log('Flight ID:', flightScheduleId, 'Passenger:', passengerIndex);
            console.log('Service data:', serviceData);

            const currentData = session.session_data || {};

            // ✅ Initialize service_selections nếu chưa có
            if (!currentData.service_selections) {
                currentData.service_selections = {};
                console.log('✅ Initialized service_selections');
            }

            if (!currentData.service_selections[flightScheduleId]) {
                currentData.service_selections[flightScheduleId] = {
                    meal_selections: [],
                    baggage_selections: [],
                    service_pricing: {
                        meal_total: 0,
                        baggage_total: 0,
                        total_amount: 0
                    },
                    updated_at: new Date()
                };
                console.log('✅ Initialized flight service data for flight:', flightScheduleId);
            }

            const flightServices = currentData.service_selections[flightScheduleId];
            const category = serviceData.service_category.toLowerCase(); // 'meal' or 'baggage'

            console.log('🔍 Current flight services before add:', {
                meals: flightServices.meal_selections?.length || 0,
                baggage: flightServices.baggage_selections?.length || 0
            });

            // Determine target array
            const targetArray = category === 'meal' ?
                flightServices.meal_selections : flightServices.baggage_selections;

            const newSelection = {
                passenger_index: passengerIndex,
                service_offer_id: serviceData.service_offer_id,
                service_title: serviceData.service_title,
                service_category: serviceData.service_category,
                quantity: serviceData.quantity,
                unit_price: serviceData.unit_price,
                total_price: serviceData.total_price,
                selected_at: serviceData.selected_at
            };

            console.log('🔍 New selection to add:', newSelection);

            // ✅ Replace existing selection for this passenger
            const existingIndex = targetArray.findIndex(
                s => s.passenger_index === passengerIndex
            );

            if (existingIndex >= 0) {
                console.log(`🔄 Replacing existing ${category} selection for passenger ${passengerIndex}`);
                targetArray[existingIndex] = newSelection;
            } else {
                console.log(`➕ Adding new ${category} selection for passenger ${passengerIndex}`);
                targetArray.push(newSelection);
            }

            console.log('🔍 Target array after update:', targetArray);

            // ✅ Update session với RAW SQL (more reliable)
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

            console.log('✅ Session updated with RAW SQL');

            await session.reload();

            console.log('🔍 Session data after reload:', JSON.stringify(session.session_data?.service_selections?.[flightScheduleId], null, 2));

            return session;

        } catch (error) {
            console.error('❌ Error adding service to session:', error);
            throw error;
        }
    }

    // ✅ ENHANCED: Recalculate với inventory tracking
    async recalculateFlightServicePricing(session, flightScheduleId) {
        try {
            console.log('🔍 === RECALCULATE PRICING START ===');
            console.log('Flight ID:', flightScheduleId);

            await session.reload();

            const sessionData = session.session_data || {};
            const flightServices = sessionData.service_selections?.[flightScheduleId];

            console.log('🔍 Flight services data:', flightServices);

            if (!flightServices) {
                console.log('❌ No flight services found for recalculation');
                return { meal_total: 0, baggage_total: 0 };
            }

            const mealSelections = flightServices.meal_selections || [];
            const baggageSelections = flightServices.baggage_selections || [];

            console.log('🔍 Meal selections:', mealSelections);
            console.log('🔍 Baggage selections:', baggageSelections);

            const mealTotal = mealSelections.reduce(
                (sum, meal) => sum + (meal.total_price || 0), 0
            );

            const baggageTotal = baggageSelections.reduce(
                (sum, baggage) => sum + (baggage.total_price || 0), 0
            );

            const totalAmount = mealTotal + baggageTotal;

            console.log('🔍 Calculated totals:', { mealTotal, baggageTotal, totalAmount });

            // ✅ Update pricing trong session
            flightServices.service_pricing = {
                meal_total: mealTotal,
                baggage_total: baggageTotal,
                total_amount: totalAmount,
                currency: 'VND',
                updated_at: new Date()
            };

            // ✅ Update với RAW SQL
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

            console.log('✅ Pricing updated in session:', flightServices.service_pricing);

            return flightServices.service_pricing;

        } catch (error) {
            console.error('❌ Error recalculating service pricing:', error);
            throw error;
        }
    }

    // ✅ Helper: Remove previous selection
    async removePreviousServiceSelection(session, flightScheduleId, passengerIndex, serviceCategory) {
        try {
            const sessionData = session.session_data || {};
            const flightServices = sessionData.service_selections?.[flightScheduleId];

            if (!flightServices) return;

            const category = serviceCategory.toLowerCase();
            const targetArray = category === 'meal' ?
                flightServices.meal_selections : flightServices.baggage_selections;

            const existingSelection = targetArray?.find(
                s => s.passenger_index === passengerIndex
            );

            if (existingSelection) {
                console.log(`🗑️ Found previous ${serviceCategory} for passenger ${passengerIndex}: ${existingSelection.service_title}`);

                // ✅ RESTORE inventory của service cũ
                await this.restoreServiceInventory(existingSelection.service_offer_id, existingSelection.quantity);

                // ✅ Remove từ array
                const filteredArray = targetArray.filter(
                    s => s.passenger_index !== passengerIndex
                );

                if (category === 'meal') {
                    flightServices.meal_selections = filteredArray;
                } else {
                    flightServices.baggage_selections = filteredArray;
                }

                console.log(`✅ Removed previous ${serviceCategory} selection`);
            }
        } catch (error) {
            console.error('❌ Error removing previous service selection:', error);
            throw error;
        }
    }

    // ✅ NEW: Restore inventory khi remove service
    async restoreServiceInventory(serviceOfferId, quantityToRestore) {
        try {
            console.log(`📦 Restoring inventory: service ${serviceOfferId}, quantity ${quantityToRestore}`);

            const [affectedRows] = await FlightServiceOffer.update({
                sold_count: require('sequelize').literal(`GREATEST(0, sold_count - ${quantityToRestore})`),
                status: 'available' // ✅ Set back to available nếu bị sold_out
            }, {
                where: {
                    id: serviceOfferId
                }
            });

            console.log(`✅ Restored ${affectedRows} service offer inventory`);

            return affectedRows;

        } catch (error) {
            console.error('❌ Error restoring service inventory:', error);
            throw error;
        }
    }

    /**
     * 📊 Get current service selections cho session
     * GET /api/v1/service-selection/:sessionId
     */
    async getSessionServiceSelections(sessionId) {
        try {
            console.log('📊 === GET SESSION SERVICE SELECTIONS START ===');
            console.log('Session ID:', sessionId);

            const session = await SessionManagerService.getUnifiedSession(sessionId);

            if (!session) {
                throw new AppError('Session not found', 404);
            }

            const sessionData = session.session_data || {};
            const serviceSelections = sessionData.service_selections || {};

            console.log('🔍 Found service selections for flights:', Object.keys(serviceSelections));

            // Format response
            const formattedSelections = {};
            let totalServiceAmount = 0;

            for (const [flightId, flightServices] of Object.entries(serviceSelections)) {
                const mealSelections = flightServices.meal_selections || [];
                const baggageSelections = flightServices.baggage_selections || [];
                const servicePricing = flightServices.service_pricing || {};

                formattedSelections[flightId] = {
                    flight_schedule_id: parseInt(flightId),
                    meal_selections: mealSelections,
                    baggage_selections: baggageSelections,
                    service_pricing: {
                        meal_total: servicePricing.meal_total || 0,
                        baggage_total: servicePricing.baggage_total || 0,
                        total_amount: servicePricing.total_amount || 0,
                        currency: 'VND',
                        updated_at: servicePricing.updated_at
                    }
                };

                totalServiceAmount += servicePricing.total_amount || 0;
            }

            const result = {
                booking_session_id: sessionId,
                flight_services: formattedSelections,
                total_service_amount: totalServiceAmount,
                expires_at: session.expire_at
            };

            console.log('✅ Session service selections retrieved');
            return result;

        } catch (error) {
            console.error('❌ Error getting session service selections:', error);
            throw error;
        }
    }

    /**
     * 🛠️ Select multiple services cho flight (bulk operation)
     * POST /api/v1/service-selection/select-services
     */
    async selectServicesForFlight(payload) {
        try {
            const {
                booking_session_id,
                flight_schedule_id,
                service_selections,
                account_id = null
            } = payload;

            console.log('🛠️ === SELECT SERVICES FOR FLIGHT START ===');
            console.log(`Processing ${service_selections.length} service selections for flight ${flight_schedule_id}`);

            if (!booking_session_id) {
                throw new AppError('booking_session_id is required', 400);
            }

            const session = await SessionManagerService.getUnifiedSession(booking_session_id);
            if (!session) {
                throw new AppError('Session not found', 404);
            }

            const results = [];
            let totalProcessed = 0;
            let totalErrors = 0;

            // Process each service selection
            for (const serviceSelection of service_selections) {
                try {
                    const {
                        passenger_index,
                        service_offer_id,
                        quantity = 1,
                        service_category
                    } = serviceSelection;

                    console.log(`🔍 Processing service for passenger ${passenger_index}: ${service_category}`);

                    const result = await this.addServiceSelection({
                        booking_session_id,
                        flight_schedule_id,
                        passenger_index,
                        service_offer_id,
                        quantity,
                        account_id,
                        service_category
                    });

                    results.push({
                        passenger_index,
                        service_category,
                        service_offer_id,
                        status: 'success',
                        service_title: result[`${service_category.toLowerCase()}_selected`]?.service_title
                    });

                    totalProcessed++;

                } catch (error) {
                    console.error(`❌ Error processing service for passenger ${serviceSelection.passenger_index}:`, error);

                    results.push({
                        passenger_index: serviceSelection.passenger_index,
                        service_category: serviceSelection.service_category,
                        service_offer_id: serviceSelection.service_offer_id,
                        status: 'error',
                        error: error.message
                    });

                    totalErrors++;
                }
            }

            // Get updated session totals
            await session.reload();
            const flightPricing = await this.recalculateFlightServicePricing(session, flight_schedule_id);
            const sessionTotals = await SessionManagerService.calculateUnifiedTotal(session);

            const summary = {
                booking_session_id,
                flight_schedule_id,
                total_requested: service_selections.length,
                total_processed: totalProcessed,
                total_errors: totalErrors,
                selection_results: results,
                flight_service_subtotal: flightPricing.total_amount,
                session_totals: sessionTotals,
                expires_at: session.expire_at
            };

            console.log('✅ Bulk service selection completed');
            return summary;

        } catch (error) {
            console.error('❌ Error in bulk service selection:', error);
            throw error;
        }
    }

    /**
     * 🗑️ Remove meal selection
     * DELETE /api/v1/service-selection/remove-meal
     */
    async removeMealSelection(payload) {
        return await this.removeServiceSelection({
            ...payload,
            service_category: 'MEAL'
        });
    }

    /**
     * 🗑️ Remove baggage selection
     * DELETE /api/v1/service-selection/remove-baggage
     */
    async removeBaggageSelection(payload) {
        return await this.removeServiceSelection({
            ...payload,
            service_category: 'BAGGAGE'
        });
    }

    /**
     * 🔧 CORE: Remove service selection
     */
    async removeServiceSelection(payload) {
        try {
            const {
                booking_session_id,
                flight_schedule_id,
                passenger_index,
                service_category
            } = payload;

            console.log('🗑️ === REMOVE SERVICE SELECTION START ===');
            console.log('Input:', { booking_session_id, flight_schedule_id, passenger_index, service_category });

            const session = await SessionManagerService.getUnifiedSession(booking_session_id);
            if (!session) {
                throw new AppError('Session not found', 404);
            }

            const sessionData = session.session_data || {};
            const flightServices = sessionData.service_selections?.[flight_schedule_id];

            if (!flightServices) {
                throw new AppError(`No service selections found for flight ${flight_schedule_id}`, 404);
            }

            const category = service_category.toLowerCase();
            const targetArray = category === 'meal' ?
                flightServices.meal_selections : flightServices.baggage_selections;

            const existingSelection = targetArray?.find(
                s => s.passenger_index === passenger_index
            );

            if (!existingSelection) {
                throw new AppError(`No ${category} selection found for passenger ${passenger_index}`, 404);
            }

            console.log(`🔍 Found ${category} selection to remove:`, existingSelection);

            // Restore inventory
            await this.restoreServiceInventory(existingSelection.service_offer_id, existingSelection.quantity);

            // Remove from array
            const filteredArray = targetArray.filter(
                s => s.passenger_index !== passenger_index
            );

            if (category === 'meal') {
                flightServices.meal_selections = filteredArray;
            } else {
                flightServices.baggage_selections = filteredArray;
            }

            // Update session
            await session.sequelize.query(`
                UPDATE BookingSessions 
                SET session_data = :sessionData,
                    updatedAt = NOW()
                WHERE id = :sessionId
            `, {
                replacements: {
                    sessionData: JSON.stringify(sessionData),
                    sessionId: session.id
                }
            });

            // Recalculate pricing
            await session.reload();
            const flightPricing = await this.recalculateFlightServicePricing(session, flight_schedule_id);
            const sessionTotals = await SessionManagerService.calculateUnifiedTotal(session);

            const result = {
                booking_session_id: session.id,
                flight_schedule_id,
                passenger_index,
                [`${category}_removed`]: {
                    service_offer_id: existingSelection.service_offer_id,
                    service_title: existingSelection.service_title,
                    quantity: existingSelection.quantity,
                    unit_price: existingSelection.unit_price,
                    total_price: existingSelection.total_price
                },
                flight_service_subtotal: flightPricing.total_amount,
                session_totals: sessionTotals,
                expires_at: session.expire_at
            };

            console.log('✅ Service selection removed successfully');
            return result;

        } catch (error) {
            console.error('❌ Error removing service selection:', error);
            throw error;
        }
    }

    /**
     * ✅ Complete service selection process
     * POST /api/v1/service-selection/:sessionId/complete
     */
    async completeServiceSelection(sessionId) {
        try {
            console.log('✅ === COMPLETE SERVICE SELECTION START ===');
            console.log('Session ID:', sessionId);

            const session = await SessionManagerService.getUnifiedSession(sessionId);
            if (!session) {
                throw new AppError('Session not found', 404);
            }

            const sessionData = session.session_data || {};

            // Validate session has required data
            if (!sessionData.flight_selections) {
                throw new AppError('Invalid session: missing flight selections', 400);
            }

            // Get service selections summary
            const serviceSelections = sessionData.service_selections || {};
            const serviceSummaries = [];
            let totalServiceAmount = 0;

            for (const [flightId, flightServices] of Object.entries(serviceSelections)) {
                const mealSelections = flightServices.meal_selections || [];
                const baggageSelections = flightServices.baggage_selections || [];
                const servicePricing = flightServices.service_pricing || {};

                serviceSummaries.push({
                    flight_schedule_id: parseInt(flightId),
                    meal_selections: mealSelections,
                    baggage_selections: baggageSelections,
                    service_pricing: servicePricing,
                    passengers_with_meals: mealSelections.length,
                    passengers_with_baggage: baggageSelections.length
                });

                totalServiceAmount += servicePricing.total_amount || 0;
            }

            // Mark service selection as complete
            sessionData.service_selection_complete = true;
            sessionData.service_completed_at = new Date();

            // Extend session for next step (passenger details, payment)
            const newExpiry = new Date(Date.now() + 45 * 60000); // 45 minutes

            await session.update({
                session_data: sessionData,
                expire_at: newExpiry
            });

            const result = {
                booking_session_id: sessionId,
                service_selection_complete: true,
                service_summaries: serviceSummaries,
                total_service_amount: totalServiceAmount,
                expires_at: newExpiry,
                redirect_url: `/booking?session_id=${sessionId}` // Next step in booking flow
            };

            console.log('✅ Service selection completed successfully');
            return result;

        } catch (error) {
            console.error('❌ Error completing service selection:', error);
            throw error;
        }
    }

}

module.exports = ServiceSelectionService;