// server.js

// set up ======================================================================
// get all the tools we need
var express  = require('express');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var zip = require('express-zip');
var i18n = require("i18n");
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var path  = require('path');
var expressLayouts = require('express-ejs-layouts');
var pg = require('pg');
var passport = require('passport');
var flash    = require('connect-flash');
var configDB = require('./config/database.js');

console.log(process.env.DATABASE_URL);
var port     = process.env.PORT || 5000;
var app      = express();

// configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

i18n.configure({
    locales:['en', 'es', 'pt'],
    directory: __dirname + '/locales',
    cookie: 'i18n',
    queryParameter: 'lang',
    defaultLocale: 'en'
});

// set up our express application
app.use(logger('dev'));
app.use(cookieParser()); // read cookies (needed for auth)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator({
	  	customValidators: {
		    isPDF: function(value, filename) {
		      var extension = (path.extname(filename)).toLowerCase();
		      return extension == '.pdf';
		    }
	  	}
	}
)); 

app.use(fileUpload());

app.set('view engine', 'ejs'); // set up ejs for templating
app.set("layout extractScripts", true);

// required for layout
app.use(expressLayouts);

// required for passport
app.use(session({ secret: 'WelTalent.com' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(i18n.init);

app.use(express.static(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'bower_components')));

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);



//var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
//var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
//
//app.listen(server_port, server_ip_address, function() {
//	console.log("Listening on " + server_ip_address + ", port " + server_port)
//});
