const express = require('express');

require('dotenv').config();
const mongooseConfig = require('./config/mongoose');

const userRoute = require("./routes/user.route");
const depositRoute = require("./routes/deposit.route");
const withdrawRoute = require("./routes/withdraw.route");
const floorsRoute = require("./routes/floors.router");
const adminRoute = require("./routes/Admin.route");

const bodyParser = require('body-parser');
const app = express();
const port = process.env.APP_PORT;
const cors = require("cors");
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:4300",
    "https://admin.ssvwallet.com"
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.header("Access-Control-Allow-Origin", [
  //   "http://localhost:55423",
  // ]);
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", true);
  return next();
});
app.use(express.static(`${__dirname}/uploads`));
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.get('/',(req,res)=> res.send('WELCOME TO API HOME'));

app.use("/api/v1/user",userRoute);
app.use("/api/v1/deposit",depositRoute);
app.use("/api/v1/withdraw",withdrawRoute);
app.use("/api/v1/floors",floorsRoute);
app.use("/api/v1/admin",adminRoute);

app.use((req,res, next)=> {
  const error = new Error('Not Found');
  error.message = 'Invalid route';
  error.status = 404;
  next(error);
});
app.use((error,req,res,next)=> {
  res.status(error.status || 500);
  return res.json({
    error:{
      message:error.message,
    },
  });
});
async function dbConnect() {
  try {
    await mongooseConfig.connectToServer();
    console.log("connected to mongo db");
  } catch (error) {
    console.log("error in mongo connection");
  }
}
dbConnect();
app.listen(port,()=> {
  console.log(`App listening on port ${port}`);
});