// app/routes.js

var opportunities = require('../business/opportunities');
var applicants = require('../business/applicants');
var contact = require('../business/contactUs');
var util = require('./util');
var i18n = require("i18n");

var cool = require('cool-ascii-faces');

module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.redirect('/home'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', {
			message : req.flash('loginMessage')
		});
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/listOpportunities', // redirect to the secure
		// profile section
		failureRedirect : '/login', // redirect back to the signup page if there
		// is an error
		failureFlash : true
	// allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', {
			message : req.flash('signupMessage')
		});
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile
		// section
		failureRedirect : '/signup', // redirect back to the signup page if
		// there is an error
		failureFlash : true
	// allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user
		// get the user out of session and pass to template
		});
	});

	// =====================================
	// Contact Us ===============================
	// =====================================
	// show the login form
	app.get('/contactUs', function(req, res) {
		var contactTypes = [];
		contactTypes.push({
			"value" : "employer",
			"text" : i18n.__("employers")
		});
		contactTypes.push({
			"value" : "jobSeeker",
			"text" : i18n.__("job_seekers")
		});

		res.render('contactUs.ejs', {
			message : req.flash('contactUsMessage'),
			contactSelType : contactTypes
		});
	});

	app.post('/contactUs', function(req, res) {
		var mailOptions = {
			from : 'mcfantinel@gmail.com',
			to : 'mcfantinel@gmail.com',
			subject : 'WelTalent Email - ' + req.body.contactType
					+ ' - Title: ' + req.body.messageTitle
					+ ' - From: ' + req.body.email,
			text : 'Texto: ' + req.body.message
		};
		contact.sendEmail(mailOptions, function(err) {
			if (err) {
				return res.redirect('/contactUs');
			}
			return res.redirect('/contactUs');
		})
	});

	// =====================================
	// Meet the Team ===============================
	// =====================================
	// show the login form
	app.get('/meetTeam', function(req, res) {
		res.render('meetTeam.ejs');
	});

	// =====================================
	// Mission ===============================
	// =====================================
	// show the login form
	app.get('/missionValues', function(req, res) {
		res.render('missionValues.ejs');
	});
	
	// =====================================
	// Mission ===============================
	// =====================================
	// show the login form
	app.get('/aboutUs', function(req, res) {
		res.render('aboutUs.ejs');
	});

	// =====================================
	// Register Opportunity SECTION =========================
	// =====================================
	app.get('/registerOpportunity', isLoggedIn, function(req, res) {
		opportunities.getOpportunity(req.query.oppCode, function(opp) {
			res.render('registerOpportunity.ejs', {
				user : req.user,
				opportunity : opp,
				message : req.flash('regOppMessage')
			});
		});
	});

	app.post('/registerOpportunity', isLoggedIn, function(req, res) {
		opportunities.saveOpportunity(req, function(err) {
			if (err) {
				return res.redirect('/registerOpportunity');
			}
			return res.redirect('/listOpportunities');
		});
	});

	// =====================================
	// VIEW OPPORTUNITY SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/home', function(req, res) {
		// return res.render('listOpportunities.ejs');
		//res.setLocale(req.cookies.i18n);
		opportunities.listOpportunities(req.query.searchString, function(opps) {
			return res.render('home.ejs', {
				opportunities : opps,
				layout : false//,
				//i18n: res
			});
		});
	});

	// =====================================
	// VIEW OPPORTUNITY SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/listOpportunities', function(req, res) {
		// return res.render('listOpportunities.ejs');
		opportunities.listOpportunities(req.query.searchString, function(opps) {
			return res.render('listOpportunities.ejs', {
				opportunities : opps
			});
		});
	});

	// =====================================
	// VIEW OPPORTUNITY SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/viewOpportunity', function(req, res) {
		v_IsLoggedIn = false;
		if (req.isAuthenticated())
			v_IsLoggedIn = true;
		opportunities.getOpportunity(req.query.oppCode, function(opp) {
			return res.render('viewOpportunity.ejs', {
				opportunity : opp,
				isLoggedIn : v_IsLoggedIn
			});
		});
	});

	// =====================================
	// VIEW APPLICANTS SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/viewApplicants', isLoggedIn, function(req, res) {
		var opp = {
			oppCode : req.query.oppCode,
			jobTitle : req.query.jobTitle,
			companyName : req.query.company,
			jobLocation : req.query.jobLocation
		};
		applicants.getApplicants(req.query.oppCode, function(applicants) {
			return res.render('viewApplicants.ejs', {
				user : req.user,
				opportunity : opp,
				applicants : applicants
			});
		});
	});

	app.get('/downloadPDF', isLoggedIn, function(req, res) {
		applicants.getCurriculum(req.query.applicantCode, req.query.oppCode,
				function(curriculums) {
					res.zip(curriculums);
				});
	});

	// =====================================
	// VIEW OPPORTUNITY SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/applyToOpp', function(req, res) {
		var opp = {
			oppCode : req.query.oppCode,
			jobTitle : req.query.jobTitle,
			company : req.query.company
		};
		return res.render('applyToOpp.ejs', {
			opportunity : opp,
			message : req.flash('appOppMessage'),
			layout : false,
			failureFlash : true
		});
	});

	app.post('/applyToOpp', function(req, res) {
		req.checkBody('applicantsName', 'Name is a mandatory field.')
				.notEmpty();
		req.checkBody('email', 'Invalid email.').notEmpty().isEmail();
		req.checkBody('nationality', 'Nationality is a mandatory field.')
				.notEmpty();
		req.checkBody('appCurriculumText', 'Curriculum is a mandatory field.')
				.notEmpty();
		if (req.files.appCurriculum) {
			req
					.checkBody('appCurriculumText',
							'Please upload your file in PDF').isPDF(
							req.files.appCurriculum.name);
		}
		req.getValidationResult().then(
				function(result) {
					if (!result.isEmpty()) {
						req.flash('appOppMessage', util
								.getValidationMessage(result
										.useFirstErrorOnly().array()));
						return res.redirect('/applyToOpp?oppCode='
								+ req.body.oppCode + '&jobTitle='
								+ req.body.jobTitle + '&company='
								+ req.body.company);
					}
					applicants.saveApplicant(req, function(err) {
						if (err) {
							return res.redirect('/appliedSuccessfully');
						}
						return res.redirect('/appliedSuccessfully');
					});
				});
	});
	
	// =====================================
	// Applied successfully ================
	// =====================================
	app.get('/appliedSuccessfully', function(req, res) {
		res.render('appliedSuccessfully.ejs', {
			layout : false
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	
	app.get('/cool', function(request, response) {
		  response.send(cool());
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
