//Router for AJAX requests

var express = require("express");
var Day = require("../../models/day");
var Hotel = require("../../models/hotel");
var Restaurant = require("../../models/restaurant");
var Activity = require("../../models/activity");

var router = express.Router();

//GET all days
router.get("/days", function(req, res, next) {
	Day.find({}).exec()
		.then(function(allDays){
			res.send(allDays);
		})
		.then(null, next);
})

//GET a specific day
router.get("/days/:dayNum", function(req, res, next) {
	var dayNum = req.params.dayNum;
	Day.find({number: dayNum}).populate("Hotel").exec()
		.then(function(specificDay){
			res.send(specificDay);
		})
		.then(null, next);
})

//DELETE a specific day
router.delete("/days/:dayNum", function(req, res, next) {
	var dayNum = req.params.dayNum;
	Day.find({ number: dayNum}).remove().exec()
		.then(function(specificDay){
			res.send(specificDay);
		})
		.then(null, next);
})

//CREATE a new day
router.post("/days/new_day", function(req, res, next) {
	Day.create({
		number: req.body.number,
		hotel: req.body.hotel,
		restaurants: req.body.restaurants,
		activities: req.body.activities
	})
		.then(function(createdDay) {
			res.send(createdDay);
		})
		.then(null, next);
})

//Create a new attraction on a given day
router.post("/days/:dayNum/:attractionType", function(req, res, next) {
	var dayNum = +req.params.dayNum;
	var attractionName = req.body.name;
	var attractionType; 
	if(req.params.attractionType === "hotels") attractionType = Hotel;
	if(req.params.attractionType === "restaurants") attractionType = Restaurant;
	if(req.params.attractionType === "activities") attractionType = Activity;
	Day.findOne({ number: dayNum }).exec()
		.then(function(foundDay) {
			console.log(foundDay);
			attractionType.findOne({ name: attractionName }).exec()
			.then(function(foundAttraction) {
				console.log(foundAttraction);
				if(req.params.attractionType === "hotels") {
					foundDay.hotel = foundAttraction._id;
					foundDay.save()
					.then(function(savedDay) {
						res.send(savedDay)
					})
					.then(null, next)
				}
				if(req.params.attractionType === "restaurants") {
					foundDay.restaurants.push(foundAttraction._id);
					foundDay.save()
					.then(function(savedDay) {
						res.send(savedDay)
					})
					.then(null, next)

				}
				if(req.params.attractionType === "activities") {
					foundDay.activities.push(foundAttraction._id);
					foundDay.save()
					.then(function(savedDay) {
						res.send(savedDay)
					})
					.then(null, next)					
				}
			})
		})
})


module.exports = router;






