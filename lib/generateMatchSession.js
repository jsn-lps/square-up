/*
    Will create a match object and stage in activeMathes array
    takes in userID of both the challenger and the opponent players for storing

    requires: generateMatchID, checkIfInMatch

    accepts:
        challenger: INTEGER
        opponent: INTEGER
        game: STRING
        activeMatches: ARRAY


    match object:
        active and accepted as false by default 
        result is null by default
    
    returns: matchID: INTEGER || emptyString
 */

const { generateMatchID } = require('./generateMatchID')
const { checkIfInMatch } = require('./checkIfInMatch')

const generateMatchSession = async(challenger, opponent, game, activeMatches) => {	

	if (checkIfInMatch(challenger, activeMatches) || checkIfInMatch(opponent, activeMatches)) {		
		return ""
	} else {
		let id = generateMatchID();

		activeMatches.push({ 
			'matchID': id,
            'game': game,
			'p1': {
                'name': challenger.user.username, 
                'id': challenger.user.id
                },
			'p2': {
                'name': opponent.user.username, 
                'id': opponent.user.id
                },
			'active': false, 
            'accepted': false, 
            'result': null });

		return id;
	}
}

module.exports = {
    generateMatchSession
}