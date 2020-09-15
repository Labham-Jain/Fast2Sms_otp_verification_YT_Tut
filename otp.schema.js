const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema({
	email: {
		type: String,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		expires: 120,
		default: Date.now,
	},
});

module.exports = mongoose.model("otp", OTPSchema);
