import deleteSubscriptions from "../services/subscription.operations.js";  

const deleteSubscriptionWebhook = (req, res) => {
    deleteSubscriptions();
    res.status(201).json({
        success: true
    })
}

export {
    deleteSubscriptionWebhook
};
