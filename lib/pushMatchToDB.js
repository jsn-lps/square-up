/*
Pushes matching match obj to sqlite database

accepts:
    challengerId INTEGER
    opponentId INTEGER
    game STRING 
    activeMatches ARRAY 


returns 
    true = success
    false = failed

*/

const { openDB, closeDB } = require('./DB')
const { getDate } = require('./getDate')


const pushMatchToDB = async(challengerId, opponentId, game, activeMatches) => {
        let matchFound = false // extra layer of checking (useless?)
    try {
        console.log(`-- Pushing Match ${challengerId} vs ${opponentId} on game ${game} to Database --`);
        // search for match in activematches array
        for (let i = 0; i < activeMatches.length; i++) {

            if(activeMatches[i]['matchID'] !== btnMatchID){
                return

            } else {
                console.log("trying to add match to DB")
                await openDB();
                await sqlite.run(`INSERT INTO ${game}(match_id,date,player_1,player_2,notes) 
                VALUES(${activeMatches[i]['matchID']},'${getDate()}',${activeMatches[i]['p1']['id']},${activeMatches[i]['p2']['id']},'match accepted')`);
                console.log("== Match Started ==");
                await closeDB();
                matchFound = true
                break;
            }
        }
        if (!matchFound){
            console.log("no active match found")
            return matchFound
        }
            return matchFound
    } catch (error) {
        console.log("--- Failed to add match to database ---")
        console.error(error)
        return false
    }
}


module.exports = {
    pushMatchToDB
}