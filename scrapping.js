/**
 * Created by md98 on 17. 7. 26.
 */
// Logger Configure
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true
        }),
        new (winston.transports.File)({
            timestamp: 'true',
            filename: 'log/scrapping.log'
        })
    ]
});

logger.log('info', 'Scrapping js logging start');

// Read ICT Page
var request = require('request');
var cheerio = require('cheerio');
var ict_url = "http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php";
var Promises = require('bluebird');

var postarray = [];
logger.log('info', 'Scrapping Start');
logger.log('info', 'request start');
request(ict_url, function (error, response, body) {
    if (error) {
        logger.log('error', "request error");
        throw error;
    }

    var $ = cheerio.load(body, {
        normalizeWhitespace: true
    });
    var postElements = $("table.board_list_type01 tbody tr");
    postElements.each(function () {
        var children = $(this).children();
        var row = {
            "number": Number($(children[0]).find('a').attr('href').replace(/[^0-9]/g, '')),
            "title": $(children[1]).text().replace(/[\n\t\r]/g, ''),
            "date": $(children[2]).text()
        };
        postarray.push(row);
    });
});

logger.log('info', 'db start');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data.db');
db.serialize(function () {
    fs.readFile('db.sql', 'utf-8', function (error, data) {
        //console.log(data);
        if (error) logger.log('error', error);
        db.run(data);
    });

});

// Connect Database
//ToDo : db Connection, db design


logger.log('info', 'Scrapping js logging End');
