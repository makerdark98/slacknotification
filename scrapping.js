/**
 * Created by md98 on 17. 7. 26.
 */

// urls
let ict_url = 'http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php';
let ictdb = 'db/ict.db';
let cse_url = 'http://cse.cau.ac.kr/20141201/sub05/sub0501.php';
let csedb = 'db/cse.db';

logger=require('./logger.js').logger('log/scrapping.log');
let request = require('request');
let cheerio = require('cheerio');
let databasejs = require('./database.js');

// Read ICT Page

function requestIct(){
    return new Promise(function(resolve,reject) {
        request(ict_url, function (error, response, body) {
            if (error) {
                logger.log('error', error);
                reject(error);
            }
            resolve(body);
        });
    });
}
function parseIct(body){
    postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.board_list_type01 tbody tr');
        postElements.each(function () {
            let children = $(this).children();
            let row = {
                'number': Number($(children[0]).find('a').attr('href').replace(/[^0-9]/g, '')),
                'title': $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'date': $(children[2]).text()
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushIct(postarray){
    databasejs.getDB(ictdb).then(function (database) {
        database.serialize(function () {
            postarray.forEach(function (value) {
                databasejs.insertPostsData(database, value);
            });
        });

        database.close();

    });
}
function requestCse(){
    return new Promise(function(resolve, reject){
        request(cse_url, function(error, response, body){
           if (error){
               logger.log('error', error);
               reject(error);
           }
           resolve(body);
        });
    });
}
function parseCse(body){
    postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
           normalizeWhitespace: true
        });
        let postElements = $('table.nlist tbody tr');
        postElements.each(function (){
            let children = $(this).children();
            let row = {
                'number':$(children[0]).text(),
                'title': $(children[2]).text().replace(/[\n\t\r]/g,''),
                'date' : $(children[4]).text()
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushCse(postarray){
    databasejs.getDB(csedb).then(function(database){
        database.serialize(function(){
            postarray.forEach(function(value){
                databasejs.insertPostsData(database, value);
            });
        });
        database.close();
    });
}


function _update() {
    requestIct()
        .then(parseIct)
        .then(pushIct)
        .catch(function(error){
        });
    requestCse()
        .then(parseCse)
        .then(pushCse)
        .catch(function(error){

        });
}

exports.update=_update;

// Connect Database
