const db = require('../db');

const tbReaction = {

  tableName: 'reaction',

  methods: {
    insertReaction: (reaction) => {
      let query = `INSERT INTO reaction SET ?;`
      
      db.query(query, reaction, (error, results, fields) => {
        if (error) throw error;

          return 1;
        });
    },
  }
}

module.exports = tbReaction;