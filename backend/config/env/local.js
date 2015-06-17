module.exports = {
	db:{
		url:"localhost:27017",
		name:"hypercube"
	},
	jwtSecret:process.env.HYPERCUBE_JWT_SECRET
};