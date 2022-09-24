/*
pushed all users to an array
accepts:
    table: ARRAY

returns true/false
*/

const { openDB, closeDB } = require('./DB')
const sqlite = require('aa-sqlite');

const addUsersToWorkingArray = async(eventArray) => {
	await openDB();
    try {
		console.log("adding users to working array");
		await sqlite.each(`SELECT PK_id FROM users`, [], (user) => {
			eventArray.push(user.id);
		}); 
        closeDB();
		return true
	} catch {
		console.log("vvv borked in adding users to array vvv");
        closeDB();
	}
} 

module.exports = {
    addUsersToWorkingArray,
}