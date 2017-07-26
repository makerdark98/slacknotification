/**
 * Created by md98 on 17. 7. 26.
 */

// urls
var ict_url = "http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php";

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
logger.log('info', '==============Scrapping js logging start=================');

// Read ICT Page

logger.log('info', 'Scrapping Start');
logger.log('info', 'request start');
function requestCall(){
    return new Promise(function(resolve,reject) {
        var request = require('request');
        var cheerio = require('cheerio');
        var postarray = [];
        request(ict_url, function (error, response, body) {
            if (error) {
                logger.log('error', "request error");
                reject(error);
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
            resolve(postarray);
        });
    });
}
function dbCall() {
    return new Promise(function(resolve, reject) {
        logger.log('info', 'db start');
        var fs = require('fs');
        var sqlite3 = require('sqlite3').verbose();
        var db = new sqlite3.Database('data.db');
        db.serialize(function () {
            fs.readFile('db.sql', 'utf-8', function (error, data) {
                //console.log(data);
                if (error){
                    logger.log('error', error);
                    reject(error);
                    throw error;
                }
                db.run(data);
            });

        });
        resolve(db);
    });
}

requestCall().then(function(postarray){
    logger.log('info', 'requestCall End');
    console.log(postarray);
    dbCall().then(function(db){
        logger.log('info', 'dbCall End');
        logger.log('info', db);
        postarray.forEach(function(value, idx) {
            db.run('INSERT OR IGNORE INTO ictPosts(idx, title, recent_date, readCheck) VALUES(' + value['number'] + ',\"' + value['title'] + '\",\"' + value['date'] + '\",0);');
            console.log('INSERT OR IGNORE INTO ictPosts(idx, title, recent_date, readCheck) VALUES(' + value['number'] + ',\"' + value['title'] + '\",\"' + value['date'] + '\",0);');
        });
    });
});

// Connect Database
//ToDo : db Connection, db design


logger.log('info', '================Scrapping js logging End===================');
