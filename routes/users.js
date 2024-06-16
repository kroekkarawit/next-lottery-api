const express = require("express");
const router = express.Router();
const { PrismaClient, Status } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { update, isEmpty } = require("lodash");

router.get("/get/:username", async (req, res) => {
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
    /*
    const userSetting = {
      draw_type: {
        include: ["M", "P", "T", "S", "B", "K", "W"],
        remove: ["H", "E"],
      },
      bet_method: "multiply",
      bet_type: "B-S-4A-A-C",
      bet_date: "D",
      draw_date: "#",
      bet_1000_number: true,
      sms_service: true,
      box_ibox: "**",
      bet_setting: true,
      intake: {
        M: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        P: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        T: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "5D": 0,
          "6D": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        S: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        B: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        K: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        W: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        H: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "6D": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
        E: {
          big: 0,
          small: 0,
          "4A": 0,
          "4B": 0,
          "4C": 0,
          "4E": 0,
          "4F": 0,
          A: 0,
          ABC: 0,
          "3B": 0,
          "3C": 0,
          "3D": 0,
          "3E": 0,
          "6D": 0,
          "2A": 0,
          "2F": 0,
          "2B": 0,
          "2C": 0,
          "2D": 0,
          "2E": 0,
        },
      },
    };
    */

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

router.get("/gets", async (req, res) => {
  try {
    const user = await prisma.user.findMany({});

    if (user) {
      res.json(user);
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

router.get("/gen-user", async (req, res, next) => {
  try {
    const createdUser = await prisma.user.create({
      data: {
        name: "John Doe",
        username: "johndoe123",
        password: "password123",
        mobile: "123456789",
        credit: 100.5,
        remark: "Remark",
        status: "ACTIVE",
        currency: "USD",
        account_level: "Agent",
      },
    });
    console.log("Created user:", createdUser);
    res.json(createdUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password, ip_address } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  console.log("Login:", req.body);

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    const updateUser = await prisma.user.update({
      where: {
        username: username,
      },
      data: {
        ip_address: ip_address,
      },
    });

    const getDownlineUser = await prisma.user.findMany({
      where: {
        referral: parseInt(user.id),
        account_level: "User",
        status: "ACTIVE",
      },
      select: {
        id: true,
        username: true,
        name: true,
        credit: true,
        currency: true,
      },
    });

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      mobile: user.mobile,
      credit: user.credit,
      credit_limit: user.credit_limit,
      currency: user.currency,
      is_open_downline: user.is_open_downline,
      account_level: user.account_level,
      status: user.status,
      image: "avatar",
      role: user.role,
      access_token: accessToken,
      downline_user: getDownlineUser,
      ip_address: ip_address,
      sub_user_setting: JSON.parse(user?.sub_user_setting || null),
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

router.get("/main-data", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const getUserPackage = await prisma.package.findFirst({
        where: {
          user_id: parseInt(user.id),
        },
      });

      if (user.account_level === "Sub_user") {
        const findUpLineUser = await prisma.user.findFirst({
          where: {
            id: parseInt(user.referral),
          },
        });

        const getUserPackage = await prisma.package.findFirst({
          where: {
            user_id: parseInt(user.referral),
          },
        });

        const accountDetails = findUpLineUser;
        const positionTaking = {
          position_taking: findUpLineUser.position_taking,
          position_taking_gd: findUpLineUser.position_taking_GD,
        };

        const {
          detail,
          gd_ibox,
          gd_package,
          ibox,
          nine_lotto_ibox,
          nine_lotto_package,
        } = getUserPackage;

        res.json({
          account_details: accountDetails,
          position_taking: positionTaking,
          user_package: {
            ...getUserPackage,
            details: JSON.parse(detail),
            gd_ibox: JSON.parse(gd_ibox),
            gd_package: JSON.parse(gd_package),
            ibox: JSON.parse(ibox),
            nine_lotto_ibox: JSON.parse(nine_lotto_ibox),
            nine_lotto_package: JSON.parse(nine_lotto_package),
          },
        });
      }

      const accountDetails = user;
      const positionTaking = {
        position_taking: user.position_taking,
        position_taking_gd: user.position_taking_GD,
      };

      const {
        detail,
        gd_ibox,
        gd_package,
        ibox,
        nine_lotto_ibox,
        nine_lotto_package,
      } = getUserPackage;

      const userPackage = res.json({
        account_details: accountDetails,
        position_taking: positionTaking,
        user_package: {
          ...getUserPackage,
          details: JSON.parse(detail),
          gd_ibox: JSON.parse(gd_ibox),
          gd_package: JSON.parse(gd_package),
          ibox: JSON.parse(ibox),
          nine_lotto_ibox: JSON.parse(nine_lotto_ibox),
          nine_lotto_package: JSON.parse(nine_lotto_package),
        },
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

router.get("/refresh-session", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);
  const username = decodedToken.username;

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    if (user.account_level === "Sub_user") {
      const findUpLineUser = await prisma.user.findFirst({
        where: {
          id: parseInt(user.referral),
        },
      });

      const getDownlineUser = await prisma.user.findMany({
        where: {
          referral: parseInt(findUpLineUser.id),
          account_level: "User",
          status: "ACTIVE",
        },
        select: {
          id: true,
          username: true,
          name: true,
          credit: true,
          currency: true,
        },
      });

      return res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        main_name: findUpLineUser.name,
        main_username: findUpLineUser.username,
        mobile: user.mobile,
        credit: findUpLineUser.credit,
        credit_limit: findUpLineUser.credit_limit,
        currency: findUpLineUser.currency,
        is_open_downline: findUpLineUser.is_open_downline,
        account_level: user.account_level,
        status: user.status,
        image: "avatar",
        role: user.role,
        access_token: newAccessToken,
        downline_user: getDownlineUser,
        sub_user_setting: JSON.parse(user?.sub_user_setting || null),
      });
    }

    const getDownlineUser = await prisma.user.findMany({
      where: {
        referral: parseInt(user.id),
        account_level: "User",
        status: "ACTIVE",
      },
      select: {
        id: true,
        username: true,
        name: true,
        credit: true,
        currency: true,
      },
    });

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      mobile: user.mobile,
      credit: user.credit,
      credit_limit: user.credit_limit,
      currency: user.currency,
      is_open_downline: user.is_open_downline,
      account_level: user.account_level,
      status: user.status,
      image: "avatar",
      role: user.role,
      access_token: newAccessToken,
      downline_user: getDownlineUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

router.post("/change-password", async (req, res, next) => {
  const { newPassword, oldPassword } = req.body;
  if (!newPassword || !oldPassword) {
    return res
      .status(400)
      .json({ message: "Old password and new password are required" });
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const passwordMatch = await bcrypt.compare(oldPassword, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }
      const newPasswordEncrypted = await bcrypt.hash(newPassword, 10);
      const updatedPassword = await prisma.user.update({
        where: {
          username: username,
        },
        data: {
          password: newPasswordEncrypted,
        },
      });
      res.json({
        id: user.id,
        message: "User password changed",
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

router.get("/get-credit", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        credit: user.credit,
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
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (parseFloat(user.credit) < parseFloat(account_detail.credit_limit)) {
        return res.status(404).json({ message: "User credit is insufficient" });
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
            credit: parseFloat(account_detail.credit_limit) || 0,
            credit_limit: 0,
            remark: account_detail.remark,
            status: "ACTIVE",
            account_level: "User",
            currency: currencyString,
            is_open_downline: account_detail.open_downline,
            referral: parseInt(user.id),
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

      const adjustUplineCredit = await prisma.user.update({
        where: {
          id: parseInt(user.id),
        },
        data: {
          credit:
            parseFloat(user.credit) - parseFloat(account_detail.credit_limit),
        },
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

router.post("/edit-user", async (req, res, next) => {
  const { user_id, account_detail, prize_package, settings } = req.body;

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
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (parseFloat(user.credit) < parseFloat(account_detail.credit_limit)) {
        return res.status(404).json({ message: "User credit is insufficient" });
      }

      const hashedPassword = await bcrypt.hash(account_detail.password, 10);
      const currencyObject = account_detail.currency;
      // Convert to array of strings
      const resultArray = Object.keys(currencyObject)
        .filter((key) => currencyObject[key])
        .map((key) => key.toUpperCase());
      const currencyString = JSON.stringify(resultArray).replace(/"/g, "'");

      const updateUser = await prisma.user.update({
        where: {
          id: parseInt(user_id),
        },
        data: {
          name: account_detail.full_name,
          mobile: account_detail.mobile,
          credit: 0,
          credit_limit: parseFloat(account_detail.credit_limit) || 0,
          remark: account_detail.remark,
          status: "ACTIVE",
          account_level: "User",
          currency: currencyString,
          is_open_downline: account_detail.open_downline,
          referral: parseInt(user.id),
          sub_user_setting: "",
          position_taking: JSON.stringify(account_detail.position_taking),
          position_taking_9Lotto: JSON.stringify(
            account_detail.position_taking_9Lotto
          ),
          position_taking_GD: JSON.stringify(account_detail.position_taking_GD),
          auto_transfer: "",
          manual_transfer: "",
          ip_address: "",
        },
      });

      res.json({ updateUser });
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

router.get("/get-user", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.account_level === "Sub_user") {
        const findUpLineUser = await prisma.user.findFirst({
          where: {
            id: parseInt(user.referral),
          },
        });

        const getAllRefUser = await prisma.user.findMany({
          where: {
            referral: parseInt(findUpLineUser.id),
            account_level: "User",
            status: "ACTIVE",
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

        return res.json({
          data: getAllRefUser,
        });
      }

      const getAllRefUser = await prisma.user.findMany({
        where: {
          referral: parseInt(user.id),
          account_level: "User",
          status: "ACTIVE",
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
        data: getAllRefUser,
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

router.post("/agent", async (req, res, next) => {
  const { user_id } = req.body;

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const getRefUser = await prisma.user.findFirst({
        where: {
          id: parseInt(user_id),
          referral: parseInt(user.id),
          account_level: "User",
          status: "ACTIVE",
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
        data: getRefUser,
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

router.post("/transfer", async (req, res, next) => {
  const transfers = req.body;

  if (!Array.isArray(transfers) || transfers.length === 0) {
    return res
      .status(400)
      .json({ message: "Transfers array is required and cannot be empty" });
  }

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.account_level === "Sub_user") {
        const findUpLineUser = await prisma.user.findFirst({
          where: {
            id: parseInt(user.referral),
          },
        });

        const results = [];
        for (const transfer of transfers) {
          const { to_user_id, amount, remark } = transfer;

          if (!to_user_id || !amount) {
            return res.status(400).json({
              message: "to_user_id and amount are required for each transfer",
            });
          }

          const ToUser = await prisma.user.findFirst({
            where: {
              id: parseInt(to_user_id),
              referral: parseInt(findUpLineUser.id),
            },
          });

          if (!ToUser) {
            return res
              .status(404)
              .json({
                message: `User not found for to_user_id: ${to_user_id}`,
              });
          }

          const updateFromUser = await prisma.user.update({
            where: {
              id: parseInt(findUpLineUser.id),
            },
            data: {
              balance: parseFloat(findUpLineUser.balance) - parseFloat(amount),
            },
          });

          const updateToUser = await prisma.user.update({
            where: {
              id: parseInt(to_user_id),
              referral: parseInt(findUpLineUser.id),
            },
            data: {
              balance: parseFloat(ToUser.balance) + parseFloat(amount),
            },
          });



          const createTransfer = await prisma.transfer.create({
            data: {
              user_id: parseInt(findUpLineUser.id),
              to_user_id: parseInt(to_user_id),
              remark: remark || "",
              previous_balance: ToUser.balance,
              amount: amount,
              balance: parseFloat(ToUser.balance) + parseFloat(amount),
            },
          });

          results.push(createTransfer);
        }

        res.json({
          transfers: results,
        });



      } else {
        const results = [];
        for (const transfer of transfers) {
          const { to_user_id, amount, remark } = transfer;

          if (!to_user_id || !amount) {
            return res.status(400).json({
              message: "to_user_id and amount are required for each transfer",
            });
          }

          const ToUser = await prisma.user.findFirst({
            where: {
              id: parseInt(to_user_id),
              referral: parseInt(user.id),
            },
          });

          if (!ToUser) {
            return res
              .status(404)
              .json({
                message: `User not found for to_user_id: ${to_user_id}`,
              });
          }

          const updateFromUser = await prisma.user.update({
            where: {
              id: parseInt(user.id),
            },
            data: {
              balance: parseFloat(user.balance) - parseFloat(amount),
            },
          });

          const updateUser = await prisma.user.update({
            where: {
              id: parseInt(to_user_id),
              referral: parseInt(user.id),
            },
            data: {
              balance: parseFloat(ToUser.balance) + parseFloat(amount),
            },
          });

          const createTransfer = await prisma.transfer.create({
            data: {
              user_id: parseInt(user.id),
              to_user_id: parseInt(to_user_id),
              remark: remark || "",
              previous_balance: ToUser.balance,
              amount: amount,
              balance: parseFloat(ToUser.balance) + parseFloat(amount),
            },
          });

          results.push(createTransfer);
        }

        res.json({
          transfers: results,
        });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  } else {
    res.status(401).json({ error: "Authentication failed" });
  }
});

router.get("/transfer-history", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const transfersHistory = await prisma.transfer.findMany({
        where: {
          user_id: parseInt(user.id),
        },
      });

      res.json({
        data: transfersHistory,
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

router.post("/sub-user", async (req, res, next) => {
  const { action, update, insert, id: user_id } = req.body;

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (!decodedToken) {
    return res.status(404).json({ message: "decodedToken not found" });
  }

  const username = decodedToken.username;
  const user = await prisma.user.findFirst({
    where: {
      username: username,
    },
  });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (action === "insert") {
    const {
      loginId: subuser_username,
      password,
      mobile,
      email,
      remark,
      name,
      account_status: status,
      is_account,
      transfer_check,
      intake_check,
      voidbet_check,
      report_view,
    } = insert;
    const existingUser = await prisma.user.findUnique({
      where: {
        username: subuser_username,
      },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const createSubUser = await prisma.user.create({
      data: {
        name: name,
        username: subuser_username,
        password: hashedPassword,
        email: email,
        mobile: mobile,
        credit: 0,
        credit_limit: 0,
        outstanding: 0,
        balance: 0,
        remark: remark || "",
        status: status,
        account_level: "Sub_user",
        currency: null,
        is_open_downline: false,
        ip_address: null,
        auto_transfer: null,
        manual_transfer: null,
        position_taking: null,
        position_taking_9Lotto: null,
        position_taking_GD: null,
        referral: parseInt(user.id),
        sub_user_setting: JSON.stringify({
          reports_view: report_view,
          transfer: transfer_check,
          intake: intake_check,
          void_bet: voidbet_check,
          is_account: is_account,
        }),
      },
    });

    res.json({ status: "success" });
  } else if (action == "update") {
    console.log("update", update);

    const {
      id: user_id,
      name,
      email,
      remark,
      password,
      account_status: status,
      is_account,
      transfer: transfer_check,
      intake: intake_check,
      void_bet: voidbet_check,
      report_view,
    } = update;

    const hashedPassword = await bcrypt.hash(password, 10);

    const dataToUpdate = {
      name: name,
      email: email,
      remark: remark || "",
      status: status,
      sub_user_setting: JSON.stringify({
        reports_view: report_view,
        transfer: transfer_check,
        intake: intake_check,
        void_bet: voidbet_check,
        is_account: is_account,
      }),
    };

    if (password != null || password != "*****") {
      dataToUpdate.password = hashedPassword;
    }

    const updateSubUser = await prisma.user.update({
      where: {
        id: parseInt(user_id),
      },
      data: dataToUpdate,
    });

    res.json({
      status: "success",
    });
  }
});

router.get("/sub-user", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const getAllSubUser = await prisma.user.findMany({
        where: {
          referral: parseInt(user.id),
          account_level: "Sub_user",
          status: "ACTIVE",
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
          sub_user_setting: true,
          created_at: true,
        },
      });

      res.json({
        data: getAllSubUser,
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

// Todo: refactor this route
router.get("/package-list", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let package = {
        "2D": {
          name: "2",
          bet_type: "2D",
          data: [
            {
              "2A": {
                Price: 1,
                Commission: 0,
                Prizes: {
                  "Prize 1": 63,
                  "Prize 2": null,
                  "Prize 3": null,
                },
              },
              "2F": {
                Price: 1,
                Commission: 0,
                Prizes: {
                  "Prize 1": 21,
                  "Prize 2": 21,
                  "Prize 3": 21,
                },
              },
            },
          ],
        },
        "5D6D": {
          name: "6D",
          bet_type: "5D/6D",
          data: [
            {
              "5D": {
                Price: 1,
                Commission: 29,
                Prizes: {
                  "Prize 1": 16500,
                  "Prize 2": 5500,
                  "Prize 3": 3300,
                  "Prize 4": 550,
                  "Prize 5": 22,
                },
              },
              "6D": {
                Price: 1,
                Commission: 29,
                Prizes: {
                  "Prize 1": 110000,
                  "Prize 2": 3300,
                  "Prize 3": 330,
                  "Prize 4": 33,
                  "Prize 5": 4.4,
                  "Prize 6": 5.5,
                },
              },
            },
          ],
        },
        "4D3D": {
          name: "184",
          bet_type: "4D/3D",
          data: [
            {
              Big: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 2730,
                  "Prize 2": 1050,
                  "Prize 3": 525,
                  "Prize 4": 210,
                  "Prize 5": 63,
                },
              },
              Small: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 3780,
                  "Prize 2": 2100,
                  "Prize 3": 1050,
                  "Prize 4": "4D: 661.50",
                  "Prize 5": "4E: 661.50",
                },
              },
              "4A": {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 6615,
                  "Prize 2": "4B: 6615.00",
                  "Prize 3": "4C: 6615.00",
                  "Prize 4": "4D: 661.50",
                  "Prize 5": "4F: 2205.00",
                },
              },
              A: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 693,
                  "Prize 2": "3B: 693.00",
                  "Prize 3": "3C: 693.00",
                  "Prize 4": "3D: 69.30",
                  "Prize 5": "3E: 69.30",
                },
              },
              ABC: {
                Price: 1,
                Commission: 27,
                Prizes: {
                  "Prize 1": 231,
                  "Prize 2": 231,
                  "Prize 3": 231,
                },
              },
            },
            {
              BIG: {
                "IBox 24": {
                  "Prize 1": 113.75,
                  "Prize 2": 43.75,
                  "Prize 3": 21.88,
                  Starters: 8.75,
                  Consolation: 2.63,
                },
                "IBox 12": {
                  "Prize 1": 227.5,
                  "Prize 2": 87.5,
                  "Prize 3": 43.75,
                  Starters: 17.5,
                  Consolation: 5.25,
                },
                "IBox 6": {
                  "Prize 1": 455,
                  "Prize 2": 175,
                  "Prize 3": 87.5,
                  Starters: 35,
                  Consolation: 10.5,
                },
                "IBox 4": {
                  "Prize 1": 682.5,
                  "Prize 2": 262.5,
                  "Prize 3": 131.25,
                  Starters: 52.5,
                  Consolation: 15.75,
                },
              },
              SMALL: {
                "IBox 24": {
                  "Prize 1": 157.5,
                  "Prize 2": 87.5,
                  "Prize 3": 43.75,
                },
                "IBox 12": {
                  "Prize 1": 315,
                  "Prize 2": 175,
                  "Prize 3": 87.5,
                },
                "IBox 6": {
                  "Prize 1": 630,
                  "Prize 2": 350,
                  "Prize 3": 175,
                },
                "IBox 4": {
                  "Prize 1": 945,
                  "Prize 2": 525,
                  "Prize 3": 262.5,
                },
              },
              "4A": {
                "IBox 24": 275.63,
                "IBox 12": 551.25,
                "IBox 6": 1102.5,
                "IBox 4": 1653.75,
              },
              "4B": {
                "IBox 24": 275.63,
                "IBox 12": 551.25,
                "IBox 6": 1102.5,
                "IBox 4": 1653.75,
              },
              "4C": {
                "IBox 24": 275.63,
                "IBox 12": 551.25,
                "IBox 6": 1102.5,
                "IBox 4": 1653.75,
              },
              "4D": {
                "IBox 24": 27.56,
                "IBox 12": 55.13,
                "IBox 6": 110.25,
                "IBox 4": 165.38,
              },
              "4E": {
                "IBox 24": 27.56,
                "IBox 12": 55.13,
                "IBox 6": 110.25,
                "IBox 4": 165.38,
              },
              "4F": {
                "IBox 24": 91.88,
                "IBox 12": 183.75,
                "IBox 6": 367.5,
                "IBox 4": 551.25,
              },
            },
          ],
        },
        main: {
          2: {
            "2A": {
              Price: 1,
              Commission: "0.00%",
              Prizes: {
                "Prize 1": 63,
                "Prize 2": "2B: 63.00",
                "Prize 3": "2C: 63.00",
                "Prize 4": "2D: 6.30",
                "Prize 5": "2E: 6.30",
              },
            },
            "2F": {
              Price: 1,
              Commission: "0.00%",
              Prizes: {
                "Prize 1": 21,
                "Prize 2": 21,
                "Prize 3": 21,
                "Prize 4": null,
                "Prize 5": null,
              },
            },
          },
          56: {
            "5D": {
              Price: 1,
              Commission: "29.00%",
              Prizes: {
                "Prize 1": 16500,
                "Prize 2": 5500,
                "Prize 3": 3300,
                "Prize 4": 550,
                "Prize 5": 22,
                "Prize 6": 5.5,
              },
            },
            "6D": {
              Price: 1,
              Commission: "29.00%",
              Prizes: {
                "Prize 1": 110000,
                "Prize 2": 3300,
                "Prize 3": 330,
                "Prize 4": 33,
                "Prize 5": 4.4,
              },
            },
          },
          184: {
            Big: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 2730,
                "Prize 2": 1050,
                "Prize 3": 525,
                "Prize 4": 210,
                "Prize 5": 63,
              },
            },
            Small: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 3780,
                "Prize 2": 2100,
                "Prize 3": 1050,
                "Prize 4": "4D: 661.50",
                "Prize 5": "4E: 661.50",
              },
            },
            "4A": {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 6615,
                "Prize 2": "4B: 6615.00",
                "Prize 3": "4C: 6615.00",
                "Prize 4": "4D: 661.50",
                "Prize 5": "4F: 2205.00",
              },
            },
            A: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 693,
                "Prize 2": "3B: 693.00",
                "Prize 3": "3C: 693.00",
                "Prize 4": "3D: 69.30",
                "Prize 5": "3E: 69.30",
              },
            },
            ABC: {
              Price: 1,
              Commission: "27.00%",
              Prizes: {
                "Prize 1": 231,
                "Prize 2": 231,
                "Prize 3": 231,
              },
            },
          },
        },
      };
      console.log("package", package);

      res.json(package);
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

// Todo: refactor this route
router.get("/fight-eat-credit", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        M: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        P: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        T: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "5D": "0",
          "6D": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        S: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        B: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        K: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        W: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        H: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        E: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "6D": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
        K: {
          Big: "0",
          Small: "0",
          "4A": "0",
          "4B": "0",
          "4C": "0",
          "4D": "0",
          "4E": "0",
          "4F": "0",
          A: "0",
          ABC: "0",
          "3B": "0",
          "3C": "0",
          "3D": "0",
          "3E": "0",
          "6D": "0",
          "2A": "0",
          "2F": "0",
          "2B": "0",
          "2C": "0",
          "2D": "0",
          "2E": "0",
        },
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

router.post("/fight-eat-credit", async (req, res, next) => {
  const { data } = req.body;

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingRecord = await prisma.fight_eat_credit.findUnique({
        where: {
          user_id: parseInt(user.id),
        },
      });

      if (existingRecord) {
        const updatedFightEat = await prisma.fight_eat_credit.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            magnum: JSON.stringify(data.M),
            pmp: JSON.stringify(data.P),
            toto: JSON.stringify(data.T),
            singapore: JSON.stringify(data.S),
            sabah: JSON.stringify(data.B),
            sandakan: JSON.stringify(data.K),
            sarawak: JSON.stringify(data.W),
            gd: JSON.stringify(data.H),
            nine_lotto: JSON.stringify(data.E),
          },
        });
        res.json({ status: "success", data: updatedFightEat });
      } else {
        // Handle the case where the record doesn't exist
        console.error("Record not found for user_id:", user.id);
        res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
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

// Todo: refactor this route
router.get("/hot-special-number", async (req, res, next) => {
  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const getHotSpecialNumber = await prisma.hot_special_number.findMany({
        where: {
          user_id: parseInt(user.id),
          status: "ACTIVE",
        },
      });
      res.json({ data: getHotSpecialNumber });
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

router.post("/hot-special-number", async (req, res, next) => {
  const { action, data } = req.body;

  const accessToken = req.headers.authorization.split(" ")[1];
  const decodedToken = jwt.decode(accessToken);

  if (decodedToken) {
    const username = decodedToken.username;
    try {
      const user = await prisma.user.findFirst({
        where: {
          username: username,
        },
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (action === "insert") {
        if (data?.bet_position) {
          console.log(data?.bet_position);
        }
        const drawType = data.draw_type; //["M","P"]
        const betType = data.bet_type; //["B","4A"]

        const promises = [];

        for (let i = 0; i < drawType.length; i++) {
          for (let j = 0; j < betType.length; j++) {
            promises.push(
              prisma.hot_special_number.create({
                data: {
                  user_id: parseInt(user.id),
                  number: data.number,
                  draw_type: drawType[i],
                  bet_type: betType[j],
                  amount: parseFloat(data.amount >= 0 ? data.amount : 0),
                },
              })
            );
          }
        }

        await Promise.all(promises);
      } else if (action === "search") {
        const searchHotSpecialNumber = await prisma.hot_special_number.findMany(
          {
            where: {
              number: data.number,
              user_id: parseInt(user.id),
              status: "ACTIVE",
            },
          }
        );
        res.json({ status: "success", data: searchHotSpecialNumber });
      } else if (action === "edit") {
        const updatedHotSpecialNumber = await prisma.hot_special_number.update({
          where: {
            id: parseInt(data.id),
            user_id: parseInt(user.id),
            status: "ACTIVE",
          },
          data: {
            amount: parseFloat(data.amount >= 0 ? data.amount : 0),
          },
        });
      } else {
        const updatedHotSpecialNumber = await prisma.hot_special_number.update({
          where: {
            id: parseInt(data.id),
            id: parseInt(data.id),
            user_id: parseInt(user.id),
            status: "ACTIVE",
          },
          data: {
            status: "INACTIVE",
          },
        });
      }

      res.json({ status: "success" });
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
