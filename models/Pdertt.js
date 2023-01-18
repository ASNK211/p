const mongoose = require("mongoose");

const PderttSchema = new mongoose.Schema(
  {
    balance: { type: Number, },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Pdertt", PderttSchema);
