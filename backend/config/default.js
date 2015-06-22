var env = process.env.NODE_ENV;
var config;

switch (env) {
	case "STAGE":
		config = require("./env/staging");
		break;
	case "PROD":
		config = require("./env/production");
		break;
	default:
		config = require("./env/local");
		break;
}

exports.config = config;