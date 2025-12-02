const { StatusCodes } = require('http-status-codes');
const { SeatRepository } = require('../repositories');
const { FlightFare } = require('../models');
const AppError = require('../utils/errors/app-error');

class SeatService {
    constructor() {
        this.seatRepository = new SeatRepository();
    }

    /**
     * ✅ UPDATED: Get Traveloka seat matrix với class filter
     */

    detectAisles(columns, seatMap) {
        const aisleIndexes = [];

        for (let i = 0; i < columns.length - 1; i++) {
            const colLeft = columns[i];
            const colRight = columns[i + 1];

            const leftHasAisle = seatMap.some(
                s => s.seat_column === colLeft && s.is_aisle
            );
            const rightHasAisle = seatMap.some(
                s => s.seat_column === colRight && s.is_aisle
            );

            // Nếu ghế ở cả 2 cột đều sát lối đi -> lối đi nằm giữa
            if (leftHasAisle && rightHasAisle) {
                aisleIndexes.push(i + 1);
                // => ví dụ C (index 2) và D (index 3) -> aisle = 3
            }
        }

        return aisleIndexes;
    }

    debugAisles(columns, seatMap, aisles) {
        console.log("\n====== AISLE DEBUG ======");

        console.log("Columns:", columns);
        console.log("Detected aisles (indexes):", aisles);
        aisles.forEach(a => {
            console.log(` -> Aisle nằm giữa ${columns[a - 1]} | ${columns[a]}`);
        });

        console.log("\nSeat window/aisle flags per column:");
        columns.forEach(col => {
            const seatsInCol = seatMap.filter(s => s.seat_column === col);
            const hasAisleSeat = seatsInCol.some(s => s.is_aisle);
            console.log(` - Column ${col}: is_aisle = ${hasAisleSeat}`);
        });

        console.log("==========================\n");
    }

    async getTravelokaSeatMatrix(flightScheduleId, seatClassId = null) {
        try {
            console.log('🚀 Getting Traveloka seat matrix for flight:', flightScheduleId, 'class:', seatClassId);

            const seatMapData = await this.seatRepository.getFlightSeatMap(flightScheduleId, seatClassId);

            if (!seatMapData || !seatMapData.seat_map || seatMapData.seat_map.length === 0) {
                return {
                    flight_schedule_id: flightScheduleId,
                    seat_class_id: seatClassId,
                    error: `No seat data available${seatClassId ? ' for this class' : ''}`
                };
            }

            const { seat_map, airplane } = seatMapData;

            // ✅ Get base prices từ FlightFare (filter by class nếu có)
            const basePrices = await this.getBasePricesFromFlightFare(flightScheduleId, seatClassId);

            // ✅ Build enhanced seat data với full pricing
            const enhancedSeatMap = this.buildEnhancedSeatMap(seat_map, basePrices);

            // ✅ DEBUG: Add layout debugging
            const debugInfo = this.debugSeatLayout(enhancedSeatMap);

            // ✅ Build pricing-based matrix 
            const matrixData = this.buildPricingMatrix(enhancedSeatMap);

            // ✅ Build seat mappings
            const seatIds = this.buildSeatIdMap(enhancedSeatMap);
            const seatPricing = this.buildTravelokaSeatPricing(enhancedSeatMap);

            return {
                flight_schedule_id: flightScheduleId,
                seat_class_id: seatClassId,
                aircraft: {
                    model: airplane?.model || 'Unknown',
                    total_seats: enhancedSeatMap.length
                },

                // ✅ CLASS INFO (nếu filter by class)
                class_info: seatClassId ? {
                    class_id: seatClassId,
                    class_code: enhancedSeatMap[0]?.seat_class?.class_code,
                    class_name: enhancedSeatMap[0]?.seat_class?.class_name
                } : null,

                // ✅ CORE: Pricing-based seat matrix
                seats: {
                    data: matrixData.rows,           // ["PB|--"] -> ["PB|XP"]
                    layout: matrixData.layout_pattern // "AD|GK" -> "AC|DF"
                },

                // ✅ SEAT SELECTION DATA
                seatIds: seatIds,                    // {"1A": 28641}
                seatPricing: seatPricing,            // {"1A": {adjustment: 8.91, tier: "L"}}

                // ✅ DEBUG INFO (remove in production)
                debug: debugInfo,

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
                seat_class_id: seatClassId,
                error: error.message
            };
        }
    }

    /**
     * ✅ UPDATED: Get base prices với class filter
     */
    async getBasePricesFromFlightFare(flightScheduleId, seatClassId = null) {
        try {
            const whereCondition = {
                flight_schedule_id: flightScheduleId,
                status: 'available'
            };

            // ✅ THÊM: Filter by seat class nếu có
            if (seatClassId) {
                whereCondition.seat_class_id = seatClassId;
            }

            const flightFares = await FlightFare.findAll({
                where: whereCondition,
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
     * ✅ NEW: Get seat count summary by class
     */
    async getSeatClassSummary(flightScheduleId) {
        try {
            return await this.seatRepository.getSeatCountByClass(flightScheduleId);
        } catch (error) {
            console.error('Error getting seat class summary:', error);
            throw error;
        }
    }

    /**
     * ✅ NEW: Get seats for specific class only
     */
    async getSeatsByClass(flightScheduleId, seatClassId) {
        try {
            return await this.getTravelokaSeatMatrix(flightScheduleId, seatClassId);
        } catch (error) {
            console.error('Error getting seats by class:', error);
            throw error;
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
                display_price: adjustment,
                seat_surcharge: adjustment,
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
     * ✅ FIXED: Build pricing matrix với better error handling
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

        // ✅ Get actual columns from seat data
        const allColumns = new Set();
        Object.values(rowsData).forEach(rowData => {
            Object.keys(rowData).forEach(col => allColumns.add(col));
        });
        const columns = Array.from(allColumns).sort();

        console.log(`🔍 DEBUG: Building matrix with columns: [${columns.join(', ')}]`);

        const layoutPattern = this.determineLayoutPattern(columns);

        // ✅ Build matrix rows - ensure all pattern characters are handled
        const sortedRows = Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b));
        const matrixRows = [];

        sortedRows.forEach(rowNum => {
            const rowData = rowsData[rowNum];
            let rowString = '';

            // ✅ FIXED: Process each character in layout pattern
            layoutPattern.split('').forEach(char => {
                if (char === '|') {
                    rowString += '|';
                } else {
                    // ✅ Check if this column exists in actual data
                    const seatValue = rowData[char];
                    if (seatValue !== undefined) {
                        rowString += seatValue;
                    } else {
                        console.log(`⚠️ WARNING: Column '${char}' not found in row ${rowNum}, available: [${Object.keys(rowData).join(', ')}]`);
                        rowString += '-'; // Missing seat
                    }
                }
            });

            matrixRows.push(rowString);
            console.log(`📋 Row ${rowNum}: "${rowString}" (pattern: "${layoutPattern}")`);
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

    /**
     * ✅ FIXED: Determine layout pattern dựa trên actual columns
     */
    determineLayoutPattern(columns) {
        const columnCount = columns.length;
        const sortedColumns = [...columns].sort(); // ✅ Sort actual columns

        console.log(`🔍 DEBUG: Columns found: [${sortedColumns.join(', ')}], Count: ${columnCount}`);

        // ✅ FIXED: Handle specific column combinations
        if (columnCount === 4) {
            // First Class hoặc Business có thể có: A,C,D,F hoặc A,D,G,K
            if (sortedColumns.join('') === 'ACDF') {
                return 'AC|DF'; // First Class: A,C | D,F
            } else if (sortedColumns.join('') === 'ADGK') {
                return 'AD|GK'; // Business: A,D | G,K  
            }
            // Fallback cho 4 cột khác
            return sortedColumns.slice(0, 2).join('') + '|' + sortedColumns.slice(2).join('');
        }

        if (columnCount === 6) {
            const hasB = columns.includes('B');
            const hasE = columns.includes('E');

            if (!hasB && !hasE) {
                // Business class: A,C,D,F (6 cột nhưng không có B,E)
                return 'AC|DF'; // Nhưng này chỉ 4 cột, cần xử lý khác
            } else if (hasB && hasE) {
                return 'ABC|DEF'; // Economy: A,B,C,D,E,F
            }
        }

        if (columnCount === 2) {
            // First class 2 cột
            return sortedColumns.join('|'); // A|F
        }

        // ✅ GENERAL: Dynamic layout based on actual columns
        const layoutPatterns = {
            2: () => sortedColumns.join('|'),     // A|F
            3: () => sortedColumns.join(''),      // ABC
            4: () => sortedColumns.slice(0, 2).join('') + '|' + sortedColumns.slice(2).join(''), // AC|DF
            6: () => sortedColumns.slice(0, 3).join('') + '|' + sortedColumns.slice(3).join(''), // ABC|DEF
            7: () => sortedColumns.slice(0, 3).join('') + '|' + sortedColumns.slice(3).join(''), // ABC|DEFG
            8: () => sortedColumns.slice(0, 4).join('') + '|' + sortedColumns.slice(4).join(''), // ABCD|EFGH
            9: () => sortedColumns.slice(0, 3).join('') + '|' + sortedColumns.slice(3, 6).join('') + '|' + sortedColumns.slice(6).join('')
        };

        const patternFunc = layoutPatterns[columnCount];
        if (patternFunc) {
            const pattern = patternFunc();
            console.log(`✅ Generated pattern: "${pattern}" for columns: [${sortedColumns.join(', ')}]`);
            return pattern;
        }

        // ✅ FALLBACK: Join all columns
        const fallbackPattern = sortedColumns.join('');
        console.log(`⚠️ Fallback pattern: "${fallbackPattern}" for columns: [${sortedColumns.join(', ')}]`);
        return fallbackPattern;
    }

    /**
     * ✅ NEW: Debug seat layout issues
     */
    debugSeatLayout(enhancedSeatMap) {
        console.log('\n🔧 SEAT LAYOUT DEBUG:');

        // Group by row
        const rowsData = {};
        enhancedSeatMap.forEach(seat => {
            const row = seat.seat_row;
            if (!rowsData[row]) rowsData[row] = [];
            rowsData[row].push({
                col: seat.seat_column,
                seat: seat.seat_number,
                tier: seat.pricing_tier
            });
        });

        // Show each row
        Object.keys(rowsData).sort((a, b) => parseInt(a) - parseInt(b)).forEach(row => {
            const seats = rowsData[row].sort((a, b) => a.col.localeCompare(b.col));
            const columns = seats.map(s => s.col).join(',');
            const tiers = seats.map(s => s.tier).join('');
            console.log(`Row ${row}: [${columns}] -> "${tiers}"`);
        });

        // Show available columns
        const allColumns = [...new Set(enhancedSeatMap.map(s => s.seat_column))].sort();
        console.log(`All columns: [${allColumns.join(', ')}]`);

        return {
            rows_data: rowsData,
            all_columns: allColumns,
            seat_count: enhancedSeatMap.length
        };
    }

    // ✅ KEEP: Existing methods for backward compatibility
    async getCompactSeatMatrix(flightScheduleId) {
        // Redirect to Traveloka method
        return await this.getTravelokaSeatMatrix(flightScheduleId);
    }

    async getFlightSeatMapWithPricing(flightScheduleId, seatClassId = null) {
        // Keep for admin/detailed view
        try {
            const seatMapData = await this.seatRepository.getFlightSeatMap(flightScheduleId, seatClassId);

            let seatMap = seatMapData.seat_map;

            const seatsByClass = this.groupSeatsByClass(seatMap);
            const seatLayout = this.generateSeatLayout(seatMap);

            return {
                flight_info: {
                    flight_schedule_id: flightScheduleId,
                    seat_class_id: seatClassId,
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

    groupSeatsByClass(seatMap) {
        const grouped = {};

        seatMap.forEach(seat => {
            const classId = seat.seat_class.id;
            if (!grouped[classId]) {
                grouped[classId] = {
                    class_info: seat.seat_class,
                    seats: []
                };
            }
            grouped[classId].seats.push(seat);
        });

        return grouped;
    }

    generateSeatLayout(seatMap) {
        const layout = {};

        seatMap.forEach(seat => {
            const row = seat.seat_row;
            if (!layout[row]) {
                layout[row] = {};
            }
            layout[row][seat.seat_column] = {
                seat_number: seat.seat_number,
                status: seat.status,
                price_adjustment: seat.price_adjustment,
                seat_class: seat.seat_class
            };
        });

        return layout;
    }



    async getSeatLayoutForFrontend(flightScheduleId, seatClassName = null) {
        const seatMapData = await this.seatRepository.getFlightSeatMap(
            flightScheduleId
        );



        const { seat_map, airplane } = seatMapData;

        if (!seat_map || seat_map.length === 0) {
            return { seats: [], layout: {}, seatTypes: [] };
        }

        // Lấy danh sách cột A B C D E F từ DB
        const columns = [...new Set(seat_map.map(s => s.seat_column))].sort();

        // Lấy số row tối đa
        const totalRows = Math.max(...seat_map.map(s => s.seat_row));

        const aisleIndexes = this.detectAisles(columns, seat_map);

        this.debugAisles(columns, seat_map, aisleIndexes);

        // Tạo layout FE
        const layout = {
            rows: totalRows,
            columns,
            aisles: aisleIndexes // bạn tự set hoặc detect
        };

        // Build seatTypes theo price_adjustment
        const seatTypes = this.buildSeatTypes();

        // Build danh sách seats FE
        // const seats = seat_map.map(seat => ({

        //     flightSeatId: seat.seat_id,
        //     seatNumber: seat.seat_number,
        //     row: seat.seat_row,
        //     column: seat.seat_column,
        //     typeCode: this.getTypeCodeFromAdjustment(seat.price_adjustment, seat.seat_class.class_code),
        //     status: seat.status.toUpperCase(),
        //     seat_class : seat.seat_class,
        //     priceAdjustment: parseFloat(seat.price_adjustment) || 0
        // }));

        let seats = seat_map.map(seat => {
            const isClassMatched =
                !seatClassName || seat.seat_class.class_name === seatClassName;

            return {
                flightSeatId: seat.id,
                seatNumber: seat.seat_number,
                row: seat.seat_row,
                column: seat.seat_column,
                typeCode: seat.type_code,
                status: isClassMatched ? seat.status.toUpperCase() : "NOT_IN_CLASS",
                seat_class: seat.seat_class,
                priceAdjustment: seat.price_adjustment
            };
        });



        return { layout, seats, seatTypes };
    }
    buildSeatTypes() {
        return [
            { code: "STD", label: "Ghế thường", price: 0, color: "#3b82f6" },
            { code: "LOW", label: "Low price", price: 20000, color: "#22c55e" },
            { code: "PREM", label: "Premium", price: 50000, color: "#f97316" },
            { code: "EXIT", label: "Exit Row", price: 35000, color: "#ff9800" }
        ];
    }

    getTypeCodeFromAdjustment(adjustment, classCode) {
        if (adjustment === 0) return "STD";
        if (adjustment <= 25000) return "LOW";
        if (adjustment <= 50000) return "PREM";
        return "PREM";
    }






}
module.exports = SeatService;