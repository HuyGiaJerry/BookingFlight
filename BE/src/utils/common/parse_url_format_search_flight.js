function parseUrlFormatSearchFlight(query) {
    const params = {};

    // trip_type
    if (query.tt) {
        switch (query.tt.toLowerCase()) {
            case 'oneway':
            case 'one-way':
            case 'ow':
                params.trip_type = 'one-way';
                break;
            case 'roundtrip':
            case 'round-trip':
            case 'rt':
                params.trip_type = 'round-trip';
                break;
            default:
                params.trip_type = 'one-way';
        }
    }

    // airports
    if (query.ap) {
        const [from_airport_id, to_airport_id] = query.ap.split('.');
        params.from_airport_id = parseInt(from_airport_id);
        params.to_airport_id = parseInt(to_airport_id);
    }

    // dates - Support both dd-mm-yyyy and yyyy-mm-dd formats
    if (query.dt) {
        const dates = query.dt.split('.');

        // Helper function to parse date in multiple formats
        function parseDate(dateString) {
            if (!dateString) return null;

            // Check if format is yyyy-mm-dd (4 digits year first)
            if (dateString.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
                // Already in yyyy-mm-dd format
                const [year, month, day] = dateString.split('-');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            // Check if format is dd-mm-yyyy (day first)
            else if (dateString.match(/^\d{1,2}-\d{1,2}-\d{4}$/)) {
                const [day, month, year] = dateString.split('-');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            // Check if format is mm/dd/yyyy
            else if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                const [month, day, year] = dateString.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            console.error(`❌ Unsupported date format: ${dateString}`);
            return null;
        }

        // departure date
        if (dates[0]) {
            params.departure_date = parseDate(dates[0]);
        }

        // return date
        if (dates[1]) {
            params.return_date = parseDate(dates[1]);
        }
    }

    // ✅ FIXED: passengers: 'adults.children.infants'  
    if (query.ps) {
        const [adults, children, infants] = query.ps.split('.');
        params.adult_count = parseInt(adults) || 1;       // ✅ Changed to adult_count
        params.child_count = parseInt(children) || 0;     // ✅ Keeps child_count
        params.infant_count = parseInt(infants) || 0;     // ✅ Keeps infant_count
    } else {
        // Default values
        params.adult_count = 1;    // ✅ Changed to adult_count
        params.child_count = 0;
        params.infant_count = 0;
    }

    // pagination
    params.page = parseInt(query.page) || 1;
    params.limit = parseInt(query.limit) || 10;

    // sorting
    if (query.sort) {
        const [sort_by, sort_order] = query.sort.split('.');
        params.sort_by = sort_by || 'departure_time';
        params.sort_order = (sort_order || 'asc').toUpperCase();
    }

    // seat class
    if (query.sc) {
        params.preferred_class = query.sc;
    }

    return params;
}

module.exports = {
    parseUrlFormatSearchFlight
};