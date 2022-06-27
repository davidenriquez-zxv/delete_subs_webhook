import 'dotenv/config';
import express from "express";
import webhookRouter from './routes/webhook.routes.js'


const app = express();

app.use('/webhook', webhookRouter)

app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT}`);
});
