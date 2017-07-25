/**
 * Created by md98 on 17. 7. 26.
 */

var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'scrapping.log'})
    ]
});
logger.log('info', 'Scrapping js logging start');

var request = require('request');
var cheerio = require("cheerio");
var ict_url = "http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php"


request(ict_url, function(error, response, body){
    try {
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
                "title": $(children[1]).text().replace(/\t|\n/g, ''),
                "date": $(children[2]).text()
            };
            console.log(row);
        });
    }
    catch(exception){
        logger.log('error', error);
    }
});

var mysql = require('mysql');
var fs = require('fs');
var connection = mysql.createConnection({
    host    : 'localhost',
    user    : 'md98',
    password: fs.readFile('dbpassword.txt','utf-8', function(error, data){
        if(error) throw error;
        return data;
    }),
    database: 'data.db'
});
/*
connection.connect(function(error){
    if(error){
        throw error;
    }
    else
});
*/
logger.log('info', 'Scrapping js logging End');
