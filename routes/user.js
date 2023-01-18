const User = require("../models/User");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

//UPDATE
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const user = await User.findById(id);
  user.active = true
  const { usdtId } = req.body

  try {
    const updatedUser = await User.findByIdAndUpdate(id, { active: user.active, usdtId: usdtId });


    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user by unuserId
router.get("/finds/:id", async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.params.id });
    console.log(user)
    const { password, ...others } = user._doc;
    console.log(user)
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER
router.get("/", async (req, res) => {
  const query = req.query.new;
  try {
    const orders = await User.find({ active: true });
    res.status(200).json(orders.reverse());
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/notactive",verifyTokenAndAdmin, async (req, res) => {
  try {
    const orders = await User.find({ active: false });
    res.status(200).json(orders.reverse());
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS
// router.get('/users/:pageNum', (req, res) => {
//   var itemsPerPage = 10;
//   var db = req.User;
//   var users = db.get("username"); 
//   users.find(query, {skip: (itemsPerPage * (pageNum-1)), limit: itemsPerPage},function(e, docs){
//     res.render('username', { 
//       username: 'Users',

//     });
//   });
// });
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
