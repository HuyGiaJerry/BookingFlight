const seatClassMap = {
    ECONOMY: "Economy",
    BUSINESS: "Business",
    FIRST: "First",
    PREMIUM: "Premium Economy",
    PREMIUM_ECONOMY: "Premium Economy",
};

function normalizeSeatClass(input) {
    if (!input) return null;

    const key = input.toUpperCase().trim().replace(/\s+/g, "_");

    return seatClassMap[key] || null;
}

module.exports = { normalizeSeatClass };
