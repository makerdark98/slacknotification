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
        let request = require('request');
        let cheerio = require('cheerio');
        let postarray = [];
        request(ict_url, function (error, response, body) {
            if (error) {
                logger.log('error', "request error");
                reject(error);
                throw error;
            }

            let $ = cheerio.load(body, {
                normalizeWhitespace: true
            });
            let postElements = $("table.board_list_type01 tbody tr");
            postElements.each(function () {
                let children = $(this).children();
                let row = {
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
function setDBTable(dataBase){
    return new Promise(function(resolve, reject){
        logger.log('info', 'start setDBTable');
        let fs = require('fs');
        dataBase.serialize(function () {
            data = fs.readFileSync('db.sql', 'utf-8');
            dataBase.run(data);
        });
        resolve();
    });
}
function getDB(){
    return new Promise(function(resolve, reject) {
        logger.log('info', 'start getDB');
        let sqlite3 = require('sqlite3').verbose();
        let dataBase = new sqlite3.Database('data.db');
        setDBTable(dataBase).then(function(){
            resolve(dataBase);
        });
    });
}

requestCall().then(function(postarray){
    logger.log('info', 'requestCall End');
    console.log(postarray);
    getDB().then(function(dataBase){
        logger.log('info', dataBase);
        dataBase.serialize(function() {
            postarray.forEach(function (value, idx) {
                dataBase.run('INSERT OR IGNORE INTO ictPosts(idx, title, recent_date, readCheck) VALUES(' + value['number'] + ',\"' + value['title'] + '\",\"' + value['date'] + '\",0);');
                console.log('INSERT OR IGNORE INTO ictPosts(idx, title, recent_date, readCheck) VALUES(' + value['number'] + ',\"' + value['title'] + '\",\"' + value['date'] + '\",0);');
            });
        });
    dataBase.close();
    });
});

// Connect Database
/*ToDo : 이미 있는 요소 체크해서 readCheck Update 하기, Slack 기능 제작하기
 */


logger.log('info', '================Scrapping js logging End===================');
