var express = require('express');
var router = express.Router();
const _ = require('lodash');
const mysql = require('mysql');

const db = mysql.createConnection({
  host      : process.env.RDS_HOST || 'localhost',
  user      : 'yelpokemon',
  password  : 'yelpokemon',
  database  : 'yelpokemon'
});
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database.');
});

/* GET home page. */
router.get('/', (req, res) => {
  let result = '';
  db.query('SELECT * FROM pokemon', (err, rows) => {
    if (err) throw err;
    _.forEach(rows, (row) => {
      let typeSecondary = (row.typeSecondary.length > 0 ? `, ${row.typeSecondary}` : '');
      console.log(`#${row.id}: ${row.name} [${row.typePrimary}${typeSecondary}] ${row.flavorText}`);
    });
    for (let i = 0; i < rows.length; i++) {
      result += `${rows[i].id}:${rows[i].name}    `;
    }
    console.log('after loading: ' + result);
    res.render('index', { title: 'YELPOKEMON', result: result });
  });
});

router.get('/about', (req, res) => {
  res.send('abouut');
});

module.exports = router;
