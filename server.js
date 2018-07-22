
var express = require('express');
var cheerio = require('cheerio');
var moment = require('moment');
const Fs = require('fs');
const Path = require('path');  
const Papa = require('papaparse');
const Promise = require('bluebird');
const request = require('request');
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

const LEAGUE_STATS = {
  SEASON: 0,
  FG: 22,
  THREE: 23,
  FT: 24
}

app.get('/', async (req, res) => {
  res.send('<h1>Hello World!</h1>');
})

function get_player_list() {
  const file = './csv/players.csv'
  var content = Fs.readFileSync(file, { encoding: 'binary' });
  const results = 
    Papa.parse(content, {
      complete: function(results) {
        return results;
      }
    });
  return results.data;  
}

function search_players(player_list, player_name) {
  var low_index = 0;
  var high_index = player_list.length - 2;
  var mid_index;
  while(low_index <= high_index) {
    mid_index = parseInt((low_index + high_index) / 2);
    console.log('Player Lookup: ' + player_list[mid_index][1]);
    if ((player_list[mid_index][1]).localeCompare(player_name) === 1) {
      high_index = mid_index - 1;
    } else if ((player_list[mid_index][1]).localeCompare(player_name) === -1) {
      low_index = mid_index + 1;
    } else {
      return player_list[mid_index][0];
    }   
  }

  if(player_list[mid_index][1].toLowerCase() === player_name.toLowerCase()) {
    return player_list[mid_index][0];
  } else {
    //return players close to it
    console.log('Choosing closest player');
    return player_list[mid_index][0];
  }
}

function update_with_league_avg(stats) {
  const seasons_available = stats.map((stat) => stat.season);
  return Promise.fromCallback((cb) => 
  request('https://www.basketball-reference.com/leagues/NBA_stats.html', (err, res, body) => {
    const $ = cheerio.load(body, { lowerCaseTags: true });
    const league_stats = $('#stats tbody tr')
      .filter((index, element) => $(element).find('td').eq(0).text() && seasons_available.includes($(element).find('td').eq(0).text()))
      .map((index, element) => {
        return {
          season: $(element).find('td').eq(LEAGUE_STATS.SEASON).text(),
          field_goal_percent: $(element).find('td').eq(LEAGUE_STATS.FG).text(),
          three_percent: $(element).find('td').eq(LEAGUE_STATS.THREE).text(),
          free_throw_percent: $(element).find('td').eq(LEAGUE_STATS.FT).text()
        }
      })
      .toArray()
    return cb(null, league_stats);
  })
);
}

app.get('/scrapeLeague', async (req, res) => {
  const league_averages = await Promise.fromCallback((cb) => 
    request('https://www.basketball-reference.com/leagues/NBA_stats.html', (err, res, body) => {
      const $ = cheerio.load(body, { lowerCaseTags: true });
      const league_stats = $('#stats tbody tr')
        .filter((index, element) => $(element).find('td').eq(0).text())
        .map((index, element) => {
          return {
            season: $(element).find('td').eq(LEAGUE_STATS.SEASON).text(),
            field_goal_percent: $(element).find('td').eq(LEAGUE_STATS.FG).text(),
            three_percent: $(element).find('td').eq(LEAGUE_STATS.THREE).text(),
            free_throw_percent: $(element).find('td').eq(LEAGUE_STATS.FT).text()
          }
        })
        .toArray()
      return cb(null, league_stats);
    })
  );
  res.json(JSON.parse(JSON.stringify(league_averages)));  
});

app.get('/scrapePlayer/', async (req, res) => {
  const player_name = req.query.playername.replace(/\b(\w)/g, function (chr) {
    return chr.toUpperCase();
  });
  const player_list = get_player_list();
  const player_id = search_players(player_list, player_name);
  
  const player_stats = await Promise.fromCallback((cb) => 
    request(`https://www.basketball-reference.com/players/${player_id.charAt(0)}/${player_id}.html`, async (err, res, body) => {  
      const $ = cheerio.load(body, { lowerCaseTags: true });
      const formatted_player_name = $('h1[itemprop="name"]').text();
      const player_img_url = $('.media-item img').attr('src');
      const stats = $('table#per_game tbody tr')
        .filter((index, element) => $(element).find('th').text())
        .map((index, element) => {  
          //const season_year = $(element).find('th').text().split("-")[0];
          const season_year = $(element).find('th').text();
          return {
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
      const player_object = {
        name: formatted_player_name,
        img_url: player_img_url,
        stats: stats
      }  
      return cb(null, player_object);
    })
  );
  //NOTE:league average start from most recent vs player stats start from least recent
  const league_averages = await update_with_league_avg(player_stats.stats);
  player_stats.stats.map((stat, index) => {
    var season_index = league_averages.length - (index + 1);
    stat.field_goals.league_average = league_averages[season_index].field_goal_percent;
    stat.three_point.league_average = league_averages[season_index].three_percent;
    stat.free_throw.league_average = league_averages[season_index].free_throw_percent;
    return stat;
  });
  
  res.json(JSON.parse(JSON.stringify(player_stats)));  
})

app.listen(8081, () => {
   console.log(`Listening at port: 8081`);
})