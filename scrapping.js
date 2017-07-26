/**
 * Created by md98 on 17. 7. 26.
 */

// urls
let ict_url = 'http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php';
let ictdb = 'db/ict.db';

logger=require('./logger.js').logger('log/scrapping.log');

// Read ICT Page

function requestCall(){
    return new Promise(function(resolve,reject) {


        logger.log('info', 'requestCall start');


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

            logger.log('info', 'requestCall End');
        });
    });
}


requestCall().then(function(postarray){
    let databasejs = require('./database.js');
    databasejs.getDB(ictdb).then(function(database){

        database.serialize(function() {
            postarray.forEach(function (value) {
                databasejs.insertIctPostsData(database, value);
            });
        });

    database.close();

    });
});

// Connect Database
