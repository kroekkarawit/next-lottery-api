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

    // Define a helper function to check for a number in prize categories
    function checkPrizes(prizes, number) {
        if (!prizes) {
            return false;
        }
        if (Array.isArray(prizes)) {
            return prizes.includes(number);
        } else if (typeof prizes === 'object') {
            return Object.values(prizes).some(prize => prize.number === number);
        } else {
            return prizes === number;
        }
    }

    // Define a helper function to check for a number in prize arrays with order
    function checkPrizesWithOrder(prizes, number) {
        if (!prizes) {
            return false;
        }
        return prizes.some(prize => prize.number === number);
    }

    // Check bet type and update prizes array accordingly
    if (["M", "P", "T", "S", "B", "W", "K"].includes(lotteryType.toUpperCase())) {
        switch (betType.toUpperCase()) {
            case "B":
                if (checkPrizes(resultData.prize_1, number)) prizes.push("prize_1");
                if (checkPrizes(resultData.prize_2, number)) prizes.push("prize_2");
                if (checkPrizes(resultData.prize_3, number)) prizes.push("prize_3");
                if (checkPrizes(resultData.starters, number)) prizes.push("starters");
                if (checkPrizes(resultData.consolations, number)) prizes.push("consolations");
                break;

            case "S":
                if (checkPrizes(resultData.prize_1, number)) prizes.push("prize_1");
                if (checkPrizes(resultData.prize_2, number)) prizes.push("prize_2");
                if (checkPrizes(resultData.prize_3, number)) prizes.push("prize_3");
                break;

            case "4A":
                if (number === resultData.prize_1) prizes.push("prize_1");
                break;

            case "ABC":
                if (number === resultData.prize_1) prizes.push("prize_1");
                if (number === resultData.prize_2) prizes.push("prize_2");
                if (number === resultData.prize_3) prizes.push("prize_3");
                break;

            case "A":
                if (number === resultData.prize_1) prizes.push("prize_1");
                if (number === resultData.prize_2) prizes.push("prize_2");
                if (number === resultData.prize_3) prizes.push("prize_3");
                if (checkPrizes(resultData.starters, number)) prizes.push("starters");
                if (checkPrizes(resultData.consolations, number)) prizes.push("consolations");
                break;

            case "2A":
                if (number.slice(0, 2) === resultData.prize_1.slice(0, 2)) prizes.push("prize_1");
                break;

            case "2F":
                if (number.slice(-2) === resultData.prize_1.slice(-2)) prizes.push("prize_1");
                break;

            default:
                return null; // Invalid bet type
        }
    } else if (lotteryType.toLowerCase() === "9lotto" || lotteryType.toLowerCase() === "gd") {
        const { prize_1, prize_2, prize_3, starters, consolations, jackpot, "6D": prize_6D } = resultData;

        switch (betType.toUpperCase()) {
            case "B":
                if (checkPrizesWithOrder(prize_1, number)) prizes.push("prize_1");
                if (checkPrizesWithOrder(prize_2, number)) prizes.push("prize_2");
                if (checkPrizesWithOrder(prize_3, number)) prizes.push("prize_3");
                if (checkPrizesWithOrder(starters, number)) prizes.push("starters");
                if (checkPrizesWithOrder(consolations, number)) prizes.push("consolations");
                break;

            case "S":
                if (checkPrizesWithOrder(prize_1, number)) prizes.push("prize_1");
                if (checkPrizesWithOrder(prize_2, number)) prizes.push("prize_2");
                if (checkPrizesWithOrder(prize_3, number)) prizes.push("prize_3");
                break;

            case "4A":
                if (number === prize_1.number) prizes.push("prize_1");
                break;

            case "ABC":
                if (number === prize_1.number) prizes.push("prize_1");
                if (number === prize_2.number) prizes.push("prize_2");
                if (number === prize_3.number) prizes.push("prize_3");
                break;

            case "A":
                if (number === prize_1.number) prizes.push("prize_1");
                if (number === prize_2.number) prizes.push("prize_2");
                if (number === prize_3.number) prizes.push("prize_3");
                if (checkPrizesWithOrder(starters, number)) prizes.push("starters");
                if (checkPrizesWithOrder(consolations, number)) prizes.push("consolations");
                break;

            case "2A":
                if (number.slice(0, 2) === prize_1.number.slice(0, 2)) prizes.push("prize_1");
                break;

            case "2F":
                if (number.slice(-2) === prize_1.number.slice(-2)) prizes.push("prize_1");
                break;

            default:
                return null; // Invalid bet type
        }
    }

    return prizes.length > 0 ? prizes : null;
}

issueLotteryPrize()