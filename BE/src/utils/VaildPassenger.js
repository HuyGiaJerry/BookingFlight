const VaildPassenger = (ps) => {

    const parts = ps.split('.')

    if (parts.length !== 3) throw new Error('Invalid passenger format')

    const [adultStr, childStr, infantStr] = parts.map(s => s.trim())

    // check tất cả đều không âm
    if (!/^\d+$/.test(adultStr) || !/^\d+$/.test(childStr) || !/^\d+$/.test(infantStr)) {
        throw new Error("INVALID_PS_FORMAT");
    }

    // parse sang number
    const adults = parseInt(adultStr, 10)
    const children = parseInt(childStr, 10)
    const infants = parseInt(infantStr, 10)

    if (adults < 1 || children < 0 || infants < 0) throw new Error('Invalid passenger format')

    if (adults + children + infants > 7) throw new Error('Only seven (7) adults, children and infants are allowed')

    if (adults < infants) throw new Error('Number of infants must be less than or equal to the number of adults')

    return {
        adults,
        children,
        infants
    }

}

module.exports = { VaildPassenger }