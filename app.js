const express = require('express');
const app = express();
var cors = require('cors')
app.use(cors())
const cron = require("node-cron");

// Require route files
const indexRouter = require('./routes/index');
const adminsRouter = require('./routes/admins');
const backOfficeUsersRouter = require('./routes/back-office/users');
const backOfficeLotteryRouter = require('./routes/back-office/lottery');
const backOfficeMessageRouter = require('./routes/back-office/message');
const backOfficeWebSettingRouter = require('./routes/back-office/web_setting');
const backOfficeReportRouter = require('./routes/back-office/reports');


const usersRouter = require('./routes/users');
const betRouter = require('./routes/bet');
const lotteryRouter = require('./routes/lottery');
const webServiceRouter = require('./routes/web_service');
const reportsRouter = require('./routes/reports');

const openLottery = require('./utils/openLottery')

app.use(express.json());

// Mount routes
app.use('/', indexRouter);
app.use('/admins', adminsRouter);

app.use('/back-office/users', backOfficeUsersRouter);
app.use('/back-office/lottery', backOfficeLotteryRouter);
app.use('/back-office/message', backOfficeMessageRouter);
app.use('/back-office/web-setting', backOfficeWebSettingRouter);
app.use('/back-office/reports', backOfficeReportRouter);


app.use('/users', usersRouter);
app.use('/users/bet', betRouter);
app.use('/lottery', lotteryRouter);
app.use('/web-service', webServiceRouter);
app.use('/reports', reportsRouter);



// Start the server
const PORT = process.env.PORT || 3000;

cron.schedule("* * * * *", async () => {
  console.log("Running a task every minute");
  console.log("Time", new Date())

  //await openLottery();
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
