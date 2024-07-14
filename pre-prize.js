const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const dayjs = require('dayjs');


const issueLotteryPrize = async () => {
    const date = new Date();
    const issueRound = await prisma.round.findMany({
        where: {
            status: "ISSUED",
            result_time: {
                lte: new Date()
            },
            result: {
                not: null
            }
        }
    });

    const listRoundIds = issueRound.map(round => round.id);
    console.log(listRoundIds);

    const betPreIssued = await prisma.bet.findMany({
        where: {
            round_id: {
                in: listRoundIds
            }
        },
        take: 500
    })

    // console.log("issueRound", issueRound)
    //console.log("betPreIssued", betPreIssued)

    for (const bet of betPreIssued) {
        const { number, bet_type: betType, amount, lottery_type: lotteryType, round_id: roundId } = bet;
        //console.log({ number, betType, amount, lotteryType, roundId });
        const isStrike = checkStrikePrize({ number, betType, lotteryType, roundId, issueRound })
        console.log("isStrike", number, betType, isStrike)

    }
};
function checkStrikePrize(lotteryData) {
    let prizes = [];
    // Extract the necessary data
    const { number, betType, lotteryType, roundId, issueRound } = lotteryData;

    // Find the issueRound that matches the roundId
    const targetRound = issueRound.find(round => round.id === roundId);
    if (!targetRound) {
        return false; // Round not found
    }

    // Parse the result JSON
    const resultData = JSON.parse(targetRound.result);
    const { prize_1, prize_2, prize_3, starters, consolations } = resultData;

    // Define a helper function to check for a number in prize categories
    function checkPrizes(prizes, number) {
        if (!prizes) {
            return false;
        }
        if (Array.isArray(prizes)) {
            return prizes.includes(number);
        } else if (typeof prizes === 'object') {
            return Object.values(prizes).some(prize => prize === number);
        } else {
            return prizes === number;
        }
    }

    if (["M", "P", "T", "S", "B", "W", "K"].includes(lotteryType.toUpperCase())) {
        if (["B"].includes(betType.toUpperCase())) {
            if (checkPrizes(prize_1, number)) {
                prizes.push("prize_1");
            }
            if (checkPrizes(prize_2, number)) {
                prizes.push("prize_2");
            }
            if (checkPrizes(prize_3, number)) {
                prizes.push("prize_3");
            }
            if (checkPrizes(starters, number)) {
                prizes.push("starters");
            }
            if (checkPrizes(consolations, number)) {
                prizes.push("consolations");
            }
        }
        if (["S"].includes(betType.toUpperCase())) {
            if (checkPrizes(prize_1, number)) {
                prizes.push("prize_1");
            }
            if (checkPrizes(prize_2, number)) {
                prizes.push("prize_2");
            }
            if (checkPrizes(prize_3, number)) {
                prizes.push("prize_3");
            }
        }

        if (["4A"].includes(betType.toUpperCase())) {
            if (number === prize_1) {
                prizes.push("prize_1");
            }
        }

        if (["ABC"].includes(betType.toUpperCase())) {
            if (number === prize_1) {
                prizes.push("prize_1");
            }
            if (number === prize_2) {
                prizes.push("prize_2");
            }
            if (number === prize_3) {
                prizes.push("prize_3");
            }
        }

        if (["A"].includes(betType.toUpperCase())) {

            if (number === prize_1) {
                prizes.push("prize_1");
            }
            if (number === prize_2) {
                prizes.push("prize_2");
            }
            if (number === prize_3) {
                prizes.push("prize_3");
            }
            if ((Array.isArray(starters) && starters.includes(number))) {
                prizes.push("starters");
            }
            if ((Array.isArray(consolations) && consolations.includes(number))) {
                prizes.push("consolations");
            }
        }

        if (["2A"].includes(betType.toUpperCase())) {
            if (number.slice(0, 2) === prize_1.slice(0, 2)) {
                prizes.push("prize_1");
            }
        }

        if (["2F"].includes(betType.toUpperCase())) {
            if (number.slice(-2) === prize_1.slice(-2)) {
                prizes.push("prize_1");
            }
        }
    }

    return prizes.length > 0 ? prizes : null;
}

issueLotteryPrize()