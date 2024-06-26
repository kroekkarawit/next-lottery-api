const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

/* GET users listing. */
router.get('/', async (req, res, next) => {
    const users = {
        username: 'John Doe',
        full_name: 'johndoe',
        password: 'password123',
        key: process.env.SECRET_KEY
    };
    res.json(users);
});

router.get('/get/:username', async (req, res) => {
    const username = req.params.username;

    try {
        const user = await prisma.admin.findFirst({
            where: {
                username: username,
            },
        });

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});




router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const user = await prisma.admin.findFirst({
            where: {
                username: username,
            },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        const accessToken = jwt.sign({ username: user.username }, process.env.SECRET_KEY, { expiresIn: '7d' });

        res.json({
            id: user.id,
            name: user.name,
            username: user.username,
            image: "avatar",
            role: user.role,
            access_token: accessToken,
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.get('/gen-user', async (req, res, next) => {
    try {
        const createdUser = await prisma.admin.create({
            data: {
                name: 'John Doe',
                username: 'johndoe123',
                password: 'password123',
                status: 'ACTIVE',
                role: "MASTER"
            },
        });
        console.log('Created user:', createdUser);
        res.json(createdUser);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

router.post("/change-password", async (req, res, next) => {
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
  
      const { old_password: oldPassword , new_password: newPassword } = req.body;
  
      if (!oldPassword || !newPassword ) {
        return res.status(400).json({ message: "old_password or new_password required fields" });
      }
  
      const passwordMatch = await bcrypt.compare(oldPassword, admin.password);
      if (!passwordMatch) {
          return res.status(401).json({ message: 'Invalid password' });
      }

      const newPasswordEncrypted = await bcrypt.hash(newPassword, 10);

      const updatedPassword = await prisma.admin.update({
        where: {
          id: parseInt(admin.id),
        },
        data: {
          password: newPasswordEncrypted,
        },
      });
  
      res.json({
        status: "success",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
    }
  });

module.exports = router;
