module.exports = {
	db:{
		url:process.env.HYPERCUBE_MONGO
	},
	s3:{
		key:process.env.HYPERCUBE_SERVER_S3_KEY,
		secret:process.env.HYPERCUBE_SERVER_S3_SECRET
	},
	jwtSecret:process.env.HYPERCUBE_JWT_SECRET
};