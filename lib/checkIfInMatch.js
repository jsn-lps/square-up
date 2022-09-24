/*
checks if given userID is currently in a match
    accepts:
        player: INTEGER
        activeMatches: ARRAY


*/

const checkIfInMatch = (player, activeMatches) => {
	let inMatch = false;
	
	if (activeMatches.length == 0) {
		return inMatch 
	}	else {
		for (let i = 0; i < activeMatches.length; i++) {
			if (player.user.id == activeMatches[i]['p1']['id']  || player.user.id == activeMatches[i]['p2']['id'] ) {
				inMatch = true;
				break;
				}
			}
		}
	return inMatch	
}

module.exports = {
    checkIfInMatch,
}