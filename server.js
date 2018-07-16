
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });
var express = require('express');
var cheerio = require('cheerio');
var moment = require('moment');
var app = express();

const STATS = {
  AGE: 0,
  TEAM: 1,
  LEAGUE: 2,
  POSITION: 3,
  GAMES_PLAYED: 4,
  GAMES_STARTED: 5,
  MPG: 6,
  FIELDGOALS_PG: 7,
  FIELDGOALSATT_PG: 8,
  FIELDGOALS_PERCENT: 9,
  THREE_PG: 10,
  THREEATT_PG: 11,
  THREE_PERCENT: 12,
  TWO_PG: 13,
  TWOATT_PG: 14,
  TWO_PERCENT: 15,
  FT_PG: 17,
  FTATT_PG: 18,
  FT_PERCENT: 19,
  ORB_PG: 20,
  DRB_PG: 21,
  RB_PG: 22,
  AST_PG: 23,
  STL_PG: 24,
  BLK_PG: 25,
  TO_PG: 26,
  FOULS_PG: 27,
  P_PG: 28
};

app.get('/', (req, res) => {
   res.send('<h1>Hello World!</h1>');
})

app.get('/scrapePlayer/', async (req, res) => {
  const player_name = req.query.playername;
  const $ = await nightmare
    .goto('https://www.basketball-reference.com/')
    .wait('input[name="search"]')
    .type('input[name="search"]', player_name)
    .click('input[type="submit"]')
    .evaluate(() => {
      return document.querySelector('html').outerHTML
    })
    .then((html) => {
      return cheerio.load(html, { lowerCaseTags: true });
    })
    .catch((err) => {
      if(err) throw new Error('Could not load html to cheerio');
    });
  const stats = $('table#per_game tbody tr')
    .filter((index, element) => $(element).find('th').text())
    .map((index, element) => {
      const season_year = $(element).find('th').text().split("-")[0];
      const ppg = $(element).find('td').eq(STATS.P_PG).text();
      return {
        season: season_year,
        pts: ppg
      }
    })
    .toArray();
  res.json(JSON.parse(JSON.stringify(stats)));  
  console.log('Stats: ' + JSON.stringify(stats));
})

app.listen(8081, () => {
   console.log(`Listening at port: 8081`);
})