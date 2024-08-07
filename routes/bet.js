const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const verifyToken = require("../utils/jwt");
const {
  convertBets,
  convertThaiBets,
  betToCommmission,
} = require("../utils/tools");
const {
  convertToSlipFormat,
  convertToSlipFormatThai,
} = require("../utils/slip-gen");

function formatDate(date) {
  const year = date.getFullYear().toString().slice(-2); // Last two digits of the year
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month (1-based and padded with 0)
  const day = date.getDate().toString().padStart(2, "0"); // Day of the month padded with 0
  const hours = date.getHours().toString().padStart(2, "0"); // Hours padded with 0
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Minutes padded with 0

  return `${year}${month}${day} ${hours}${minutes}`;
}

function findRoundId(activeRound, lottery_type, date) {
  const targetDate = new Date(date);
  // Helper function to extract only the date part
  const extractDate = (dateTime) => {
    const dateObj = new Date(dateTime);
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  };

  const targetDateOnly = extractDate(targetDate);

  for (const round of activeRound) {
    const closeDateOnly = extractDate(round.close_time);
    if (round.code === lottery_type && closeDateOnly.getTime() === targetDateOnly.getTime()) {
      return round.id;
    }
  }

  return null;  // Return null if no matching round is found
}

router.post("/", async (req, res, next) => {
  const { bet, currency, user_id: buyerUserId } = req.body;
  if (!bet) {
    return res.status(400).json({ message: "bet detail are required" });
  }

  const decodedToken = verifyToken(req);
  const userId = decodedToken.id.toString();

  let user;
  if (userId != buyerUserId) {
    const buyerUser = await prisma.user.findUnique({
      where: {
        id: parseInt(buyerUserId),
        referral: parseInt(userId),
      },
    });

    if (!buyerUser) {
      return res.status(404).json({ message: "User incorrect" });
    }
    user = buyerUser;
  } else {
    user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userPackage = await prisma.package.findFirst({
    where: {
      user_id: parseInt(user.id),
    },
  });

  const activeRound = await prisma.round.findMany({
    where: {
      status: 'ACTIVE',
    },
  });

  try {
    const newReceipt = await prisma.receipt.create({
      data: {
        user_id: parseInt(user.id),
        remark: "",
        currency: currency,
        bet_method: "MULTIPLY",
        total_amount: 0,
        ip_address: user?.ip_address || null,
        status: "PENDING",
      },
    });

    let totalAmount = 0;
    const betData = bet;
    const convertedBets = convertBets(betData);
    let betPrepared = [];

    convertedBets.forEach((bet) => {
      if (!bet.number) return;

      Object.entries(bet.bet_type).forEach(([bet_type, bet_amount]) => {
        if (!bet_amount) return;

        Object.entries(bet.lotto_type).forEach(
          ([lottery_type, lottery_value]) => {
            if (!lottery_value) return;

            Object.entries(bet.date).forEach(([date, date_value]) => {
              if (date_value) {
                // console.log(
                //   `Number: ${bet.number}, Bet Type: ${bet_type}, Bet Amount: ${bet_amount}, Lottery Type: ${lottery_type}, Date: ${date} \n`
                // );

                const round_id = findRoundId(activeRound, lottery_type, date);

                if (!round_id) {
                  throw new Error('No round found for the given lottery type and close time.');
                }

                totalAmount += parseFloat(bet_amount);
                betPrepared.push({
                  user_id: parseInt(user.id),
                  receipt_id: newReceipt.id.toString(),
                  number: bet.number,
                  amount: parseFloat(bet_amount).toFixed(2),
                  bet_type: bet_type,
                  lottery_type: lottery_type,
                  status: "PENDING",
                  result_date: new Date(date),
                  round_id: round_id
                });
              }
            });
          }
        );
      });
    });
    if (betPrepared.length <= 0) {
      return res.status(400).json({ message: "bet is empty" });
    }

    if (user.credit < totalAmount) {
      await prisma.receipt.delete({
        where: {
          id: parseInt(newReceipt.id),
        },
      });
      return res.status(400).json({ message: "credit is insufficient" });
    }

    const createBets = await Promise.all(
      betPrepared.map(async (bet) => {
        return prisma.bet.create({
          data: bet,
        });
      })
    );

    const betsArray = Array.isArray(createBets) ? createBets : [createBets];

    const createCommission = await Promise.all(
      betsArray.map(async (i) => {
        await prisma.commission.create({
          data: {
            user_id: parseInt(user.id),
            bet_id: parseInt(i.id),
            amount: betToCommmission({
              lottery_type: i.lottery_type,
              bet_type: i.bet_type,
              amount: i.amount,
              packages: userPackage,
            }),
          },
        });
      })
    );

    const updateReceipt = await prisma.receipt.update({
      where: {
        id: newReceipt.id,
      },
      data: {
        total_amount: totalAmount,
        slip: convertToSlipFormat(
          req.body,
          formatDate(new Date()),
          user.username
        ),
      },
    });

    const updateUser = await prisma.user.update({
      where: {
        id: parseInt(user.id),
      },
      data: {
        credit: user.credit - totalAmount,
      },
    });

    res.json({
      detail: convertToSlipFormat(
        req.body,
        formatDate(new Date()),
        user.username
      ),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/thai", async (req, res, next) => {
  const { bet, currency, user_id: buyerUserId } = req.body;
  if (!bet) {
    return res.status(400).json({ message: "bet detail are required" });
  }

  const decodedToken = verifyToken(req);
  const userId = decodedToken.id.toString();

  let user;
  if (userId != buyerUserId) {
    const buyerUser = await prisma.user.findUnique({
      where: {
        id: parseInt(buyerUserId),
        referral: parseInt(userId),
      },
    });

    if (!buyerUser) {
      return res.status(404).json({ message: "User incorrect" });
    }
    user = buyerUser;
  } else {
    user = await prisma.user.findUnique({
      where: {
        id: parseInt(userId),
      },
    });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const userPackage = await prisma.package.findFirst({
    where: {
      user_id: parseInt(user.id),
    },
  });

  const lotteryRound = await prisma.round.findFirst({
    where: {
      code: "TH",
    },
    orderBy: {
      created_at: "desc",
    },
  });

  try {
    const newReceipt = await prisma.receipt.create({
      data: {
        user_id: parseInt(user.id),
        remark: "",
        currency: currency,
        bet_method: "MULTIPLY",
        total_amount: 0,
        ip_address: user?.ip_address || null,
        status: "PENDING",
      },
    });

    let totalAmount = 0;
    const betData = bet;
    const convertedBets = convertThaiBets(betData);
    let betPrepared = [];

    convertedBets.forEach((bet) => {
      if (!bet.number) return;

      Object.entries(bet.bet_type).forEach(([bet_type, bet_amount]) => {
        if (!bet_amount) return;

        Object.entries(bet.lotto_type).forEach(
          ([lottery_type, lottery_value]) => {
            if (!lottery_value) return;

            // console.log(
            //   `Number: ${bet.number}, Bet Type: ${bet_type}, Bet Amount: ${bet_amount}, Lottery Type: ${lottery_type},   \n`
            // );
            totalAmount += parseFloat(bet_amount);
            betPrepared.push({
              user_id: parseInt(user.id),
              receipt_id: newReceipt.id.toString(),
              number: bet.number,
              amount: parseFloat(bet_amount).toFixed(2),
              bet_type: bet_type,
              lottery_type: "TH",
              status: "PENDING",
              result_date: new Date(lotteryRound.result_time),
              round_id: parseInt(lotteryRound.id),
            });
          }
        );
      });
    });

    if (betPrepared.length <= 0) {
      return res.status(400).json({ message: "bet is empty" });
    }

    if (user.credit < totalAmount) {
      await prisma.receipt.delete({
        where: {
          id: parseInt(newReceipt.id),
        },
      });
      return res.status(400).json({ message: "credit is insufficient" });
    }

    const createBets = await Promise.all(
      betPrepared.map(async (bet) => {
        return prisma.bet.create({
          data: bet,
        });
      })
    );

    const betsArray = Array.isArray(createBets) ? createBets : [createBets];

    const createCommission = await Promise.all(
      betsArray.map(async (i) => {
        // console.log(
        //   `Id: ${i.id} lottery_type: ${i.lottery_type} bet: ${
        //     i.bet_type
        //   } amount: ${betToCommmission({
        //     lottery_type: i.lottery_type,
        //     bet_type: i.bet_type,
        //     amount: i.amount,
        //     packages: userPackage,
        //   })}`
        // );
        await prisma.commission.create({
          data: {
            user_id: parseInt(user.id),
            bet_id: parseInt(i.id),
            amount: betToCommmission({
              lottery_type: i.lottery_type,
              bet_type: i.bet_type,
              amount: i.amount,
              packages: userPackage,
            }),
          },
        });
      })
    );

    const updateReceipt = await prisma.receipt.update({
      where: {
        id: newReceipt.id,
      },
      data: {
        total_amount: totalAmount,
        slip: convertToSlipFormatThai(
          req.body,
          formatDate(new Date()),
          user.username
        ),
      },
    });

    const updateUser = await prisma.user.update({
      where: {
        id: parseInt(user.id),
      },
      data: {
        credit: user.credit - totalAmount,
      },
    });

    res.json({
      detail: convertToSlipFormatThai(
        req.body,
        formatDate(new Date()),
        user.username
      ),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/receipt", async (req, res, next) => {
  const {
    user_id,
    currency,
    draw_date: result_date,
    bet_date: created_at,
    page_number,
  } = req.body;

  const decodedToken = verifyToken(req);
  const userId = decodedToken.id.toString();

  const user = await prisma.user.findFirst({
    where: {
      id: parseInt(userId),
    },
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
    const receipts = await prisma.receipt.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
    });

    const results = await Promise.all(
      receipts.map(async (i) => {
        const userData = await prisma.user.findUnique({
          where: {
            id: parseInt(i.user_id),
          },
        });

        return {
          account: { username: userData?.username, name: userData?.name },
          bet_info: `Page: 1
        Currency: ${i.currency}
        Date/Time: ${new Date(i.created_at).toLocaleString()}
        Bet By: ${userData?.username} (${userData?.name})
        
        Draw Type: M-P-T-S-B-K-W-8-9
        Bet Method: Multiply
        Bet Type: B-S-4A-C-A
        Bet Date: Day - D
        Box / IBox: * / **
        Draw Date / Day: # / ##`,
          re_buy: {
            orderEntry: "#18|+1|1234#1#0#0#0#0#0#0",
            buyType: "B-S-4A-C-A",
            ibox: "**",
          },
          slip: i.slip,
          ip_address: i.ip_address,
        };
      })
    );
    res.json(results);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

module.exports = router;
