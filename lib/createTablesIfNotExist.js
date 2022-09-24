/*
creates table in database if it doesn't exist
accepts:
    table: `string`
    column: (`name TYPE`)  // in parenthesis

returns true/false
*/

const { openDB, closeDB } = require('./DB')
const sqlite = require('aa-sqlite');

const createTablesIfNotExist = async(table, columns) => {
	await openDB();
	try {		
		console.log(`checking/creating table ${table}`)
		await sqlite.run(`CREATE TABLE IF NOT EXISTS ${table} ${columns}`);
		console.log("Tables exist!")
        closeDB();
		return true
	} catch (error) {
		console.log("error at table check/creation")
		console.error(error);
		closeDB();
	}
};

module.exports = {
    createTablesIfNotExist,
}