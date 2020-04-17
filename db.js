const mongoose = require('mongoose');
const db = 'mongodb+srv://gadarsh555:ucantcme@social-network-a0bj4.mongodb.net/test?retryWrites=true&w=majority;';

const connectDB = async () => {
	try {
		await mongoose.connect(db, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useCreateIndex: true,
			useUnifiedTopology: true
		});

		console.log('Database MongoDb connected');
	} catch (error) {
		console.error(error.message);
		// exit process with failure
		process.exit(1);
	}
};

module.exports = connectDB;
