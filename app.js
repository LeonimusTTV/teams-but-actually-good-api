require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const { InfisicalSDK } = require("@infisical/sdk")
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const syncRouter = require('./routes/sync');

const app = express();

(async () => {
  const infisicalClient = new InfisicalSDK({
    siteUrl: "https://infisical.leonimust.com",
  })

  await infisicalClient.auth().accessToken(process.env.INFISICAL_TOKEN)

  const secrets = await infisicalClient.secrets().listSecrets({
    environment: process.env.MODE,
    projectId: process.env.INFISICAL_PROJECT_ID,
    secretPath: "/",
  });

  for (const secret of secrets.secrets) {
    process.env[secret.secretKey] = secret.secretValue;
  }

  const dbOptions = {
    autoIndex: false,
    connectTimeoutMS: 10000,
    family: 4,
  };

  mongoose.connect(process.env.MONGO_URI, dbOptions);

  mongoose.Promise = global.Promise;

  mongoose.connection.on("connected", () => { console.log("Mongoose has successfully connected ! ") });

  mongoose.connection.on("err", err => { console.log(`Mongoose connection error: ${err.stack}`) });

  mongoose.connection.on("disconnected", () => { console.warn("Mongoose connection lost ! ") });

  console.log("Secrets loaded successfully");
})();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/v1', indexRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/sync", syncRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message,
      status,
      ...(req.app.get('env') === 'development' && { stack: err.stack }),
    }
  });
});

module.exports = app;
