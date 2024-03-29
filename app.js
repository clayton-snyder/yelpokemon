var createError = require('http-errors');
var express = require('express');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');
const _ = require('lodash');

const cardTemplate = require('./templates/cardTemplate').cardTemplate;
const reviewTemplate = require('./templates/reviewTemplate').reviewTemplate;

var indexRouter = require('./routes/index');

var app = express();

const hbs = exphbs.create({
  defaultLayout: 'main',
  handlebars: Handlebars,
  helpers: {
    toLowerCase: function(string) { 
      return string.toLowerCase() 
    },
    generateCards: function(rows) {
      let cardsHtml = '';
      _.forEach(rows, (row) => {
        const card = _.cloneDeep(cardTemplate);
        card.imgSrc = `pics/${row.name.toLowerCase()}.jpg`;
        card.name = row.name.charAt(0).toUpperCase() + row.name.slice(1).toLowerCase();
        card.dexNum = toPokedexString(row.id);

        if (`${row.averageRating}` === '0') {
          card.avgRating = 'No reviews';
          card.percentRating = 0;
        } else {
          card.avgRating = row.averageRating;
          card.percentRating = (row.averageRating / 5) * 100;
        }

        cardsHtml += card.toHtml();
      });
      return new Handlebars.SafeString(cardsHtml);
    },
    generateReviews: function(rows) {
      let reviewsHtml = '';
      _.forEach(rows, (row) => {
        const review = _.cloneDeep(reviewTemplate);
        review.author = row.author;
        review.percentRating = (row.stars / 5) * 100;
        if (row.reviewText.length > 0) {
          review.reviewText = `"${row.reviewText}"`;
        }
        reviewsHtml += review.toHtml();
      });
      return new Handlebars.SafeString(reviewsHtml);
    }
  }
});

const toPokedexString = function(id) {
  const digits = id.toString().length;
  if (digits === 1) {
    return `00${id}`;
  } else if (digits === 2) {
    return `0${id}`;
  } else {
    return `${id}`;
  }
}

// view engine setup
app.engine('handlebars', hbs.engine);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', indexRouter);

// maintains link to stylesheet
app.use("/public",express.static(__dirname + "/public"));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
