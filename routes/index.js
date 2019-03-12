var express = require('express');
var router = express.Router();
const _ = require('lodash');
const mysql = require('mysql');
const axios = require('axios');

// Handle all status codes through promise resolve
axios.defaults.validateStatus = (status) => {
  return status >= 200;
};

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
  res.render('index', { title: 'YELPOKEMON' });
  // db.query('SELECT * FROM pokemon', (err, rows) => {
  //   if (err) throw err;
  //   _.forEach(rows, (row) => {
  //     let typeSecondary = (row.typeSecondary.length > 0 ? `, ${row.typeSecondary}` : '');
  //     console.log(`#${row.id}: ${row.name} [${row.typePrimary}${typeSecondary}] ${row.flavorText}`);
  //   });
  //   for (let i = 0; i < rows.length; i++) {
  //     result += `#${rows[i].id} ${rows[i].name} .. `;
  //   }
  //   console.log('after loading: ' + result);
  //   res.render('index', { title: 'YELPOKEMON', result: result });
  // });
});

router.get('/pokemon/:name', (req, res) => {
  const pokemonQuery = `SELECT * FROM pokemon WHERE name="${req.params.name}"`;
    db.query(pokemonQuery, (err, rows) => {
    if (err) {
      res.render('error', { code: 500, message: "Internal server error." });
      return;
    }

    const name = req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1).toLowerCase();
    if (`${rows.length}` === '0') {
      res.render('error', { code: '404', message: `"${name}" not found.`});
      return;
    }

    const number = rows[0].id;
    const typePrimary = rows[0].typePrimary.toUpperCase();
    const typeSecondary = rows[0].typeSecondary;
    const reviewQuery = `SELECT stars, reviewText FROM review WHERE pokemonName="${name}";`
    const reviews = [];
    let avgRating = 0;
    db.query(reviewQuery, (err, rows) => {
      if (err) {
        res.render('error', { code: 500, message: "Internal server error." });
        return;
      }

      for (let i = 0; i < rows.length; i++) {
        console.log(rows[i].stars);
        console.log(typeof rows[i].stars);
        avgRating += rows[i].stars;
        reviews.push(rows[i].reviewText);
      }

      avgRating /= rows.length;

      if (!avgRating) {
        avgRating = 'No reviews.';
      }

      res.render('pokemon-review-page', {
        number: number,
        name: name, 
        typePrimary: typePrimary,
        typeSecondary: typeSecondary,
        rating: avgRating,
        reviews: reviews
      });
    });
  });
});

router.post('/pokemon/:name/review', (req, res) => {
  if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
    res.render('error', { code: 400, message: "Must submit a rating between 1 and 5."});
    return;
  }
  const queryText = `INSERT INTO review (pokemonName, stars, reviewText) ` + 
    `VALUES ("${req.params.name}", ${req.body.rating}, "${req.body.reviewText}");`;
  db.query(queryText, (err, results) => {
    if (err) { 
      console.log(err);
      res.render('error', { code: 500, text: "Internal server error." });
      return;
    }
    res.send(`Review submitted for ${req.params.name}!`);
  });
})

router.get('/about', (req, res) => {
  res.send('abouuut');
});

// This endpoint loads pokemon from #1-151 into the database. Disabled so it can't be called
// publicly. Uncomment and hit the endpoint if you want to re-load the database.
/*
router.get('/load-db', async(req, res) => {
  res.write('loading...');
  for (let i = 1; i <= 151; i++) {
    await axios({
      method: 'GET',
      url: `https://pokeapi.co/api/v2/pokemon/${i}`
    })
    .then((response) => {
      let typePrimary = _.find(response.data.types, (type) => { 
        return `${type.slot}` === '1';
      }).type.name;

      let typeSecondary = _.find(response.data.types, (type) => { 
        return `${type.slot}` === '2';
      });

      typeSecondary = (typeSecondary ? typeSecondary.type.name : '');

      if (!typeSecondary) typeSecondary = '';
      console.log(`Inserting #${i} ${response.data.name} ${typePrimary} ${typeSecondary}`);
      const queryText = `INSERT INTO pokemon (id, name, typePrimary, typeSecondary) VALUES ` +
        `(${i}, "${response.data.name}", "${typePrimary}", "${typeSecondary}");`;
      db.query(queryText, (err, results) => {
        if (err) throw err;
        console.log(results);
      });
    });
  }
  res.write('\nDatabase loaded!');
  res.end();
});
*/


module.exports = router;
