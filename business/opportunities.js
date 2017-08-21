const pool = require('../config/database');

var Opportunity = require('../app/models/opportunity');

module.exports.saveOpportunity = function (req, done) {
	
	var oppotunityValues = [];
	oppotunityValues.push(req.body.compName);
	oppotunityValues.push(req.body.jobTitle);
	oppotunityValues.push(req.body.jobCityCountry);
	oppotunityValues.push(req.body.jobDescription);
	oppotunityValues.push(req.body.jobSkills);
	oppotunityValues.push(req.body.jobCompensation);
	oppotunityValues.push(req.body.compDescription);
	oppotunityValues.push(req.body.logistics);
	oppotunityValues.push(req.body.costOfLiving);
	oppotunityValues.push(req.body.keywords);
	
	let companyLogo = req.files.companyLogo;
	if(companyLogo) {
		companyLogo.mv('./public/images/' + req.body.companyLogoText, function(err) {
			if (err) {
			  console.log('Error to upload company logo.');
			}
		});
	}
	
	let oppImage = req.files.oppImage;
	if(oppImage) {
		oppImage.mv('./public/images/' + req.body.oppImageText, function(err) {
			if (err) {
			  console.log('Error to upload opportunity image.');
			}
		});
	}
	
	oppotunityValues.push(req.body.companyLogoText);
	oppotunityValues.push(req.body.oppImageText);
	
	if(req.body.oppCode) {
		oppotunityValues.push(req.body.oppCode);
		pool.updateOpportunity(oppotunityValues, function (err) {
	        // if there are any errors, return the error before anything else
	        if (err)
	        {
	            return done(err);
	        }
	        return done(null);
	    });
	}
	else {
		pool.insertOpportunity(oppotunityValues, function (err) {
	        // if there are any errors, return the error before anything else
	        if (err)
	        {
	            return done(err);
	        }
	        return done(null);
	    });
	}
};

module.exports.listOpportunities = function (searchString, done) {
	pool.listOpportunities([searchString], function(res){
		var opps = [];
		if(res) {
			res.forEach(function(element){
				opps.push(new Opportunity(element.code, element.company, element.job_title, element.job_location, 
						element.job_description, element.job_skills, element.company_description, element.compensation, 
						element.logistics, element.cost_of_living, element.keywords, element.company_logo, element.opportunity_picture));
			});
		}
	    return done(opps);
	});
};

module.exports.getOpportunity = function (oppCode, done) {
	if(oppCode){
		pool.getOpportunityByCode([oppCode], function(res){
			var opp = null;
			if(res) {
				opp = new Opportunity(res.code, res.company, res.job_title, res.job_location, res.job_description, 
										res.job_skills,	res.company_description, res.compensation, res.logistics, 
										res.cost_of_living, res.keywords, res.company_logo, res.opportunity_picture);
			}
		    return done(opp);
		});
	}
	else {
		var opp = {};
		return done(opp);
	}
};
