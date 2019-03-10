var express = require('express');
var router = express.Router();
const _ = require('lodash');
const mysql = require('mysql');

const db = mysql.createConnection({
  host      : process.env.RDS_HOST || 'localhost',
  user      : process.env.RDS_USER || 'yelpokemon',
  password  : process.env.RDS_PASSWORD || 'yelpokemon',
  database  : process.env.RDS_DB || 'yelpokemon'
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
      result += `#${rows[i].id} ${rows[i].name} .. `;
    }
    console.log('after loading: ' + result);
    res.render('index', { title: 'YELPOKEMON', result: result });
  });
});

router.post('/pokemon/:id/review', (req, res) => {
  const queryText = `INSERT INTO review (pokemonPK, stars, reviewText) ` + 
    `VALUES (${req.params.id}, ${req.body.rating}, "${req.body.reviewText}");`;
  db.query(queryText, (err, results) => {
    if (err) throw err;
    res.send(`Review submitted for Pokemon #${req.params.id}!`);
  });
})

router.get('/about', (req, res) => {
  res.send('abouut');
});

module.exports = router;
