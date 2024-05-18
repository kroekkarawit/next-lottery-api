const express = require('express');
const router = express.Router();
const { PrismaClient, Status } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const openLottery = async () => {
    const date = new Date();
    let day = date.getDay(); // Get the day of the week (0-6, Sunday-Saturday)
    day = (day + 6) % 7; //Note: to make Monday is 0 start from monday

    console.log(`OpenLottery`, date);

    const lotteries = await prisma.lottery.findMany({
        where: {
            status: 'ACTIVE'
        }
    });
    console.log(`lotteries: `, lotteries);

    //console.log(`lotteries`, lotteries);
    lotteries.forEach(async (lottery) => {
        const openBefore = parseInt(lottery.open_before);
        const closeWeekDay = lottery.close_weekday

        if (openBefore <= 0) {
        } else {
            for (let i = 0; i < openBefore; i++) {
                if (!_.includes(closeWeekDay, ((day + 6) + i) % 7)) continue;
                //console.log(`_.includes(${closeWeekDay}, ${((day + 6) + i) % 7} )`, _.includes(closeWeekDay, ((day + 6) + i) % 7))
                console.log(`lottery: `, lottery.code);
                date.setDate(date.getDate() + 1);
                const dateOnlyString = date.toISOString().split('T')[0];
                console.log(lottery.open_time.toISOString().split('T')[1])
                const startTime = new Date(`${dateOnlyString}T${lottery.open_time.toISOString().split('T')[1]}`);
                const closeTime = new Date(`${dateOnlyString}T${lottery.close_time.toISOString().split('T')[1]}`);
                const resultTime = new Date(`${dateOnlyString}T${lottery.result_time.toISOString().split('T')[1]}`);
                
                await prisma.round.create({
                    data: {
                        lottery_id: lottery.id.toString(),
                        code: lottery.code,
                        start_time: startTime,
                        close_time: closeTime,
                        result_time: resultTime,
                        result: null,
                        status: "ACTIVE",
                    }
                });

            }
        }
    });
}

const closeLottery = async () => {
    console.log('closeLottery');
}

const drawLottery = async () => {
    console.log('drawLottery');
}

router.get('/cronjob', async (req, res, next) => {
    try {
        await openLottery();
        await closeLottery();
        await drawLottery();

        res.json({
            status: 'success'
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});



process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

module.exports = router;
