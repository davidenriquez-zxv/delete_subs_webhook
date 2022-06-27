import express from "express";
import { deleteSubscriptionWebhook } from '../controllers/webhook.controllers.js'

const router = express.Router();

router.post('/', deleteSubscriptionWebhook);

export default router;