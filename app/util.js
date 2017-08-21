module.exports.getValidationMessage = function (validationArray) {
	var messageString = '';
	validationArray.forEach(function(element){
		messageString += element.msg + '<br />';
	});
	return messageString;
};