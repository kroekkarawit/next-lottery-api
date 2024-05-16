const express = require('express');
const app = express();
var cors = require('cors')
app.use(cors())

// Require route files
const indexRouter = require('./routes/index');
const adminsRouter = require('./routes/admins');
const usersRouter = require('./routes/users');
const betRouter = require('./routes/bet');

app.use(express.json());

// Mount routes
app.use('/', indexRouter);
app.use('/admins', adminsRouter);
app.use('/users', usersRouter);
app.use('/users/bet', betRouter);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
