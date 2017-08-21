const
pool = require('../config/database');
var Applicant = require('../app/models/applicant');
var date_fns = require('date-fns');

module.exports.saveApplicant = function(req, done) {

	var applicantValues = [];

	applicantValues.push(req.body.applicantsName);
	applicantValues.push(req.body.email);
	applicantValues.push(req.body.nationality);
	
	if(req.body.oppCode) {
		console.log('oppCode: ' + req.body.oppCode);
		applicantValues.push(req.body.oppCode);
	}
	applicantValues.push(req.body.appCurriculumText);

	pool.insertApplicant(applicantValues, req.body.oppCode, function(res) {
		let	appCurriculum = req.files.appCurriculum;
		if (appCurriculum) {
			appCurriculum.mv('./public/files/curriculums/' + res.code + "_"
					+ res.curriculum_name, function(err) {
				if (err) {
					console.log('Error to upload applicant curriculum.');
				}
			});
		}

		return done(null);
	});
};

module.exports.getApplicants = function(oppCode, done) {
	pool.getAllApplicantsByOpp([ oppCode ], function(res) {
		var applicants = [];
		if (res) {
			res.forEach(function(element) {
				applicants.push(new Applicant(element.code, element.name,
						element.email, element.country,
						element.opportunity_code, element.curriculum_name,
						date_fns.format(element.creation_time, 'DD-MM-YYYY')));
			});
		}
		return done(applicants);
	});
};

module.exports.getCurriculum = function(applicantsCode, oppCode, done) {
	if (applicantsCode) {
		pool.getApplicantCV([ applicantsCode ], function(res) {
			var curriculums = [];
			if (res) {
				res.forEach(function(element) {
					curriculums.push({
						path : './public/files/curriculums/' + element.code
								+ "_" + element.curriculum_name,
						name : element.code + "_" + element.curriculum_name
					});
				});
			}
			return done(curriculums);
		});
	} else {
		pool.getAllApplicantsByOpp([ oppCode ], function(res) {
			var curriculums = [];
			if (res) {
				res.forEach(function(element) {
					curriculums.push({
						path : './public/files/curriculums/' + element.code
								+ "_" + element.curriculum_name,
						name : element.code + "_" + element.curriculum_name
					});
				});
			}
			return done(curriculums);
		});
	}
};