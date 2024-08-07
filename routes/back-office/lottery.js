const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");
const { convertBets, extractTimeFromISO8601 } = require("../../utils/tools");
const { isValid, parseISO } = require("date-fns");

const isValidJSON = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
router.get("/get-closed-round", async (req, res, next) => {
  try {
    const today = new Date();
    const rounds = await prisma.round.findMany({
      where: {
        status: "INACTIVE",
        OR: [{ result: null }, { result: "" }],
        close_time: {
          lte: new Date(),
        },
      },
      orderBy: {
        close_time: "asc"
      }
    });

    res.json({
      status: "success",
      data: rounds,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get-round", async (req, res, next) => {
  try {
    const today = new Date();
    const rounds = await prisma.round.findMany({
      where: {
        status: "ACTIVE", // Filter for active rounds
      },
    });

    res.json({
      status: "success",
      data: rounds,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get-lottery", async (req, res, next) => {
  try {
    const lotteries = await prisma.lottery.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    const response = lotteries.map((i) => {
      return {
        ...i,
        detail: isValidJSON(i.detail) ? JSON.parse(i.detail) : i.detail,
        close_weekday: isValidJSON(i.close_weekday)
          ? JSON.parse(i.close_weekday)
          : i.close_weekday,
        close_extra: isValidJSON(i.close_extra)
          ? JSON.parse(i.close_extra)
          : i.close_extra,
        off_holiday: isValidJSON(i.off_holiday)
          ? JSON.parse(i.off_holiday)
          : i.off_holiday,

        open_time: extractTimeFromISO8601(i.open_time),
        close_time: extractTimeFromISO8601(i.close_time),
        result_time: extractTimeFromISO8601(i.result_time),
      };
    });

    res.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/edit-lottery", async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
      return res.status(404).json({ message: "Authentication failed" });
    }

    const username = decodedToken.username;
    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });
    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    const {
      lottery_id,
      open_before,
      close_weekday,
      close_extra,
      open_time,
      close_time,
      status,
    } = req.body;

    const result_time = "21:30:00";

    const lottery = await prisma.lottery.findFirst({
      where: {
        id: parseInt(lottery_id),
      },
    });

    if (!lottery) {
      return res.status(404).json({ message: "lottery not found" });
    }

    // Convert time strings to ISO-8601 format
    const convertTimeStringToISO8601 = (timeString) => {
      const [hours, minutes, seconds] = timeString.split(":");
      const date = new Date();
      date.setUTCHours(
        parseInt(hours),
        parseInt(minutes),
        parseInt(seconds),
        0
      );
      return date.toISOString();
    };

    const openTime = convertTimeStringToISO8601(open_time);
    const closeTime = convertTimeStringToISO8601(close_time);
    const resultTime = convertTimeStringToISO8601(result_time);

    const lotteryUpdateData = {
      open_before: parseInt(open_before),
      open_time: openTime,
      close_time: closeTime,
      result_time: resultTime,
      status: status,
    };

    if (lottery_id != 10) {
      lotteryUpdateData["close_weekday"] = JSON.stringify(close_weekday);
    } else {
      lotteryUpdateData["close_extra"] = JSON.stringify(close_extra);
    }

    const response = await prisma.lottery.update({
      where: {
        id: parseInt(lottery_id),
      },
      data: lotteryUpdateData,
    });

    res.json({
      status: "success",
      data: response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/add-round", async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
      return res.status(404).json({ message: "Authentication failed" });
    }

    const username = decodedToken.username;
    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    const { lottery_id, start_time, result_time, close_time } = req.body;

    if (!start_time || !result_time || !close_time) {
      return res.status(400).json({ message: "Missing required date fields" });
    }

    const lottery = await prisma.lottery.findFirst({
      where: {
        id: parseInt(lottery_id),
        status: "ACTIVE",
      },
    });

    if (!lottery) {
      return res.status(404).json({ message: "lottery not found" });
    }

    // Parse the dates and check if they are valid
    const parsedStartTime = parseISO(start_time);
    const parsedResultTime = parseISO(result_time);
    const parsedCloseTime = parseISO(close_time);

    if (
      !isValid(parsedStartTime) ||
      !isValid(parsedResultTime) ||
      !isValid(parsedCloseTime)
    ) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    const addRound = await prisma.round.create({
      data: {
        lottery_id: parseInt(lottery_id),
        open_time: parsedStartTime,
        result_time: parsedResultTime,
        close_time: parsedCloseTime,
        status: "ACTIVE",
        code: lottery.code,
      },
    });

    res.json({
      status: "success",
      data: addRound,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/edit-round", async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
      return res.status(404).json({ message: "Authentication failed" });
    }

    const username = decodedToken.username;
    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    const { round_id, start_time, result_time, close_time, status } = req.body;

    const round = await prisma.round.findFirst({
      where: {
        id: parseInt(round_id),
      },
    });

    if (!round) {
      return res.status(404).json({ message: "round not found" });
    }

    const lottery = await prisma.lottery.findFirst({
      where: {
        id: parseInt(round.lottery_id),
        status: "ACTIVE",
      },
    });

    if (!lottery) {
      return res.status(404).json({ message: "lottery not found" });
    }

    let editData = {};
    if (start_time && result_time && close_time) {
      // Parse the dates and check if they are valid
      const parsedStartTime = new Date(start_time);
      const parsedResultTime = new Date(result_time);
      const parsedCloseTime = new Date(close_time);

      editData["open_time"] = parsedStartTime;
      editData["result_time"] = parsedResultTime;
      editData["close_time"] = parsedCloseTime;
    }

    if (status) {
      editData["status"] = status;
    }

    const updateRound = await prisma.round.update({
      where: {
        id: parseInt(round_id),
      },
      data: editData,
    });

    res.json({
      status: "success",
      data: updateRound,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/add-result", async (req, res, next) => {
  try {
    const accessToken = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.decode(accessToken);

    if (!decodedToken) {
      return res.status(404).json({ message: "Authentication failed" });
    }

    const username = decodedToken.username;
    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
      },
    });

    if (!admin) {
      return res.status(404).json({ message: "admin not found" });
    }

    const { lottery_id, round_id, result } = req.body;

    if (!lottery_id || !round_id || !result) {
      return res.status(400).json({ message: "Missing required lottery_id, round_id, result fields" });
    }

    const lottery = await prisma.lottery.findFirst({
      where: {
        id: parseInt(lottery_id),
        status: "ACTIVE",
      },
    });

    if (!lottery) {
      return res.status(404).json({ message: "lottery not found" });
    }

    const round = await prisma.round.findFirst({
      where: {
        OR: [{ result: null }, { result: "" }],
        close_time: {
          lte: new Date(),
        },
        lottery_id: parseInt(lottery_id),
        id: parseInt(round_id),
      },
    });

    if (!round) {
      return res.status(404).json({ message: "round not found" });
    }

    const editRound = await prisma.round.update({
      where: {
        id: parseInt(round.id),
      },
      data: {
        result: JSON.stringify(result),
        status: "ISSUED",
      },
    });

    res.json({
      status: "success",
      round: round,
      data: editRound,
    });
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
