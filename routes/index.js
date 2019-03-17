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
  db.query('SELECT * FROM pokemon', (err, rows) => {
    if (err) throw err;
    res.render('index', { rows: rows });
  });

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

    // Set number to be a three-digit string regardless of numberical value
    let number = rows[0].id;
    const digits = number.toString().length;
    if (digits === 1) {
      number = `00${number}`;
    } else if (digits === 2) {
      number = `0${number}`
    } else {
      number = `${number}`;
    }
    
    const typePrimary = rows[0].typePrimary.toUpperCase();
    const typeSecondary = rows[0].typeSecondary;
    let avgRating = rows[0].averageRating;
    const reviewQuery = `SELECT * FROM review WHERE pokemonName="${name}";`;
    db.query(reviewQuery, (err, rows) => {
      if (err) {
        res.render('error', { code: 500, message: "Internal server error." });
        return;
      }

      let percentRating = (avgRating / 5) * 100;

      if (`${avgRating}` === '0') {
        avgRating = 'No reviews.';
        percentRating = 0;
      }

      res.render('pokemon-review-page', {
        rows: rows,
        number: number,
        name: name,
        typePrimary: typePrimary,
        typeSecondary: typeSecondary,
        rating: avgRating,
        avgRating: avgRating,
        percentRating: percentRating 
      });
    });
  });
});

router.post('/pokemon/:name/review', (req, res) => {
  if (!req.body.rating || req.body.rating < 1 || req.body.rating > 5) {
    res.render('error', { code: 400, message: "Must submit a rating between 1 and 5."});
    return;
  }
  const queryText = 
    `INSERT INTO review
    (pokemonName, stars, reviewText, author)  
    VALUES
    ("${req.params.name}", ${req.body.rating}, "${req.body.reviewText}", "${req.body.author}");`;
    
  db.query(queryText, (err, results) => {
    if (err) { 
      console.log(err);
      res.render('error', { code: 500, text: "Internal server error." });
      return;
    }

    const starsQuery = `SELECT stars FROM review WHERE pokemonName="${req.params.name}";`
    db.query(starsQuery, (err, rows) => {
      if (err) {
        console.log(err);
        res.render('error', { code: 500, text: "Internal server error." });
        return;
      }

      let avgRating = 0.00;

      for (let i = 0; i < rows.length; i++) {
        avgRating += rows[i].stars;
      }

      avgRating /= rows.length;

      if (!avgRating) {
        avgRating = 0.00;
      }

      const updateAvgQuery =
        `UPDATE pokemon ` +
        `SET averageRating = ${avgRating} ` +
        `WHERE LOWER(name)="${req.params.name.toLowerCase()}"`;

      db.query(updateAvgQuery, (err, result) => {
        if (err) {
          console.log(err);
          res.render('error', { code: 500, text: "Internal server error." });
          return;
        }
      });

    });
    const name = req.params.name.charAt(0).toUpperCase() + req.params.name.slice(1).toLowerCase();
    res.render('review-submitted', { name: name });
  });
})

router.get('/about', (req, res) => {
  res.render('about');
});

router.get('/pokemon', (req, res) => {
  res.redirect('/');
})

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
