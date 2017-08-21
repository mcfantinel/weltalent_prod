var nodemailer = require('nodemailer');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var transporter = nodemailer.createTransport({
	  service: 'gmail',
	  secure: false,
	  auth: {
	    user: 'contacto@weltalent.com',
	    pass: 'weltalent91'
	  }
});

module.exports.sendEmail = function (mailOptions, callback) {		
	transporter.sendMail(mailOptions, function(error, info){
	  if (error) {
	    return console.log(error);
	  } else {
	    return callback('Email sent: ' + info.response);
	  }
	});
};