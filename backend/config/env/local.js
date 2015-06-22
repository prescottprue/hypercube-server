module.exports = {
	db:{
		url:"localhost:27017",
		name:"test"
	},
	s3:{
		key:process.env.HYPERCUBE_SERVER_S3_KEY || process.env.HYPERCUBE_SERVER_S3_KEY,
		secret:process.env.HYPERCUBE_SERVER_S3_SECRET || process.env.HYPERCUBE_SERVER_S3_SECRET
	},
	jwtSecret:"shhhhhhh"
};