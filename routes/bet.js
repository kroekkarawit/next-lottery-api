const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const verifyToken = require('../utils/jwt');
const convertBets = require('../utils/tools');

router.post('/', async (req, res, next) => {
    const { bet, currency } = req.body;
    if (!bet) {
        return res.status(400).json({ message: 'bet detail are required' });
    }

    const decodedToken = verifyToken(req);
    const userId = decodedToken.id.toString();

    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(userId),
        }
    });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    console.log(userId, user);

    try {
        const newReceipt = await prisma.receipt.create({
            data: {
                user_id: parseInt(userId),
                remark: "",
                currency: currency,
                bet_method: "MULTIPLY",
                total_amount: 0,
                ip_address: user?.ip_address || null,
                status: "PENDING"
            }
        });

        let dateList = []

        let totalAmount = 0;
        const betData = bet
        const convertedBets = convertBets(betData);
        let betPrepared = [];

        convertedBets.forEach(bet => {
            if (!bet.number) return;

            Object.entries(bet.bet_type).forEach(([bet_type, bet_amount]) => {
                if (!bet_amount) return;

                Object.entries(bet.lotto_type).forEach(([lottery_type, lottery_value]) => {
                    if (!lottery_value) return;

                    Object.entries(bet.date).forEach(([date, date_value]) => {
                        if (date_value) {
                            console.log(`Number: ${bet.number}, Bet Type: ${bet_type}, Bet Amount: ${bet_amount}, Lottery Type: ${lottery_type}, Date: ${date} \n`);
                            totalAmount += parseFloat(bet_amount);
                            betPrepared.push({
                                user_id: parseInt(userId),
                                receipt_id: newReceipt.id.toString(),
                                number: bet.number,
                                amount: parseFloat(bet_amount).toFixed(2),
                                bet_type: bet_type,
                                lottery_type: lottery_type,
                                status: "PENDING",
                                result_date: new Date(date)
                            })
                            dateList.push(new Date(date));
                        }
                    });
                });
            });
        });
        if (betPrepared.length <= 0) {
            return res.status(400).json({ message: 'bet is empty' });
        }

        const createBets = await prisma.bet.createMany({
            data: betPrepared,
            skipDuplicates: false
        });

        const updateReceipt = await prisma.receipt.update({
            where: {
                id: newReceipt.id,
            },
            data: {
                total_amount: totalAmount,
            },
        });

        const updateUser = await prisma.user.update({
            where: {
                id: parseInt(userId),
            },
            data: {
                credit: user.credit - totalAmount,
            },
        });


        function formatDate(date) {
            const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month (1-based and padded with 0)
            const day = date.getDate().toString().padStart(2, '0'); // Day of the month padded with 0
            const hours = date.getHours().toString().padStart(2, '0'); // Hours padded with 0
            const minutes = date.getMinutes().toString().padStart(2, '0'); // Minutes padded with 0
          
            return `${year}${month}${day} ${hours}${minutes}`;
          }
          function formatMinMaxDates(dates) {
            // Parse the date strings into Date objects
            const parsedDates = dates.map(date => new Date(date));
          
            // Find the minimum and maximum dates
            const minDate = new Date(Math.min(...parsedDates));
            const maxDate = new Date(Math.max(...parsedDates));
          
            // Function to format a date as DD/MM
            const formatDate = date => {
              const day = date.getDate().toString().padStart(2, '0');
              const month = (date.getMonth() + 1).toString().padStart(2, '0');
              return `${day}/${month}`;
            };
          
            // Format the min and max dates
            const formattedMinDate = formatDate(minDate);
            const formattedMaxDate = formatDate(maxDate);
          
            // Combine the formatted dates into the desired format
            return `${formattedMinDate}-${formattedMaxDate}`;
          }
          
          const date = formatDate(new Date());
          const formatedDate = formatMinMaxDates(dateList)
          

        res.json({
            detail: `${date}
            ${username}
            ${formatedDate}
            *MPT
            8909=0.10B 0.10S 0.10A1 0.10C 0.10A 0.10EF
            *PSBK
            (2323)=0.10B 0.10S 0.10A1 0.10C 0.10EA
            18/05
            P 2323=A1(S.O)
            K 23=EA(S.O)
            K 2323=B(S.O)
            K 2323=A1(S.O)
            K 2323=S(S.O)
            K 323=C(S.O)
            19/05
            K 23=EA(S.O)
            K 2323=B(S.O)
            K 2323=A1(S.O)
            K 2323=S(S.O)
            K 323=C(S.O)
            GT=6.50 (SGD)
            GT=22.75 (MYR)`
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});


router.post('/receipt', async (req, res, next) => {
    const { user_id, currency, draw_date: result_date, bet_date: created_at, page_number } = req.body;

    const decodedToken = verifyToken(req);
    const userId = decodedToken.id.toString();

    const user = await prisma.user.findFirst({
        where: {
            id: parseInt(userId),
        }
    });
    console.log("user", user);
    try {
        let where = {};

        if (user_id) {
            where.user_id = parseInt(user_id);
        }

        if (currency) {
            where.currency = currency;
        }
        //TODO: fixing this query cause result time is different
        /*
                if (result_date && result_date.start && result_date.end) {
                    where.result_date = {
                        gte: new Date(result_date.start),
                        lte: new Date(result_date.end),
                    };
                }
        */
        if (created_at && created_at.start && created_at.end) {
            where.created_at = {
                gte: new Date(created_at.start),
                lte: new Date(created_at.end),
            };
        }
        console.log(where)
        const receipts = await prisma.receipt.findMany({
            where,
        });

        const preReceipts = receipts.map((i) => {
            return {
                ...i,
                accounts: { username: "kp3773", name: "xiaopang" },
                bet_info: `Page: ${page_number}
        Currency: ${i.currency}
        Date/Time: ${new Date(i.created_at).toLocaleDateString()}
        Bet By: ${user.username} (${user.name})
        
        Draw Type: M-P-T-S-B-K-W-8-9
        Bet Method: Multiply
        Bet Type: B-S-4A-C-A
        Bet Date: Day - D
        Box / IBox: * / **
        Draw Date / Day: # / ##`,

                slip: `240515 1251 (4)
        kp3773
        15/05-18/05
        *MSBH
        9090=0.10B 1S 0.10A1 0.10C 0.10A
        GT=11.20 (SGD)
        GT=39.20 (MYR)
        
        Points:0013 3601 3830 1733`

            }
        })
        res.json(preReceipts);


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});



process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});

module.exports = router;
