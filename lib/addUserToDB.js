/*
adds a new user to sqlite DB if they're never used a command before
accepts:
    userid: INTEGER
    username: STRING

returns true/false
*/

const { openDB, closeDB } = require('./DB');
const sqlite = require('aa-sqlite');


const addUserToDB = async(userid, username, userIDs) => {
	await openDB();
		try {
			await sqlite.run(`INSERT INTO users (PK_id,name)
			VALUES (${parseInt(userid)}, "${username}");`);
			userIDs.push(parseInt(userid));
            closeDB();
			return true
		} catch (error) {
			console.log(`Couldn't add user ${username} to DB`);
		}
	closeDB();
}

module.exports = {
    addUserToDB,
}