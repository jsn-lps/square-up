/*
Database calls and functions. 

	import with 
require('./DB.js')

use with 
	DB.func()

*/

require('dotenv').config();
const sqlite = require('aa-sqlite');



const openDB = async() => {
	try {
		await sqlite.open("./data/SquareUp.sqlite");
		console.log("-- Opened DB connection --")
	} catch (error) {
		console.error("Couldn't open DB connection");
		sqlite.close();
	}
}


const closeDB = async() => {
	
	try {
		sqlite.close();
		console.log(" -- Closed DB connection --")
	} catch (error) {
		console.log('DB already closed')
	}
}


// exports 
module.exports = { 
	openDB,
	closeDB,
	}


