const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");

router.get("/get-user", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const admin = await prisma.admin.findFirst({
        where: {
          username: username,
        },
      });
      if (!admin) {
        return res.status(404).json({ message: "admin not found" });
      }

      const getAllUser = await prisma.user.findMany({
        where: {},
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          status: true,
          ip_address: true,
          remark: true,
          account_level: true,
          referral: true,
          credit: true,
          credit_limit: true,
          outstanding: true,
          balance: true,
          created_at: true,
        },
      });

      res.json({
        data: getAllUser,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(500).json({ error: "Authentication failed" });
  }
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

module.exports = router;
