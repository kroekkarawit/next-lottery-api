const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const dayjs = require('dayjs');

const openLottery = async () => {
    const date = new Date();
    let day = date.getDay(); // Get the day of the week (0-6, Sunday-Saturday)
    day = (day + 6) % 7; // Note: to make Monday is 0 start from Monday

    const lotteries = await prisma.lottery.findMany({
        where: {
            status: "ACTIVE",
            code: {
                not: "TH"
            }
        },
    });

    lotteries.forEach(async (lottery) => {
        const openBefore = parseInt(lottery.open_before);
        const closeWeekDay = JSON.parse(lottery.close_weekday);

        // Reset lotteryDate to the initial date at the beginning of each lottery
        let lotteryDate = new Date(date);
        console.log(`Initial lotteryDate ${lotteryDate}`);

        if (openBefore <= 0) {
            // Do something if openBefore is less than or equal to 0
        } else {
            for (let i = 0; i < openBefore; i++) {
                console.log(`=>`, closeWeekDay, (day + i) % 7)
                if (!_.includes(closeWeekDay, (day + i) % 7)) {
                    lotteryDate.setDate(lotteryDate.getDate() + 1); // Accumulate within the loop 
                    continue;
                }

                console.log(`lottery: `, lottery.code);
                const dateOnlyString = lotteryDate.toISOString().split("T")[0];
                console.log(lottery.open_time.toISOString().split("T")[1]);

                const openTime = new Date(
                    `${dateOnlyString}T${lottery.open_time.toISOString().split("T")[1]}`
                );
                const closeTime = new Date(
                    `${dateOnlyString}T${lottery.close_time.toISOString().split("T")[1]}`
                );
                const resultTime = new Date(
                    `${dateOnlyString}T${lottery.result_time.toISOString().split("T")[1]}`
                );

                console.log(`openTime: ${openTime}  closeTime: ${closeTime} resultTime: ${resultTime}`);
                console.log(`\n`);

                const checkExistingRound = await prisma.round.findFirst({
                    where: {
                        lottery_id: parseInt(lottery.id),
                        code: lottery.code,
                        open_time: openTime,
                        close_time: closeTime,
                        result_time: resultTime,
                        result: null,
                        status: "ACTIVE",
                    },
                });

                const checkLatestRound = await prisma.round.findFirst({
                    where: {
                        lottery_id: parseInt(lottery.id),
                        code: lottery.code,
                        result: null,
                        status: "ACTIVE",
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                });

                console.log("checkExistingRound", checkExistingRound);

                console.log("checkLatestRound", checkLatestRound);
                const isExact7Days = checkExact7DaysDifference(checkLatestRound?.open_time, checkExistingRound?.open_time);
                console.log("isExact7Days", isExact7Days);

                if (!checkExistingRound) {
                    const roundCreated = await prisma.round.create({
                        data: {
                            lottery_id: parseInt(lottery.id),
                            code: lottery.code,
                            open_time: openTime,
                            close_time: closeTime,
                            result_time: resultTime,
                            result: null,
                            status: "ACTIVE",
                        },
                    });
                    console.log("roundCreated", roundCreated);
                }
                lotteryDate.setDate(lotteryDate.getDate() + 1); // Accumulate within the loop
            }
        }
    });
};


const closeLottery = async () => {
    const date = new Date();
    let day = date.getDay(); // Get the day of the week (0-6, Sunday-Saturday)
    day = (day + 6) % 7; // Note: to make Monday is 0 start from Monday

    const lotteries = await prisma.lottery.findMany({
        where: {
            status: "ACTIVE",
            code: {
                not: "TH"
            }
        },
    });

    lotteries.forEach(async (lottery) => {
        const updateRound = await prisma.round.updateMany({
            where: {
                lottery_id: parseInt(lottery.id),
                code: lottery.code,
                close_time: {
                    lte: new Date()
                },
                result: null,
                status: "ACTIVE",
            },
            data: {
                status: "INACTIVE"
            }
        });

        if (updateRound.count > 0) {
            console.log(`Updated ${updateRound.count} round(s) to INACTIVE status.`);
        }
    })
}

const openLotteryThai = async () => {
    const date = new Date();
    let lotteryDate = new Date(date);

    const lottery = await prisma.lottery.findFirst({
        where: {
            status: "ACTIVE",
            code: "TH"
        },
    });

    const openBefore = parseInt(lottery.open_before);

    const lotteryDates = JSON.parse(lottery.close_extra);
    const nextRoundDate = getFirstFutureDate(lotteryDates);

    const dateOnlyString = nextRoundDate.toISOString().split("T")[0];

    const preOpenTime = new Date(
        `${dateOnlyString}T${lottery.open_time.toISOString().split("T")[1]}`
    );
    const openTime = new Date(preOpenTime.setDate(preOpenTime.getDate() - openBefore));

    const closeTime = new Date(
        `${dateOnlyString}T${lottery.close_time.toISOString().split("T")[1]}`
    );
    const resultTime = new Date(
        `${dateOnlyString}T${lottery.result_time.toISOString().split("T")[1]}`
    );

    const checkRoundExisting = await prisma.round.findFirst({
        where: {
            lottery_id: parseInt(lottery.id),
            status: "ACTIVE",
            open_time: openTime,
            close_time: closeTime,
            result_time: resultTime,
            result: null,
        }
    });

    if (!checkRoundExisting) {
        const roundCreated = await prisma.round.create({
            data: {
                lottery_id: parseInt(lottery.id),
                code: lottery.code,
                open_time: openTime,
                close_time: closeTime,
                result_time: resultTime,
                result: null,
                status: "ACTIVE",
            },
        });
        console.log("roundCreated", roundCreated);
    }
}

const closeLotteryThai = async () => {

    const lottery = await prisma.lottery.findFirst({
        where: {
            status: "ACTIVE",
            code: "TH"
        },
    });

    const updateRound = await prisma.round.updateMany({
        where: {
            lottery_id: parseInt(lottery.id),
            code: lottery.code,
            close_time: {
                lte: new Date()
            },
            result: null,
            status: "ACTIVE",
        },
        data: {
            status: "INACTIVE"
        }
    });

    if (updateRound.count > 0) {
        console.log(`Updated ${updateRound.count} round(s) to INACTIVE status.`);
    }
}




const checkExact7DaysDifference = (date1, date2) => {
    // Parse the input date strings with dayjs
    const day1 = dayjs(date1);
    const day2 = dayjs(date2);

    if (!date1 || !date2) return true;

    // Calculate the difference in days
    const dayDifference = day2.diff(day1, 'day');

    // Check if the difference is exactly 7 days
    return dayDifference === 7;
};

function getFirstFutureDate(dates) {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time part for accurate comparison

    // Parse dates and filter
    const futureDates = dates
        .map(dateStr => new Date(dateStr.split("-").reverse().join("-"))) // Convert "DD-MM-YYYY" to "YYYY-MM-DD"
        .filter(date => date >= today);

    // Sort dates in ascending order
    futureDates.sort((a, b) => a - b);

    // Return the first date, if available
    return futureDates.length > 0 ? futureDates[0] : null;
}

//openLottery(); // Should be called 23:30 - 00:30 only cause it's  will distrupt closeLottery

//closeLottery();

//openLotteryThai();

closeLotteryThai();