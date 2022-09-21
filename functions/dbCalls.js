


// queries database for all users and pushes to given array.
const addUsersToWorkingArray = async(eventArray) => {
    
    console.log('starting to add users')
    
    try {
    db.all(`SELECT id FROM users`,(err, rows) => {
        if (err) {
            throw err;
        }
        rows.map((row) => {
            eventArray.push(parseInt(row.id));
            console.log("added " + row.id + " to working users");
            }
        )
    })
    console.log("finished adding users!");
    return true
} catch {
    console.log("borked in adding users to array");
}


};



// exports
// exports.addUsersToWorkingArray = addUsersToWorkingArray;
