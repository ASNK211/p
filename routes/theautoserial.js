const router = require("express").Router();
const User = require("../models/User");
const Order = require("../models/Order");

// const nodemailer = require('nodemailer');
const Product = require("../models/Product");
var cron = require('node-cron');
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const { findById } = require("../models/User");



// cron.schedule('*1/2 * * * *', () => {
//     console.log('running a task every two minutes');
//   });

cron.schedule('*/59 * * * *', async (req, res) => {
  const user = await User.find();
  user.forEach(async element => {
    const prs = element.percentage * 0.01 ;
    const ser = element.balance
    console.log(prs)
    const newBalance = element.balance +=
      element.balance * prs
    const nes = newBalance - ser
    console.log(nes,"nes")
    console.log(ser)
    const newProfit = Number(element.profit) +  Number(nes);
    console.log(newBalance)
    console.log(element.profit, "profit")
    const dsve = element._id.toString()
    console.log(dsve)
    try {
      const savedOrder = await User.updateOne({ _id: dsve}, { $set: { profit: newProfit } });
      console.log(savedOrder)   
    }catch (err) {
      console.log(err)
    }
    
  });
  
console.log(savedOrder)
  // const savedOrder = await User.updateOne(
  //   { _id: user._id },
  //   { $set: { percentage: newpercentage } }, (err, res) => {
  //     if (err)
  //       return console.log(err);
  //     console.log(`updated ${user_id}s balance to ${newpercentage}`)

  //   }
  // )
  // console.log(savedOrder)
})
//     user.forEach(element => {
//      const newpercentage = element.percentage+=
//       element.percentage * 0.52
//       console.log(newpercentage)
//     });
//     console.log(newpercentage)
// })

// router.get("/find/:id", verifyToken, async (req, res) => {
//     try {
//         const autoserial = await theautoserial.find({ orderId: req.params.id });
//         res.status(200).json(autoserial);
//     } catch (err) {
//         res.status(500).json(err);
//     }
// });

// router.get("/", verifyTokenAndAdmin, async (req, res) => {
//     try {
//       const reorders = await ReOrder.find();
//       res.status(200).json(reorders.reverse());
//     } catch (err) {
//       res.status(500).json(err);
//     }
//   });

module.exports = router;
