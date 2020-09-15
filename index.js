const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const OTPModel = require("./otp.schema");
const unirest = require("unirest");
require("dotenv").config();

mongoose
	.connect(process.env.MongoURI, {
		useUnifiedTopology: true,
		useNewUrlParser: true,
	})
	.then(() => {
		console.log("connected with mongo");
	})
	.catch(() => {
		console.log("cannot connect with mongo");
	});

// middleware

app.use(express.urlencoded({ extended: true }));

// routes

app.get("/", function (req, res) {
	res.sendFile(path.join(__dirname, "/public/index.html"));
});
app.get("/check", function (req, res) {
	res.sendFile(path.join(__dirname, "/public/check.html"));
});

app.post("/auth", function (req, res) {
	var requestToF2S = unirest("POST", "https://www.fast2sms.com/dev/bulk");

	requestToF2S.headers({
		"content-type": "application/x-www-form-urlencoded",
		"cache-control": "no-cache",
		authorization:
			"DaoxtE28S9kseu0bUfBZmKhQOpXJiwN4d1zYc7jqGLRWI5AFTMQHuIszxB76SYcA0oUj39ahKW2MVT4r",
	});

	// random otp

	const otp = Math.floor(Math.random() * 10000);

	console.log(otp);

	requestToF2S.form({
		sender_id: "FSTSMS",
		language: "english",
		route: "qt",
		numbers: req.body.phone,
		message: process.env.F2SID,
		variables: "{#BB#}",
		variables_values: otp,
	});

	requestToF2S.end(function (responseFromF2S) {
		if (responseFromF2S.error) throw new Error(responseFromF2S.error);

		if (responseFromF2S.body.request_id) {
			OTPModel.create({
				email: req.body.email,
				otp: otp,
			}).then(function () {
				res.send("Check Message");
			});
		}
	});
});

app.post("/check", function (req, res) {
	const { email, otp } = req.body;

	OTPModel.find({
		email,
		otp,
	})
		.then(function (responseFromServer) {
			if (responseFromServer) {
				res.json(responseFromServer);
			}
		})
		.catch(function (err) {
			res.json({
				error: "Error Occured",
			});
		});
});

app.listen(1022, () => {
	console.log("App Running");
});
