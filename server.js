
const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: false });
var express = require('express');
var cheerio = require('cheerio');
var moment = require('moment');
const Fs = require('fs');
const Path = require('path');  
const Papa = require('papaparse');
const Promise = require('bluebird');
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
  PPG: 28
};

app.get('/', async (req, res) => {
    const file = './csv/players_search_list.csv'
    var content = Fs.readFileSync(file, { encoding: 'binary' });
    const results = 
        Papa.parse(content, {
            complete: function(results) {
                return results;
            }
        })
    console.log('Results: ' + JSON.stringify(results.data));
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
      return document.querySelector('html').outerHTML;
    })
    .then((html) => {
      return cheerio.load(html, { lowerCaseTags: true });
    })
    .catch((err) => {
      if(err) throw new Error('Could not load html to cheerio');
    });
  const formatted_player_name = $('h1[itemprop="name"]').text();
  const player_img_url = $('.media-item img').attr('src');
  const stats = $('table#per_game tbody tr')
    .filter((index, element) => $(element).find('th').text())
    .map((index, element) => {  
      const season_year = $(element).find('th').text().split("-")[0];
      return {
        name: formatted_player_name,
        img_url: player_img_url,  
        season: season_year,
        position: $(element).find('td').eq(STATS.POSITION).text(),
        team: $(element).find('td').eq(STATS.TEAM).text(),
        games_played: $(element).find('td').eq(STATS.GAMES_PLAYED).text(),
        mpg: $(element).find('td').eq(STATS.MPG).text(),
        pts: $(element).find('td').eq(STATS.PPG).text(),
        ast: $(element).find('td').eq(STATS.AST_PG).text(),
        stl: $(element).find('td').eq(STATS.STL_PG).text(),
        blk: $(element).find('td').eq(STATS.BLK_PG).text(),
        rebounds: {
            orb: $(element).find('td').eq(STATS.ORB_PG).text(),
            drb: $(element).find('td').eq(STATS.DRB_PG).text(),
            trb: $(element).find('td').eq(STATS.RB_PG).text(),
        },
        field_goals: {
            field_goals_att: $(element).find('td').eq(STATS.FIELDGOALS_PG).text(),
            field_goals_made: $(element).find('td').eq(STATS.FIELDGOALSATT_PG).text(),
            field_goals_percent: $(element).find('td').eq(STATS.FIELDGOALS_PERCENT).text()
        },
        two_point: {
            two_point_att: $(element).find('td').eq(STATS.TWO_PG).text(),
            two_point_made: $(element).find('td').eq(STATS.TWOATT_PG).text(),
            two_point_percent: $(element).find('td').eq(STATS.TWO_PERCENT).text()
        },
        three_point: {
            three_point_att: $(element).find('td').eq(STATS.THREE_PG).text(),
            three_point_made: $(element).find('td').eq(STATS.THREEATT_PG).text(),
            three_point_percent: $(element).find('td').eq(STATS.THREE_PERCENT).text()
        },
        free_throw: {
            free_throw_att: $(element).find('td').eq(STATS.FT_PG).text(),
            free_throw_made: $(element).find('td').eq(STATS.FTATT_PG).text(),
            free_throw_percent: $(element).find('td').eq(STATS.FT_PERCENT).text()
        }
      }
    })
    .toArray();
    
  res.json(JSON.parse(JSON.stringify(stats)));  
  console.log('Stats: ' + JSON.stringify(stats));
})

app.listen(8081, () => {
   console.log(`Listening at port: 8081`);
})