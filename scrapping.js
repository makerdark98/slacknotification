/**
 * Created by md98 on 17. 7. 26.
 */
// Logger Configure
var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'scrapping.log'})
    ]
});
//


logger.log('Info', 'Scrapping js logging start');

// Read ICT Page
var request = require('request');
var cheerio = require("cheerio");
var ict_url = "http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php";

logger.log('Info', 'Scrapping Start');
request(ict_url, function(error, response, body){
    if (error) {
        logger.log('Error', "request error");
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
        console.log(row);
    });

    logger.log('Info', 'Request End');

});


// Read Database Password File
var fs = require('fs');
var dbpassword;
logger.log('Info', 'Start to read dbpassword.txt');
fs.readFile('dbpassword.txt', 'utf-8', function (error, data) {
    dbpassword = data;
    logger.log('Info', 'End to read dbpassword.txt');
});

// Connect Database

//ToDo : db Connection, db design
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data.db');
db.serialize(function(){

});

logger.log('Info', 'Scrapping js logging End');
