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

router.get("/get-user-suspended", async (req, res, next) => {
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
        where: {
          status: "INACTIVE",
        },
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

router.post("/add-user", async (req, res, next) => {
  const { account_detail, prize_package, settings } = req.body;

  if (!account_detail || !prize_package || !settings) {
    return res.status(400).json({
      message: "account_detail, prize_package, settings are required",
    });
  }
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

      const hashedPassword = await bcrypt.hash(account_detail.password, 10);
      const currencyObject = account_detail.currency;
      // Convert to array of strings
      const resultArray = Object.keys(currencyObject)
        .filter((key) => currencyObject[key])
        .map((key) => key.toUpperCase());
      const currencyString = JSON.stringify(resultArray).replace(/"/g, "'");

      const intake = {
        gd: settings.gd,
        magnum: settings.magnum,
        pmp: settings.pmp,
        sabah: settings.sabah,
        sandakan: settings.sandakan,
        sarawak: settings.sarawak,
        singapore: settings.singapore,
        toto: settings.toto,
        _9lotto: settings._9lotto,
      };

      //const currencyString = []
      await prisma.$transaction(async (prisma) => {
        const newUser = await prisma.user.create({
          data: {
            name: account_detail.full_name,
            username: account_detail.login_id,
            password: hashedPassword,
            mobile: account_detail.mobile,
            credit: 0,
            credit_limit: parseFloat(account_detail.credit_limit) || 0,
            remark: account_detail.remark,
            status: "ACTIVE",
            account_level: "Agent",
            currency: currencyString,
            is_open_downline: account_detail.open_downline,
            referral: null,
            sub_user_setting: "",
            position_taking: JSON.stringify(account_detail.position_taking),
            position_taking_9Lotto: JSON.stringify(
              account_detail.position_taking_9Lotto
            ),
            position_taking_GD: JSON.stringify(
              account_detail.position_taking_GD
            ),
            auto_transfer: "",
            manual_transfer: "",
            ip_address: "",
          },
        });

        const addPackageUser = await prisma.package.create({
          data: {
            user_id: parseInt(newUser.id),
            detail: JSON.stringify({
              big: {
                price: "1.00",
                commission: "27.00",
                rebate: "27.00",
                prize_1: "2,730.00",
                prize_2: "1,050.00",
                prize_3: "525.00",
                prize_4: "210.00",
                prize_5: "63.00",
                prize_6: "",
              },
              small: {
                price: "1.00",
                commission: "27.00",
                rebate: "27.00",
                prize_1: "3,780.00",
                prize_2: "2,100.00",
                prize_3: "1,050.00",
                prize_4: "",
                prize_5: "",
                prize_6: "",
              },
              "4A": {
                price: "1.00",
                commission: "27.00",
                rebate: "27.00",
                prize_1: "6,615.00",
                prize_2: "6,615.00",
                prize_3: "6,615.00",
                prize_4: "661.50",
                prize_5: "661.50",
                prize_6: "2,205.00",
              },
              A: {
                price: "1.00",
                commission: "27.00",
                rebate: "27.00",
                prize_1: "693.00",
                prize_2: "693.00",
                prize_3: "693.00",
                prize_4: "69.30",
                prize_5: "69.30",
                prize_6: "",
              },
              ABC: {
                price: "1.00",
                commission: "27.00",
                rebate: "27.00",
                prize_1: "231.00",
                prize_2: "231.00",
                prize_3: "231.00",
                prize_4: "",
                prize_5: "",
                prize_6: "",
              },
              "5D": {
                price: "1.00",
                commission: "29.00",
                rebate: "29.00",
                prize_1: "16,500.00",
                prize_2: "5,500.00",
                prize_3: "3,300.00",
                prize_4: "550.00",
                prize_5: "22.00",
                prize_6: "5.50",
              },
              "6D": {
                price: "1.00",
                commission: "29.00",
                rebate: "29.00",
                prize_1: "110,000.00",
                prize_2: "3,300.00",
                prize_3: "330.00",
                prize_4: "33.00",
                prize_5: "4.40",
                prize_6: "",
              },
              "2A": {
                price: "1.00",
                commission: "0.00",
                rebate: "00.00",
                prize_1: "63.00",
                prize_2: "63.00",
                prize_3: "63.00",
                prize_4: "6.30",
                prize_5: "6.30",
                prize_6: "",
              },
              "2F": {
                price: "1.00",
                commission: "0.00",
                rebate: "00.00",
                prize_1: "21.00",
                prize_2: "21.00",
                prize_3: "21.00",
                prize_4: "",
                prize_5: "",
                prize_6: "",
              },
            }),
            ibox: JSON.stringify({
              big: {
                ibox_24: {
                  prize_1: "113.75",
                  prize_2: "43.75",
                  prize_3: "21.88",
                  starters: "8.75",
                  consolation: "2.63",
                },
                ibox_12: {
                  prize_1: "227.50",
                  prize_2: "87.50",
                  prize_3: "43.75",
                  starters: "17.50",
                  consolation: "5.25",
                },
                ibox_6: {
                  prize_1: "455.00",
                  prize_2: "175.00",
                  prize_3: "87.50",
                  starters: "35.00",
                  consolation: "10.50",
                },
                ibox_4: {
                  prize_1: "682.50",
                  prize_2: "262.50",
                  prize_3: "131.25",
                  starters: "52.50",
                  consolation: "15.75",
                },
              },
              small: {
                ibox_24: {
                  prize_1: "157.50",
                  prize_2: "87.50",
                  prize_3: "43.75",
                },
                ibox_12: {
                  prize_1: "315.00",
                  prize_2: "175.00",
                  prize_3: "87.50",
                },
                ibox_6: {
                  prize_1: "630.00",
                  prize_2: "350.00",
                  prize_3: "175.00",
                },
                ibox_4: {
                  prize_1: "945.00",
                  prize_2: "525.00",
                  prize_3: "262.50",
                },
              },
              "4A": {
                ibox_24: {
                  prize: "275.63",
                  "4B": "275.63",
                  "4C": "275.63",
                  "4D": "27.56",
                  "4E": "27.56",
                  "4F": "91.88",
                },
                ibox_12: {
                  prize: "551.25",
                  "4B": "551.25",
                  "4C": "551.25",
                  "4D": "55.13",
                  "4E": "55.13",
                  "4F": "183.75",
                },
                ibox_6: {
                  prize: "1,102.50",
                  "4B": "1,102.50",
                  "4C": "1,102.50",
                  "4D": "110.25",
                  "4E": "110.25",
                  "4F": "367.50",
                },
                ibox_4: {
                  prize: "1,653.75",
                  "4B": "1,653.75",
                  "4C": "1,653.75",
                  "4D": "165.38",
                  "4E": "165.38",
                  "4F": "551.25",
                },
              },
            }),
            gd_package: JSON.stringify({
              big: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "3,045.00",
                prize_2: "1,050.00",
                prize_3: "525.00",
                starters: "210.00",
                consolation: "63.00",
              },
              small: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "4,095.00",
                prize_2: "2,100.00",
                prize_3: "1,050.00",
              },
              "4A": {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "7,140.00",
                prize_2: "7,140.00",
                prize_3: "7,140.00",
                starters: "714.00",
                consolation: "714.00",
                prize_6: "2,380.00",
              },
              A: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "740.25",
                prize_2: "740.25",
                prize_3: "740.25",
                starters: "74.03",
                consolation: "74.03",
              },
              ABC: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "246.75",
                prize_2: "246.75",
                prize_3: "246.75",
              },
              "6D": {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "157,500.00",
                prize_2: "5,250.00",
                prize_3: "525.00",
                starters: "52.50",
                consolation: "5.25",
              },
              "2A": {
                price: "1.00",
                commission: "3.00",
                rebate: "3.00",
                prize_1: "91.80",
                prize_2: "91.80",
                prize_3: "91.80",
                starters: "9.18",
                consolation: "9.18",
              },
              "2F": {
                price: "1.00",
                commission: "3.00",
                rebate: "3.00",
                prize_1: "30.60",
                prize_2: "30.60",
                prize_3: "30.60",
              },
            }),
            gd_ibox: JSON.stringify({
              big: {
                prize_1: {
                  ibox_24: "126.88",
                  ibox_12: "253.75",
                  ibox_6: "507.50",
                  ibox_4: "761.25",
                },
                prize_2: {
                  ibox_24: "43.75",
                  ibox_12: "87.50",
                  ibox_6: "175.00",
                  ibox_4: "262.50",
                },
                prize_3: {
                  ibox_24: "21.88",
                  ibox_12: "43.75",
                  ibox_6: "87.50",
                  ibox_4: "131.25",
                },
                starters: {
                  ibox_24: "8.75",
                  ibox_12: "17.50",
                  ibox_6: "35.00",
                  ibox_4: "52.50",
                },
                consolation: {
                  ibox_24: "2.63",
                  ibox_12: "5.25",
                  ibox_6: "10.50",
                  ibox_4: "15.75",
                },
              },
              small: {
                prize_1: {
                  ibox_24: "170.63",
                  ibox_12: "341.25",
                  ibox_6: "682.50",
                  ibox_4: "1023.75",
                },
                prize_2: {
                  ibox_24: "87.50",
                  ibox_12: "175.00",
                  ibox_6: "350.00",
                  ibox_4: "525.00",
                },
                prize_3: {
                  ibox_24: "43.75",
                  ibox_12: "87.50",
                  ibox_6: "175.00",
                  ibox_4: "262.50",
                },
              },
              "4A": {
                prize: {
                  ibox_24: "297.50",
                  ibox_12: "595.00",
                  ibox_6: "1190.00",
                  ibox_4: "1785.00",
                },
                "4B": {
                  ibox_24: "297.50",
                  ibox_12: "595.00",
                  ibox_6: "1190.00",
                  ibox_4: "1785.00",
                },
                "4C": {
                  ibox_24: "297.50",
                  ibox_12: "595.00",
                  ibox_6: "1190.00",
                  ibox_4: "1785.00",
                },
                "4D": {
                  ibox_24: "29.75",
                  ibox_12: "59.50",
                  ibox_6: "119.00",
                  ibox_4: "178.50",
                },
                "4E": {
                  ibox_24: "29.75",
                  ibox_12: "59.50",
                  ibox_6: "119.00",
                  ibox_4: "178.50",
                },
                "4F": {
                  ibox_24: "99.17",
                  ibox_12: "198.33",
                  ibox_6: "396.67",
                  ibox_4: "595.00",
                },
              },
            }),
            nine_lotto_package: JSON.stringify({
              big: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "3,150.00",
                prize_2: "1,050.00",
                prize_3: "525.00",
                starters: "210.00",
                consolation: "63.00",
              },
              small: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "4,200.00",
                prize_2: "2,100.00",
                prize_3: "1,050.00",
              },
              "4A": {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "7,350.00",
                prize_2: "7,350.00",
                prize_3: "7,350.00",
                starters: "735.00",
                consolation: "735.00",
                prize_6: "2,450.00",
              },
              A: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "756.00",
                prize_2: "756.00",
                prize_3: "756.00",
                starters: "75.60",
                consolation: "75.60",
              },
              ABC: {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "252.00",
                prize_2: "252.00",
                prize_3: "252.00",
              },
              "2A": {
                price: "1.00",
                commission: "4.00",
                rebate: "4.00",
                prize_1: "91.80",
                prize_2: "91.80",
                prize_3: "91.80",
                starters: "9.18",
                consolation: "9.18",
              },
              "2F": {
                price: "1.00",
                commission: "4.00",
                rebate: "4.00",
                prize_1: "30.60",
                prize_2: "30.60",
                prize_3: "30.60",
              },
              "6D": {
                price: "1.00",
                commission: "19.00",
                rebate: "19.00",
                prize_1: "105,000.00",
                prize_2: "3,150.00",
                prize_3: "315.00",
                starters: "31.50",
                consolation: "4.20",
              },
            }),
            nine_lotto_ibox: JSON.stringify({
              big: {
                ibox_24: {
                  prize_1: "131.25",
                  prize_2: "43.75",
                  prize_3: "21.88",
                  starters: "8.75",
                  consolation: "2.63",
                },
                ibox_12: {
                  prize_1: "262.50",
                  prize_2: "87.50",
                  prize_3: "43.75",
                  starters: "17.50",
                  consolation: "5.25",
                },
                ibox_6: {
                  prize_1: "525.00",
                  prize_2: "175.00",
                  prize_3: "87.50",
                  starters: "35.00",
                  consolation: "10.50",
                },
                ibox_4: {
                  prize_1: "787.50",
                  prize_2: "262.50",
                  prize_3: "131.25",
                  starters: "52.50",
                  consolation: "15.75",
                },
              },
              small: {
                ibox_24: {
                  prize_1: "175.00",
                  prize_2: "87.50",
                  prize_3: "43.75",
                },
                ibox_12: {
                  prize_1: "350.00",
                  prize_2: "175.00",
                  prize_3: "87.50",
                },
                ibox_6: {
                  prize_1: "700.00",
                  prize_2: "350.00",
                  prize_3: "175.00",
                },
                ibox_4: {
                  prize_1: "1,050.00",
                  prize_2: "525.00",
                  prize_3: "262.50",
                },
              },
              "4A": {
                ibox_24: {
                  prize: "306.25",
                  "4B": "306.25",
                  "4C": "306.25",
                  "4D": "30.63",
                  "4E": "30.63",
                  "4F": "102.08",
                },
                ibox_12: {
                  prize: "612.50",
                  "4B": "612.50",
                  "4C": "612.50",
                  "4D": "61.25",
                  "4E": "61.25",
                  "4F": "204.17",
                },
                ibox_6: {
                  prize: "1,225.00",
                  "4B": "1,225.00",
                  "4C": "1,225.00",
                  "4D": "122.50",
                  "4E": "122.50",
                  "4F": "408.33",
                },
                ibox_4: {
                  prize: "1,837.50",
                  "4B": "1,837.50",
                  "4C": "1,837.50",
                  "4D": "183.75",
                  "4E": "183.75",
                  "4F": "612.50",
                },
              },
            }),
            status: "ACTIVE",
          },
        });

        const addUserSetting = await prisma.user_setting.create({
          data: {
            user_id: parseInt(newUser.id),
            sms_service: settings.sms_service === "true" ? true : false,
            bet_method: settings.bet_method,
            bet_1000_number: settings.bet_1000_number === "true" ? true : false,
            bet_setting: settings.bet_setting === "true" ? true : false,
            box_ibox: settings.box_ibox,
            bet_date: settings.buy_format,
            bet_type: settings.bet_type || settings.buy_type,
            draw_date: settings.draw_date,
            draw_type: JSON.stringify(settings.draw_type),
            intake: JSON.stringify(intake),
          },
        });
      });

      res.json({
        status: "sucecess",
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

router.get("/get-id/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
      },
    });

    const totalAgent = await prisma.user.count({
      where: {
        referral: parseInt(user.id),
      },
    });

    const package = await prisma.package.findFirst({
      where: {
        user_id: parseInt(user.id),
      },
    });

    const userSetting = await prisma.user_setting.findFirst({
      where: {
        user_id: parseInt(user.id),
      },
    });

    if (user) {
      res.json({
        ...user,
        total_agents: totalAgent,
        package: package,
        setting: userSetting,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/get-username/:username", async (req, res) => {
  const username = req.params.username;

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });

    const totalAgent = await prisma.user.count({
      where: {
        referral: parseInt(user.id),
      },
    });

    const package = await prisma.package.findFirst({
      where: {
        user_id: parseInt(user.id),
      },
    });

    const userSetting = await prisma.user_setting.findFirst({
      where: {
        user_id: parseInt(user.id),
      },
    });

    if (user) {
      res.json({
        ...user,
        total_agents: totalAgent,
        package: package,
        setting: userSetting,
      });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
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
