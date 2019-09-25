const mysql = require('mysql');
const db = require('../db.json')

var database = mysql.createConnection(db);
database.connect((error) => {
  if (error) {
    console.error('error connecting: ' + error.stack);
    return;
  }

  console.log('connected as id ' + database.threadId);
});

module.exports = database;