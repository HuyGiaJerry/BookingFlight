const { Server } = require('socket.io');
const { SeatSelectionService } = require('../services')

function initSeatSelectionSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    const seatSelectionService = new SeatSelectionService();

    io.on('connection', (socket) => {
        const { booking_session_id , flight_schedule_id } = socket.handshake.query;

        if (!booking_session_id || !flight_schedule_id) {
            console.log('❌ Socket without booking_session_id or flight_schedule_id, disconnect');
            socket.disconnect(true);
            return;
        }

        const userRoom = `session:${booking_session_id}`;
        const flightRoom = `flight:${flight_schedule_id}`;
        socket.join(userRoom);
        socket.join(flightRoom);
        
        console.log(`🔌 Socket connected: ${socket.id} joined rooms ${userRoom} and ${flightRoom}`);


        //  chọn ghế 
        socket.on('seat:select', async (payload, cb) => {
            try {
                const result = await seatSelectionService.selectIndividualSeat({ ...payload, booking_session_id , flight_schedule_id });

                // real time đa người dùng 
                socket.to(flightRoom).emit('seat:locked', {
                    flight_seat_id: result.flight_seat_id,
                    passenger_index: result.passenger_index,
                    session: booking_session_id
                });

                // sync đa tab user -> userRoom
                socket.to(userRoom).emit('seat:selected', result);

                cb?.({success: true, data: result});
            } catch (err) {
                console.error('Error in seat:select socket event:', err);
                cb?.({success: false, message: err.message});
            }
        });

        //  bỏ ghế 
        socket.on('seat:remove', async (payload, cb) => {
            try {
                const result = await seatSelectionService.removeSeatForPassenger({ ...payload, booking_session_id, flight_schedule_id });
                // real time đa người dùng
                socket.to(flightRoom).emit('seat:unlocked', {
                    flight_seat_id: result.flight_seat_id,
                    passenger_index: result.passenger_index
                });
                // sync đa tab user -> userRoom
                socket.to(userRoom).emit('seat:removed', result);

                cb?.({success: true, data: result});
            } catch (err) {
                console.error('Error in seat:remove socket event:', err);
                cb?.({success: false, message: err.message});
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id} left room ${room}`);
        });
    });

    return io;

}

module.exports = initSeatSelectionSocket;