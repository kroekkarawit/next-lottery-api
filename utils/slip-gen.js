function convertToSlipFormat(jsonData, dateTimeStr, username) {
    // Function to parse dates and find min and max dates
    function getMinMaxDates(bets) {
        const dates = [];
        bets.forEach(bet => {
            if (bet.date) {
                Object.keys(bet.date).forEach(date => {
                    if (bet.date[date] && date !== 'undefined') {
                        dates.push(date);
                    }
                });
            }
        });
        dates.sort();
        if (dates.length === 0) {
            return '';
        }
        const minDate = dates[0];
        const maxDate = dates[dates.length - 1];
        const formatDate = dateStr => {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}`;
        };
        return `${formatDate(minDate)}-${formatDate(maxDate)}`;
    }

    const dateRangeStr = getMinMaxDates(jsonData.bet);

    // Function to process bets and calculate total amount
    function processBets(bets) {
        let totalAmount = 0;
        const betLines = bets.map(bet => {
            if (!bet.number) {
                return '';
            }
            const lottoTypes = Object.keys(bet.lotto_type).filter(type => bet.lotto_type[type]).join('');
            const amounts = [`${bet.number}=`];
            const keys = ['B', 'S', '4A', 'ABC', 'A', '5D', '6D', '2A', '2F'];
            keys.forEach(key => {
                if (bet[key]) {
                    if (key === '4A') {
                        amounts.push(`${bet[key]}A1`);
                    } else if (key === 'ABC') {
                        amounts.push(`${bet[key]}C`);
                    } else {
                        amounts.push(`${bet[key]}${key}`);
                    }
                }
            });
            totalAmount += keys.reduce((sum, key) => sum + (parseFloat(bet[key]) || 0), 0);
            return `*${lottoTypes}\n${amounts.join(' ')}`;
        }).filter(line => line !== ''); // Filter out any empty lines resulting from missing numbers
        return { betLines, totalAmount };
    }

    const { betLines, totalAmount } = processBets(jsonData.bet);
    const gtStr = `GT=${totalAmount.toFixed(2)}`;

    // Constructing the final slip
    const slipLines = [
        dateTimeStr,
        username,
        dateRangeStr,
        ...betLines,
        gtStr
    ];

    return slipLines.join('\n');
}

function convertToSlipFormatThai(jsonData, dateTimeStr, username) {

    // Function to process bets and calculate total amount
    function processBets(bets) {
        let totalAmount = 0;
        const betLines = bets.map(bet => {
            if (!bet.number) {
                return '';
            }
            const lottoTypes = "TH";
            const amounts = [`${bet.number}=`];
            const keys = ['three_top', 'three_under', 'three_tod', 'three_front', 'two_top', 'two_under', 'one_top', 'one_under'];
            keys.forEach(key => {
                if (bet[key]) {
                    amounts.push(`${bet[key]} ${key}, `);
                }
            });
            totalAmount += keys.reduce((sum, key) => sum + (parseFloat(bet[key]) || 0), 0);
            return `*${lottoTypes}\n${amounts.join(' ')}`;
        }).filter(line => line !== ''); // Filter out any empty lines resulting from missing numbers
        return { betLines, totalAmount };
    }

    const { betLines, totalAmount } = processBets(jsonData.bet);
    const gtStr = `GT=${totalAmount.toFixed(2)}`;

    // Constructing the final slip
    const slipLines = [
        dateTimeStr,
        username,
        ...betLines,
        gtStr
    ];

    return slipLines.join('\n');
}


module.exports = {convertToSlipFormat,convertToSlipFormatThai};
