const { StatusCodes } = require('http-status-codes');
const PassengerService = require('./passenger-service');
const AppError = require('../utils/errors/app-error');

class BookingPageService {
    constructor() {
        this.passengerService = new PassengerService();
    }

    /**
     * ✅ SIMPLIFIED: Chỉ get basic data và user passengers
     */
    async getBookingBasicData(accountId = null) {
        try {
            // Get user's saved passengers if logged in
            let savedPassengers = [];
            if (accountId) {
                try {
                    const passengerData = await this.passengerService.getUserPassengers(accountId);
                    savedPassengers = passengerData.passengers || [];
                } catch (error) {
                    console.error('Error getting saved passengers:', error);
                    savedPassengers = [];
                }
            }

            return {
                saved_passengers: savedPassengers,
                booking_rules: {
                    max_passengers: 9,
                    infant_rules: {
                        max_per_adult: 1,
                        age_limit: 2
                    },
                    child_rules: {
                        age_limit: 12,
                        discount_percentage: 25
                    },
                    seat_rules: {
                        selection_time_limit: 15, // minutes
                        block_duration: 15 // minutes
                    }
                }
            };
        } catch (error) {
            console.error('Error getting booking basic data:', error);
            throw error;
        }
    }

    // /**
    //  * Validate booking form data before submission
    //  */
    // async validateBookingForm(formData) {
    //     try {
    //         const validationResults = {
    //             is_valid: true,
    //             errors: [],
    //             warnings: []
    //         };

    //         // Validate contact info
    //         if (!formData.contact_info?.email || !formData.contact_info?.phone) {
    //             validationResults.is_valid = false;
    //             validationResults.errors.push('Contact information is required');
    //         }

    //         // Validate passengers
    //         if (!formData.passengers || formData.passengers.length === 0) {
    //             validationResults.is_valid = false;
    //             validationResults.errors.push('At least one passenger is required');
    //         }

    //         // Validate passenger data
    //         if (formData.passengers) {
    //             formData.passengers.forEach((passenger, index) => {
    //                 if (!passenger.fullname || !passenger.date_of_birth || !passenger.passenger_type) {
    //                     validationResults.is_valid = false;
    //                     validationResults.errors.push(`Passenger ${index + 1}: Missing required information`);
    //                 }
    //             });
    //         }

    //         // Validate seat selections
    //         const expectedSeatCount = (formData.passengers?.length || 0) * (formData.flight_selections?.length || 0);
    //         if (formData.seat_selections?.length !== expectedSeatCount) {
    //             validationResults.is_valid = false;
    //             validationResults.errors.push('Please select seats for all passengers on all flights');
    //         }

    //         // Check for infant-adult ratio
    //         const adults = formData.passengers?.filter(p => p.passenger_type === 'adult')?.length || 0;
    //         const infants = formData.passengers?.filter(p => p.passenger_type === 'infant')?.length || 0;

    //         if (infants > adults) {
    //             validationResults.is_valid = false;
    //             validationResults.errors.push('Each infant must be accompanied by an adult');
    //         }

    //         return validationResults;
    //     } catch (error) {
    //         console.error('Error validating booking form:', error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Calculate booking pricing preview
    //  */
    // async calculateBookingPreview(formData) {
    //     try {
    //         const pricing = {
    //             flight_fares: 0,
    //             seat_fees: 0,
    //             service_fees: 0,
    //             taxes: 0,
    //             service_charges: 0,
    //             total: 0,
    //             breakdown: []
    //         };

    //         // Calculate flight fares by passenger type
    //         if (formData.passengers && formData.flight_selections) {
    //             formData.passengers.forEach(passenger => {
    //                 let baseFare = 1000000; // Should come from FlightFare table

    //                 if (passenger.passenger_type === 'child') {
    //                     baseFare = baseFare * 0.75;
    //                 } else if (passenger.passenger_type === 'infant') {
    //                     baseFare = baseFare * 0.1;
    //                 }

    //                 pricing.flight_fares += baseFare * formData.flight_selections.length;

    //                 pricing.breakdown.push({
    //                     item: `${passenger.fullname} (${passenger.passenger_type})`,
    //                     amount: baseFare * formData.flight_selections.length,
    //                     type: 'fare'
    //                 });
    //             });
    //         }

    //         // Calculate seat fees
    //         if (formData.seat_selections) {
    //             // TODO: Get actual seat pricing
    //             pricing.seat_fees = formData.seat_selections.length * 50000; // Mock data
    //         }

    //         // Calculate service fees
    //         if (formData.service_selections) {
    //             formData.service_selections.forEach(selection => {
    //                 const serviceFee = 100000 * (selection.quantity || 1); // Mock data
    //                 pricing.service_fees += serviceFee;

    //                 pricing.breakdown.push({
    //                     item: `Service for passenger ${selection.passenger_index + 1}`,
    //                     amount: serviceFee,
    //                     type: 'service'
    //                 });
    //             });
    //         }

    //         // Calculate taxes and fees
    //         pricing.taxes = pricing.flight_fares * 0.1;
    //         pricing.service_charges = 50000 * (formData.passengers?.length || 0);

    //         pricing.total = pricing.flight_fares + pricing.seat_fees +
    //             pricing.service_fees + pricing.taxes + pricing.service_charges;

    //         return pricing;
    //     } catch (error) {
    //         console.error('Error calculating booking preview:', error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Get booking summary for confirmation
    //  */
    // async getBookingSummary(bookingData) {
    //     try {
    //         // Get flight details
    //         const flightDetails = await this.flightService.getFlightScheduleDetails(
    //             bookingData.flight_selections.map(f => f.flight_schedule_id)
    //         );

    //         // Calculate pricing
    //         const pricing = await this.calculateBookingPreview(bookingData);

    //         return {
    //             flights: flightDetails,
    //             passengers: bookingData.passengers,
    //             contact_info: bookingData.contact_info,
    //             seat_summary: this.formatSeatSummary(bookingData.seat_selections),
    //             service_summary: this.formatServiceSummary(bookingData.service_selections),
    //             pricing: pricing,
    //             booking_rules: {
    //                 expires_in_minutes: 15,
    //                 cancellation_policy: 'Free cancellation within 24 hours',
    //                 baggage_policy: '7kg cabin baggage included'
    //             }
    //         };
    //     } catch (error) {
    //         console.error('Error getting booking summary:', error);
    //         throw error;
    //     }
    // }

    // // Helper methods
    // formatSeatSummary(seatSelections) {
    //     // Group seats by flight
    //     const seatsByFlight = {};
    //     seatSelections?.forEach(selection => {
    //         const flightKey = `flight_${selection.flight_index}`;
    //         if (!seatsByFlight[flightKey]) {
    //             seatsByFlight[flightKey] = [];
    //         }
    //         seatsByFlight[flightKey].push({
    //             passenger_index: selection.passenger_index,
    //             seat_number: selection.seat_number
    //         });
    //     });
    //     return seatsByFlight;
    // }

    // formatServiceSummary(serviceSelections) {
    //     const summary = {
    //         meals: [],
    //         baggage: [],
    //         others: []
    //     };

    //     serviceSelections?.forEach(selection => {
    //         const category = selection.category?.toLowerCase() || 'others';
    //         if (summary[category]) {
    //             summary[category].push(selection);
    //         } else {
    //             summary.others.push(selection);
    //         }
    //     });

    //     return summary;
    // }
}

module.exports = BookingPageService;