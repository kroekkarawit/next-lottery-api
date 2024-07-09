const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");
const { convertBets, extractTimeFromISO8601 } = require("../../utils/tools");
const { isValid, parseISO, startOfToday, endOfToday } = require("date-fns");

router.get("/dashboard", async (req, res, next) => {
  try {
    const totalAgent = await prisma.user.findMany({
      where: {
        account_level: {
          not: "Sub_user",
        },
      },
    });

    const totalAgentActive = totalAgent.filter(
      (i) => i.status === "ACTIVE"
    ).length;
    const totalAgentInActive = totalAgent.filter(
      (i) => i.status === "INACTIVE"
    ).length;
    const totalAgentSuspended = totalAgent.filter(
      (i) => i.status === "SUSPENDED"
    ).length;

    const start = startOfToday();
    const end = endOfToday();

    const totalBet = await prisma.bet.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: start,
          lt: end,
        },
      },
    });

    const totalStrike = await prisma.win_strike.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: start,
          lt: end,
        },
      },
    });

    const totalTransfer = await prisma.transfer.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        created_at: {
          gte: start,
          lt: end,
        },
      },
    });

    // Extract the summed amounts
    const totalBetAmount = totalBet._sum.amount || 0;
    const totalStrikeAmount = totalStrike._sum.amount || 0;
    const totalTransferAmount = totalTransfer._sum.amount || 0;

    res.json({
      status: "success",
      data: {
        totalAgent: totalAgent.length,
        totalAgentActive: totalAgentActive,
        totalAgentInActive: totalAgentInActive,
        totalAgentSuspended: totalAgentSuspended,
        totalBet: totalBetAmount,
        totalStrike: totalStrikeAmount,
        totalTransfer: totalTransferAmount,
        totalWithdraw: 0,
      },
    });
  } catch (error) {
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
