require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const app = express();

const main = require('./config/db');
const cookieParser = require('cookie-parser');
const authRouter = require("./routes/userAuth");
const problemRouter = require("./routes/problemCreator");
const redisclient = require('./config/redis');

const SubmitRouter=require("./routes/submit");

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission',SubmitRouter)


const InitilizeConnection = async () => {
    try {

        await Promise.all([
            redisclient.connect(),
            main()
        ]);

        console.log("DB is Connected");

        app.listen(process.env.PORT, () => {
            console.log(
              "Server Listening at port number: " + process.env.PORT
            );
        });

    } catch(err) {
        console.log("Error:", err);
    }
};


InitilizeConnection();