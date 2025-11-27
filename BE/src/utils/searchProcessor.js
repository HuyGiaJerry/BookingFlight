function applyFiltersAndSorting(rawData, query) {
    let flights = [...rawData.flights];

    // --- FILTER AIRLINE ---
    if (query.airline) {
        const allowed = query.airline.split(',');
        flights = flights.filter(f =>
            allowed.includes(f.flight.airline.iata_code)
        );
    }

    // --- FILTER PRICE RANGE ---
    if (query.priceRange) {
        const [min, max] = query.priceRange.split('-').map(Number);
        flights = flights.filter(f =>
            f.pricePerson >= min && f.pricePerson <= max
        );
    }

    // --- FILTER DURATION RANGE ---
    if (query.durationRange) {
        const [minD, maxD] = query.durationRange.split('-').map(Number);
        flights = flights.filter(f => {
            return (
                f.flight.duration_minutes >= minD &&
                f.flight.duration_minutes <= maxD
            );
        });
    }

    // --- SORT ---
    if (query.sort) {
        const sorts = query.sort.split(',');

        flights.sort((a, b) => {
            for (let rule of sorts) {
                const [field, dir] = rule.split(':');
                let x, y;

                switch (field) {
                    case 'price':
                        x = a.pricePerson; y = b.pricePerson;
                        break;
                    case 'duration':
                        x = a.flight.duration_minutes; y = b.flight.duration_minutes;
                        break;
                    case 'departure':
                        x = toTimestamp(a.departureDate, a.departureTime);
                        y = toTimestamp(b.departureDate, b.departureTime);
                        break;
                    case 'arrival':
                        x = toTimestamp(a.arrivalDate, a.arrivalTime);
                        y = toTimestamp(b.arrivalDate, b.arrivalTime);
                        break;
                    default:
                        continue;
                }

                if (x < y) return dir === 'asc' ? -1 : 1;
                if (x > y) return dir === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    return {
        ...rawData,
        flights
    };
}
function toTimestamp(date, time) {
    return new Date(
        `${date.year}-${date.month}-${date.day}T${time.hour}:${time.minute}:00`
    ).getTime();
}

module.exports = { applyFiltersAndSorting };
