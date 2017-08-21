var nodeMailer = require('../config/email');

module.exports.sendEmail = function (emailConfig, done) {
	nodeMailer.sendEmail(emailConfig, function(res){
		if(res.err) {
			console.log(res.err);
		}
	    return done(res);
	});
};