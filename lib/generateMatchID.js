/*
Generates match ID at time of match creation


returns integer


*/

const generateMatchID = () => {
	let id = Math.floor(Math.random() * Date.now());
	console.log(id);
	return id
}

module.exports = {
	generateMatchID,
}