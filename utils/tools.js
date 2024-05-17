function convertBets(bets) {
    return bets.map(bet => {
        const { number, ...rest } = bet;
        const bet_type = {
            B: bet.B || "",
            S: bet.S || "",
            "4A": bet["4A"] || "",
            ABC: bet.ABC || "",
            A: bet.A || "",
            "5D": bet["5D"] || "",
            "6D": bet["6D"] || "",
            "2A": bet["2A"] || "",
            "2F": bet["2F"] || "",
        };

        return {
            number,
            bet_type,
            date: bet.date,
            lotto_type: bet.lotto_type,
            option: bet.option
        };
    });
}

module.exports = convertBets; 