const router = require("express").Router();
const User = require("../models/User");
// const Order = require("../models/Order");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const _ = require('lodash');
const nodemailer = require('nodemailer');
const { result } = require("lodash");
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
} = require("./verifyToken");
const Joi = require('joi');

router.put("/", verifyTokenAndAdmin, async (req, res) => {
    const schema =Joi.object({
        balance: Joi.number().integer().required(),
        userId: Joi.string().required(),
        status: Joi.string().required(),
        orderId: Joi.string().required(),
    })
    const validation = schema.validate(req.body)
    if (validation.error) {
        return res.status(404).send(validation.error)
    }
    console.log(validation)
    const { userId, balance, status, orderId } = req.body;
    if (userId && status && orderId && balance) {
        Order.findById(orderId, (async (err, order) => {
            if (err || !order) {
                return res.status(400).json({ error: "order not find" })
            } 
            if (order.status === status) {
                console.log(`this order alrdy ${status}`)
            }
             else {
                User.findById(JSON.parse(userId), (async (err, user) => {
                    if (err || !user) {
                        return res.status(400).json({ error: "user not find" })
                    }
                    console.log(user.balance)
                    console.log(balance )
                    console.log( user.balance + balance)
                    const newUser = { balance: user.balance + balance }
                    const newOrder = { status: status }
                    console.log(newUser)
                    if (user) {
                        try {
                            const updatedUser = await User.findByIdAndUpdate(
                                JSON.parse(userId),
                                {
                                    $set: newUser,
                                },
                                { new: true }
                            );
                            console.log("222",updatedUser)
                            const updatedOrder = await Order.findByIdAndUpdate(
                                orderId,
                                {
                                    $set: newOrder,
                                },
                                { new: true }
                            );
                            res.status(200).json(updatedOrder, updatedUser);
                        } catch (err) {
                            res.status(500).json(err);
                        }
                    } else {
                        res.status(200).json({ massage: "user not found" });
                    }
                }))
            }
        }))
    } else {
        return res.status(400).json({ userId, balance, status, orderId })
    }
});
//get all users balance
router.get("/getbalance", verifyTokenAndAdmin, async (req, res) => {
    try {
        let orders = await User.find();
        let sum = 0;
        for (const value of orders) {
            sum += value.balance;
        }
        let sun = 0;
        for (const value of orders) {
            sun += value.profit;
        }
        res.status(200).json({ sum, sun, orders });
    } catch (err) {
        res.status(500).json(err);
    }
})
//get user balance by id
router.get("/find/:userId", async (req, res) => {
    console.log("1")
    const orders = await User.findOne({ _id: req.params.userId });
    if(orders.active === "false") {
        return  res.status(400).json({massage:"you are not active"});
    }else {
       try {
        const orders = await User.findOne({ _id: req.params.userId });
        const balance = orders.balance
        const usdtId = orders.usdtId
        const percentage = orders.percentage
        const profit = orders.profit
        res.status(200).json({ balance, usdtId, percentage,  profit});
    } catch (err) {
        res.status(500).json(err);
    } 
    }
    
})



router.post("/crdet",verifyTokenAndAdmin, async (req, res) => {
    const { userId, balance } = req.body;
    console.log(userId)
    let user = await User.findOne({_id: userId })
    console.log(user)
    if (!user) {
        res.status(500).json("user is not find");
    } else {
        const debt = Number(user.balance) + Number(balance)
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                balance: debt
            },
            { new: true }
        );
        res.status(200).json(updatedUser.balance);
    }
})
router.post("/percentage",verifyTokenAndAdmin, async (req, res) => {
    const { userId, balance } = req.body;
    console.log(userId)
    let user = await User.findOne({_id: userId })
    console.log(user)
    if (!user) {
        res.status(500).json("user is not find");
    } else {
        const debt = Number(user.percentage) + Number(balance)
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                percentage: debt
            },
            { new: true }
        );
        res.status(200).json(updatedUser.percentage);
    }
})

router.post("/debt",verifyTokenAndAdmin, async (req, res) => {
    const {  userId, balance } = req.body;
    let user = await User.findOne({ _id: userId })
    if (!user) {
        res.status(500).json("user is not find");
    }
    if (user.balance <= 0 || user.balance < balance) {
        res.status(500).json("user balance is not enough");
    } else {
        const debt = user.balance - balance
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                balance: debt
            },
            { new: true }
        );
        res.status(200).json(updatedUser.balance);
    }
})

router.post("/acceptwithdraw",verifyTokenAndAdmin, async (req, res) => {
    const {  userId, balance } = req.body;
    let user = await User.findOne({ _id: userId })
    if (!user) {
        res.status(500).json("user is not find");
    }
    if (user.balance <= 0 && user.profit <= 0) {
        res.status(500).json("user balance is not enough");
    } else {
        if (user.profit >= balance) {
            user.profit -= balance;
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    profit: user.profit
                },
                { new: true }
            );
            res.status(200).json(updatedUser.profit);
        } else {
            user.balance -= (balance - user.profit);
            user.profit = 0;
            const updatedUser = await User.findByIdAndUpdate(
                user._id,
                {
                    balance: user.balance,
                    profit: user.profit
                },
                { new: true }
            );
            res.status(200).json(updatedUser);
        }
    }
})

router.post("/profitcrdet",verifyTokenAndAdmin, async (req, res) => {
    const { userId, balance } = req.body;
    console.log(userId)
    let user = await User.findOne({_id: userId })
    console.log(user)
    if (!user) {
        res.status(500).json("user is not find");
    } else {
        const debt = Number(user.profit) + Number(balance)
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                profit: debt
            },
            { new: true }
        );
        res.status(200).json(updatedUser.profit);
    }
})

router.post("/profitdebt",verifyTokenAndAdmin, async (req, res) => {
    const {  userId, balance } = req.body;
    let user = await User.findOne({ _id: userId })
    if (!user) {
        res.status(500).json("user is not find");
    }
    if (user.profit <= 0 || user.profit < balance) {
        res.status(500).json("user balance is not enough");
    } else {
        const debt = user.profit - balance
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            {
                profit: debt
            },
            { new: true }
        );
        res.status(200).json(updatedUser.profit);
    }
})
module.exports = router;
