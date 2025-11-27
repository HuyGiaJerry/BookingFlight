const express = require('express');
const SeatSelectionController = require('../../controllers/seat-selection-controller');

const router = express.Router();
const seatSelectionController = new SeatSelectionController();

/**
 * 🎯 REAL-TIME SEAT SELECTION ROUTES
 */

// ⚡ REAL-TIME APIs (Instant feedback)
// POST /api/v1/seat-selection/select-seat
// User clicks 1 seat → instant subtotal update
router.post('/select-seat', seatSelectionController.selectIndividualSeat);

// DELETE /api/v1/seat-selection/remove-seat
// User unselects 1 seat → instant subtotal update
router.delete('/remove-seat', seatSelectionController.removeSeatForPassenger);

// 📊 SESSION MANAGEMENT
// GET /api/v1/seat-selection/:sessionId
// Load selections when user reloads page
router.get('/:sessionId', seatSelectionController.getSessionSelections);

// DELETE /api/v1/seat-selection/:sessionId
// Cancel entire booking session
router.delete('/:sessionId', seatSelectionController.cancelSeatSelections);

// PUT /api/v1/seat-selection/:sessionId/extend
// Extend session when nearly expired
router.put('/:sessionId/extend', seatSelectionController.extendSession);

// ✅ THÊM: Complete seat selection → Go to booking page
// POST /api/v1/seat-selection/:sessionId/complete
router.post('/:sessionId/complete', seatSelectionController.completeSeatSelection);

module.exports = router;