const { StatusCodes } = require('http-status-codes');
const { SeatRepository } = require('../repositories');
const { FlightFare } = require('../models');
const AppError = require('../utils/errors/app-error');

class SeatService {
    constructor() {
        this.seatRepository = new SeatRepository();
    }

    /**
     * ✅ NEW: Get Traveloka-style seat matrix với pricing colors
     * 🎯 Màu sắc dựa vào price_adjustment, không phải status
     */
    async getTravelokaSeatMatrix(flightScheduleId) {
        try {
            console.log('🚀 Getting Traveloka seat matrix for flight:', flightScheduleId);

            const seatMapData = await this.seatRepository.getFlightSeatMap(flightScheduleId);

            if (!seatMapData || !seatMapData.seat_map) {
                return {
                    flight_schedule_id: flightScheduleId,
                    error: 'No seat data available'
                };
            }

            const { seat_map, airplane } = seatMapData;

            // ✅ Get base prices từ FlightFare
            const basePrices = await this.getBasePricesFromFlightFare(flightScheduleId);

            // ✅ Build enhanced seat data với full pricing
            const enhancedSeatMap = this.buildEnhancedSeatMap(seat_map, basePrices);

            // ✅ Build pricing-based matrix (F=Free, L=Low, P=Premium, X=Unavailable, B=Booked)
            const matrixData = this.buildPricingMatrix(enhancedSeatMap);

            // ✅ Build seat mappings
            const seatIds = this.buildSeatIdMap(enhancedSeatMap);
            const seatPricing = this.buildTravelokaSeatPricing(enhancedSeatMap);

            return {
                flight_schedule_id: flightScheduleId,
                aircraft: {
                    model: airplane?.model || 'Unknown',
                    total_seats: enhancedSeatMap.length
                },

                // ✅ CORE: Pricing-based seat matrix
                seats: {
                    data: matrixData.rows,           // ["FLP|XBF"] - tiers based on price
                    layout: matrixData.layout_pattern // "ABC|DEF"
                },

                // ✅ SEAT SELECTION DATA
                seatIds: seatIds,                    // {"1A": 28641} - for booking
                seatPricing: seatPricing,            // {"1A": {adjustment: 8.91, tier: "L"}}

                // ✅ LEGEND for frontend colors
                legend: {
                    "F": { "label": "Free", "color": "#2196F3", "description": "No extra charge" },
                    "L": { "label": "Low Price", "color": "#4CAF50", "description": "USD 1-10" },
                    "P": { "label": "Premium", "color": "#FF5722", "description": "USD 10+" },
                    "X": { "label": "Unavailable", "color": "#9E9E9E", "description": "Cannot select" },
                    "B": { "label": "Booked", "color": "#757575", "description": "Already taken" }
                },

                // ✅ STATS for display
                stats: {
                    total: enhancedSeatMap.length,
                    available: enhancedSeatMap.filter(s => s.status === 'available').length,
                    free_seats: enhancedSeatMap.filter(s => s.status === 'available' && s.display_price === 0).length,
                    paid_seats: enhancedSeatMap.filter(s => s.status === 'available' && s.display_price > 0).length
                }
            };

        } catch (error) {
            console.error('❌ Error getting Traveloka seat matrix:', error);
            return {
                flight_schedule_id: flightScheduleId,
                error: error.message
            };
        }
    }

    /**
     * ✅ Get base prices từ FlightFare table
     */
    async getBasePricesFromFlightFare(flightScheduleId) {
        try {
            const flightFares = await FlightFare.findAll({
                where: {
                    flight_schedule_id: flightScheduleId,
                    status: 'available'
                },
                include: [
                    {
                        model: require('../models').SeatClass,
                        as: 'seatClass',
                        attributes: ['class_code', 'class_name']
                    }
                ]
            });

            const basePrices = {};
            flightFares.forEach(fare => {
                const classCode = fare.seatClass?.class_code;
                if (classCode) {
                    basePrices[classCode] = {
                        base: parseFloat(fare.base_price) || 0,
                        tax: parseFloat(fare.tax) || 0,
                        service_fee: parseFloat(fare.service_fee) || 0
                    };
                }
            });

            return basePrices;
        } catch (error) {
            console.error('Error getting base prices:', error);
            return {};
        }
    }

    /**
     * ✅ Build enhanced seat map với full pricing info
     */
    buildEnhancedSeatMap(seatMap, basePrices) {
        return seatMap.map(seat => {
            const adjustment = parseFloat(seat.price_adjustment) || 0;

            return {
                ...seat,
                display_price: adjustment,           // ✅ CHỈ adjustment cho UI
                seat_surcharge: adjustment,          // ✅ Phí ghế 
                // ❌ XÓA: base_price, final_price
                pricing_tier: this.calculatePricingTier(seat.status, adjustment)
            };
        });
    }

    /**
     * ✅ Calculate pricing tier cho Traveloka colors
     */
    calculatePricingTier(status, adjustment) {
        // Check availability first
        if (status === 'booked') return 'B';      // Booked (gray)
        if (status === 'blocked' || status === 'maintenance') return 'X'; // Unavailable (gray)
        if (status !== 'available') return 'X';

        // Available seats - tier by adjustment price
        if (adjustment === 0) return 'F';         // 🔵 Free (blue)
        if (adjustment <= 100000) return 'L';         // 🟢 Low price (green)
        return 'P';                               // 🟠 Premium (orange)
    }

    /**
     * ✅ Build pricing matrix cho frontend rendering
     */
    buildPricingMatrix(enhancedSeatMap) {
        const rowsData = {};

        enhancedSeatMap.forEach(seat => {
            const row = seat.seat_row;
            if (!rowsData[row]) {
                rowsData[row] = {};
            }
            rowsData[row][seat.seat_column] = seat.pricing_tier;
        });

        // Build layout pattern
        const allColumns = new Set();
        Object.values(rowsData).forEach(rowData => {
            Object.keys(rowData).forEach(col => allColumns.add(col));
        });
        const columns = Array.from(allColumns).sort();
        const layoutPattern = this.determineLayoutPattern(columns);

        // Build matrix rows
        const sortedRows = Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b));
        const matrixRows = [];

        sortedRows.forEach(rowNum => {
            const rowData = rowsData[rowNum];
            let rowString = '';

            layoutPattern.split('').forEach(char => {
                if (char === '|') {
                    rowString += '|';
                } else {
                    rowString += rowData[char] || '-';
                }
            });

            matrixRows.push(rowString);
        });

        return {
            rows: matrixRows,
            layout_pattern: layoutPattern
        };
    }

    /**
     * ✅ Build seat ID mapping cho seat selection
     */
    buildSeatIdMap(enhancedSeatMap) {
        const seatIds = {};
        enhancedSeatMap.forEach(seat => {
            if (seat.seat_id) { // flight_seat_id from FlightSeat table
                seatIds[seat.seat_number] = seat.seat_id;
            }
        });
        return seatIds;
    }

    /**
     * ✅ Build Traveloka seat pricing cho selection
     */
    buildTravelokaSeatPricing(enhancedSeatMap) {
        const pricing = {};

        enhancedSeatMap.forEach(seat => {
            pricing[seat.seat_number] = {
                // ✅ CHỈ HIỂN THỊ ADJUSTMENT (seat surcharge)
                adjustment: seat.display_price,      // USD 8.91 - phí ghế
                tier: seat.pricing_tier,            // F, L, P, X, B - màu
                is_available: seat.status === 'available',
                is_selectable: seat.status === 'available',

                // ✅ BOOKING DATA (chỉ adjustment, không có base_price)
                flight_seat_id: seat.seat_id,
                seat_surcharge: seat.display_price,  // ✅ Phí ghế (adjustment only)
                // ❌ XÓA: base_price, final_price

                // ✅ FEATURES
                features: this.getSeatFeatures(seat)
            };
        });

        return pricing;
    }

    getSeatFeatures(seat) {
        const features = [];
        if (seat.is_window) features.push('window');
        if (seat.is_aisle) features.push('aisle');
        if (seat.is_exit_row) features.push('exitRow');
        return features;
    }

    determineLayoutPattern(columns) {
        const columnCount = columns.length;

        if (columnCount === 6) {
            const hasB = columns.includes('B');
            const hasE = columns.includes('E');

            if (!hasB && !hasE) {
                return 'AC|DF'; // Business: A,C,D,F
            } else if (hasB && hasE) {
                return 'ABC|DEF'; // Economy: A,B,C,D,E,F
            }
        }

        const layoutPatterns = {
            3: 'ABC',
            4: 'ABCD',
            6: 'ABC|DEF',
            8: 'ABCD|EFGH'
        };

        return layoutPatterns[columnCount] || columns.join('');
    }

    // ✅ KEEP: Existing methods for backward compatibility
    async getCompactSeatMatrix(flightScheduleId) {
        // Redirect to Traveloka method
        return await this.getTravelokaSeatMatrix(flightScheduleId);
    }

    async getFlightSeatMapWithPricing(flightScheduleId, seatClassId = null) {
        // Keep for admin/detailed view
        try {
            const seatMapData = await this.seatRepository.getFlightSeatMap(flightScheduleId);

            let seatMap = seatMapData.seat_map;
            if (seatClassId) {
                seatMap = seatMap.filter(seat => seat.seat_class.id === seatClassId);
            }

            const seatsByClass = this.groupSeatsByClass(seatMap);
            const seatLayout = this.generateSeatLayout(seatMap);

            return {
                flight_info: {
                    flight_schedule_id: flightScheduleId,
                    airplane: seatMapData.airplane
                },
                seat_classes: seatsByClass,
                seat_layout: seatLayout,
                total_seats: seatMap.length,
                available_seats: seatMap.filter(s => s.status === 'available').length
            };
        } catch (error) {
            console.error('Error getting flight seat map with pricing:', error);
            throw error;
        }
    }

    // ✅ REMOVED: Old helper methods that are no longer needed
    // - buildClassMap(), buildFeaturesMap(), buildBlockedMap(), buildBookedList()
    // - buildPriceMapFromDB() (replaced with getBasePricesFromFlightFare())
}

module.exports = SeatService;