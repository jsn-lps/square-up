/*
Gets a formatted date based on the current time 

returns string

*/

const { ModuleResolutionKind } = require("typescript");

const getDate = () => {
    d = new Date();   
    date = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + "-" + d.getHours() + d.getMinutes().toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      });

    return date
}


module.exports = {
    getDate
}