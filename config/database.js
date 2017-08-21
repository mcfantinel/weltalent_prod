const pg = require('pg');

// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present

//connect local
var config = {
  user: 'postgres', //env var: PGUSER
  database: 'WelTalent', //env var: PGDATABASE
  password: '1234', //env var: PGPASSWORD
  host: 'localhost', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  max: 10, // max number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

//connect remote
/*
var config = {
  user: 'qrvxvcytwbrofb', //env var: PGUSER
  database: 'd6p7n2c90gjons', //env var: PGDATABASE
  password: '110fd5ab41eae9d08258ddd5605ac52651e9c32f386d8bfeb11ef0b09ddcef96', //env var: PGPASSWORD
  host: 'ec2-54-163-254-143.compute-1.amazonaws.com', // Server hosting the postgres database
  port: 5432, //env var: PGPORT
  //max: 10, // max number of clients in the pool
  //idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
*/
//this initializes a connection pool
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients
const pool = new pg.Pool(config);

pool.on('error', function (err, client) {
  // if an error is encountered by a client while it sits idle in the pool
  // the pool itself will emit an error event with both the error and
  // the client which emitted the original error
  // this is a rare occurrence but can happen if there is a network partition
  // between your application and the database, the database restarts, etc.
  // and so you might want to handle it and at least log it out
  console.error('idle client error', err.message, err.stack);
});

//export the query method for passing queries to the pool
module.exports.query = function (text, values, callback) {
  console.log('query:', text, values);
  return pool.query(text, values, callback);
};

module.exports.insertOpportunity = function (values, callback) {	
  console.log('query:', values);
  var text = "INSERT INTO OPPORTUNITY (company, job_title, job_location, job_description, job_skills, company_description, " +
	"compensation, logistics, cost_of_living, keywords, company_logo, opportunity_picture, creation_time)" +
	"VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,current_timestamp)";
	pool.query(text, values, function(err, res) {
	  if(err) {
	      return console.error('error running query', err);
	  }
	  return callback(null);
	});	
};

module.exports.updateOpportunity = function (values, callback) {	
	  console.log('query:', values);
	  var text = "UPDATE OPPORTUNITY SET company = $1, job_title = $2, job_location = $3, job_description = $4, " +
	  			"job_skills = $5, company_description = $6, compensation = $7, logistics = $8, cost_of_living = $9, " +
	  			"keywords = $10, company_logo = $11, opportunity_picture = $12 where code = $13";
		pool.query(text, values, function(err, res) {
		  if(err) {
		      return console.error('error running query', err);
		  }
		  return callback(null);
		});	
	};

module.exports.insertApplicant = function (values, hasOpportunity, callback) {	
		console.log('query:', values);
		var text = null;
		if(hasOpportunity){
			  text = "INSERT INTO APPLICANT (name, email, country, opportunity_code, curriculum_name, creation_time)" +
			  	"VALUES ($1,$2,$3,$4,$5,current_timestamp) RETURNING *";
		}else {
			  text = "INSERT INTO APPLICANT (name, email, country, curriculum_name, creation_time)" +
			  	"VALUES ($1,$2,$3,$4,current_timestamp) RETURNING *";
		}
		console.log('texto:', text);
		pool.query(text, values, function(err, res) {
		  if(err) {
		      return console.error('error running query', err);
		  }
		  return callback(res.rows[0]);
		});
};

module.exports.getOpportunityByCode = function (code, callback) {	
	  console.log('query:', code);
	  var text = "SELECT * FROM OPPORTUNITY WHERE CODE = $1";
	  pool.query(text, code, function(err, res) {
		  if(err) {
		      return console.error('error running query', err);
		  }
		  return callback(res.rows[0]);
	  });
};

module.exports.listOpportunities = function (searchString, callback) {	
	  console.log('query:', searchString);
	  if(searchString){
		  searchString = '%' + searchString + '%';
	  }
	  else {
		  searchString = '%%';
	  }
		  
	  var text = "SELECT code,company,job_title,job_location,company_logo,opportunity_picture FROM OPPORTUNITY WHERE upper(JOB_TITLE) LIKE upper($1) OR upper(COMPANY) LIKE upper($2) OR upper(JOB_LOCATION) LIKE upper($3) OR upper(KEYWORDS) LIKE upper($4)";
	  pool.query(text, [searchString,searchString,searchString,searchString], function(err, res) {
		  if(err) {
		      return console.error('error running query', err);
		  }
		  return callback(res.rows);
	  });
};

module.exports.getAllApplicantsByOpp = function (code, callback) {	
	console.log('query:', code);
	if(code[0]) {
		var text = "SELECT code,name,email,country,opportunity_code,curriculum_name,creation_time FROM APPLICANT WHERE opportunity_code = $1";
		pool.query(text, code, function(err, res) {
			  if(err) {
			      return console.error('error running query', err);
			  }
			  return callback(res.rows);
		});
	} else {
		  var text = "SELECT code,name,email,country,opportunity_code,curriculum_name,creation_time FROM APPLICANT WHERE opportunity_code is null";
		  pool.query(text, function(err, res) {
			  if(err) {
			      return console.error('error running query', err);
			  }
			  return callback(res.rows);
		  });
	}
};

module.exports.getApplicantCV = function (code, callback) {	
	  console.log('query:', code);
	  var text = "SELECT code,name,email,country,opportunity_code,curriculum_name,creation_time FROM APPLICANT WHERE code = $1";
	  pool.query(text, code, function(err, res) {
		  if(err) {
		      return console.error('error running query', err);
		  }
		  return callback(res.rows);
	  });  
};

// the pool also supports checking out a client for
// multiple operations, such as a transaction
module.exports.connect = function (callback) {
  return pool.connect(callback);
};