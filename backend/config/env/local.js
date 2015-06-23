module.exports = {
	db:{
		url:"localhost:27017",
		name:"hypercube"
	},
	s3:{
		key:process.env.HYPERCUBE_SERVER_S3_KEY,
		secret:process.env.HYPERCUBE_SERVER_S3_SECRET
	},
	jwtSecret:"shhhhhhh"
};