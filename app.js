var createError = require('http-errors');
var express = require('express');
var exphbs = require('express-handlebars');
var Handlebars = require('handlebars');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');
const _ = require('lodash');

var indexRouter = require('./routes/index');

var app = express();

const cardTemplate = {
  imgSrc: '',
  name: '',
  dexNum: '',
  toHtml: function() {
    return `<card>
      <div class="cardcontainer">
        <img src="pics/${this.name.toLowerCase()}.jpg" alt="${this.name}" align="center" valign="center">
      </div>
      <div class="text">
        <h3>${this.name}</h3>
        <p>PokeDex: ${this.dexNum}</p>

        <table>
          <tr>
            <th>
              <p>Average rating: </p>
            </th>
            <th>
              <div class="star-ratings-sprite">
                <span style="width:32%" class="star-ratings-sprite-rating"></span>
              </div>
            </th>
          </tr>
        </table>

        <br>

        <button onclick="window.location.href = '/pokemon/${this.name}';">View ${this.name}</button>
      </div>
    </card>`
  }
}

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
        cardsHtml += card.toHtml();
      });
      return new Handlebars.SafeString(cardsHtml);
    }
  }
})

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
