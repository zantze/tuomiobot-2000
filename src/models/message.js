const db = require('../db');

const tbMessage = {

  tableName: 'message',

  methods: {
    insertMessage: (message) => {
      let query = `INSERT INTO message SET ?;`
      
      db.query(query, message, (error, results, fields) => {
        if (error) throw error;

          return 1;
        });
    },
  }
}

module.exports = tbMessage;