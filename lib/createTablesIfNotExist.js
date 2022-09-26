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
		await sqlite.run(`CREATE TABLE IF NOT EXISTS ${table} (${columns})`);
		console.log("Tables exist!")
		console.log(`creating columns if not exist`)
		
		// create/add columns in table if not exist
		let newCol = columns.split(',')
		for (let i = 0; i < newCol.length; i++){
			let col = newCol[i].split(' ')[0];
			let colType = newCol[i].split(' ')[1];
			
			try {
				// probably a goofy way to do this, rewrite later 
				await sqlite.run(`SELECT ${col} FROM ${table} LIMIT 1`)
			} catch (error) {
				await sqlite.run(`ALTER TABLE ${table} ADD ${col} ${colType}`)
				console.log(`+++ ADDED NEW COLUMN ${col} WITH TYPE ${colType} TO ${table} +++`)
			}
		}			
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