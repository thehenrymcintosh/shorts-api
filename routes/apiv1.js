var express = require('express');
var router = express.Router();
var request = require('request');
var APIKEY = "8ff99ae7d3637e2838d23c7f2ea9a824";

// var url = "https://api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=" + APIKEY;
var forecastURL = "https://api.openweathermap.org/data/2.5/forecast";
var weatherURL = "https://api.openweathermap.org/data/2.5/weather";
var locationQuery = 'London,uk';
var units = 'kelvin';

/* GET forecast. */
router.get('/forecast', function(req, res, next) {
    var tempRes;
    request({
        uri: forecastURL,
        qs: {
        APPID: APIKEY,
        q: locationQuery,
        units: units
        }
    }, function(error, response, body){
        var data = JSON.parse(body);
        res.json(interpretWeather(data.list));
    });
});

router.get('/current', function(req, res, next) {
    request({
      uri: weatherURL,
      qs: {
        APPID: APIKEY,
        q: locationQuery,
        units: units
      }
    }).pipe(res);
    
  });


function interpretWeather(weatherArr){
    var days = weatherArr.map( (el, i, arr) => {
        var date = new Date(el.dt*1000);
        return {
            "shorts": tempRecommmend(el.main.temp),
            "T": el.main.temp,
            "dt": date,
            "date": date.getHours() + ':00, ' + date.getDate() + '/' + date.getMonth() ,
            "HOURS": date.getHours(),
            "DD": date.getDate(),
            "MM": date.getMonth(),
            "day": getDay(date.getDay())
        };
    })
    .group("DD");
    var output = [];
    Object.keys(days).forEach( day => {
        var W = 0;
        console.log(getDay(day))
        var [startHr, endHr] = activeHours[days[day][0].day];
        var accumulator = 0;
        days[day].forEach( hourData => {
            if (hourData.HOURS >= startHr && hourData.HOURS <= endHr ){
                accumulator += hourData.T * activeWeight
                W += activeWeight;
            } else {
                accumulator += hourData.T * inactiveWeight
                W += inactiveWeight;                
            }
        });
        output.push({
            "T": K_to_C(accumulator/W),
            "should_wear":tempRecommmend(K_to_C(accumulator/W)),
            "day":days[day][0].day,
            "DD":days[day][0].DD,
            "MM":days[day][0].MM,
            "Temps": days[day].map( hourData => [hourData.HOURS, K_to_C(hourData.T)])
        })
    });
    return output;
}
var activeWeight = 0.999;
var inactiveWeight = 0.001;

function reducer(accumulator, currentValue, index, arr ){
    var toReturn = 0;
};
function K_to_C(K){
    return Number((K - 273.15).toFixed(2));
}

function tempRecommmend(T, options = null){
    if (T > 17){
        return 'Shorts'
    } else if ( T > 12 ){
        return 'Longs'
    } else if ( T > 7 ){
        return 'Jacket'
    } else if ( T > 0 ){
        return 'Coat'
    } else {
        return "Freezing"
    }
}

function getDay(num){
    switch (num) {
        case 0:
            return 'Sunday'
            break;
        case 1:
            return 'Monday'
            break;
        case 2:
            return 'Tuesday'
            break;
        case 3:
            return 'Wednesday'
            break;
        case 4:
            return 'Thursday'
            break;
        case 5:
            return 'Friday'
            break;
        case 6:
            return 'Saturday'
            break;
    }
    return undefined
}

var activeHours = {
    "Monday": [ 8, 20 ],
    "Tuesday": [ 8, 20 ],
    "Wednesday": [ 8, 20 ],
    "Thursday": [ 8, 20 ],
    "Friday": [ 8, 23 ],
    "Saturday": [9, 23],
    "Sunday": [9, 20]
}


module.exports = router;


Array.prototype.group = function(property){
    var newData = {};
    this.forEach( (el, i, arr) => {
        if ( newData.hasOwnProperty(el[property]) ){
            newData[ el[property] ].push( el );
        } else {
            newData[ el[property] ] = [ el ]
        }
    })
    return newData
    // return Object.keys(newData).map( (el, i, arr) => {
    //     return newData[el];
    // });
}