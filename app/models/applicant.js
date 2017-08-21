var method = Applicant.prototype;

function Applicant(code, name, email, country, opportunityCode, curriculum_name, creationTime) {
	this.code = code;
	this.name = name;
	this.email = email;
	this.country = country;
	this.opportunityCode = opportunityCode;
	this.curriculum_name = curriculum_name;
	this.creationTime = creationTime;
}

module.exports = Applicant;