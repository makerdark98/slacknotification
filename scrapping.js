/**
 * Created by md98 on 17. 7. 26.
 */

// urls
let ict_url = 'http://ict.cau.ac.kr/20150610/sub05/sub05_01_list.php';
let ictdb = 'db/ict.db';
let cse_url = 'http://cse.cau.ac.kr/20141201/sub05/sub0501.php';
let csedb = 'db/cse.db';
let accord_url = 'http://cse.cau.ac.kr/20141201/sub04/sub0403.php';
let accorddb = 'db/accord.db';
let cau_url = 'https://www.cau.ac.kr/04_ulife/causquare/notice/notice_list.php?bbsId=cau_notice';
let caudb = 'db/cau.db';
let dor_url = 'http://dormitory.cau.ac.kr/bbs/bbs_list.php?bbsID=notice';
let dordb = 'db/dor.db';
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
    let postarray=[];
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
    return new Promise(function(resolve, reject) {
        databasejs.getDB(ictdb).then(function (database) {
            database.serialize(function () {
                postarray.forEach(function (value) {
                    databasejs.insertPostsData(database, value);
                });
            });
            database.close();
            resolve(postarray.length);
        });
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
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
           normalizeWhitespace: true
        });
        let postElements = $('table.nlist tbody tr');
        postElements.each(function (){
            let children = $(this).children();
            let row = {
                'number':Number($(children[2]).find('a').attr('href').match(/uid=(\d+)/g)[0].replace(/[^0-9]/g,'')),
                'title': $(children[2]).text().replace(/[\n\t\r]/g,''),
                'date' : $(children[4]).text()
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushCse(postarray){
    return new Promise(function(resolve, reject) {
        databasejs.getDB(csedb).then(function (database) {
            database.serialize(function () {
                postarray.forEach(function (value) {
                    databasejs.insertPostsData(database, value);
                });
            });
            database.close();
            resolve(postarray.length);
        });
    });
}
function requestAccord(){
    return new Promise(function(resolve, reject){
        request(accord_url, function (error, response, body){
            if(error){
                logger.log('error', error);
                reject(error);
            }
            resolve(body);
        });
    });
}
function parseAccord(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.nlist tbody tr');
        postElements.each(function (){
            let children = $(this).children();
            let row = {
                'number':Number($(children[2]).find('a').attr('href').match(/uid=(\d+)/g)[0].replace(/[^0-9]/g,'')),
                'title': $(children[2]).text().replace(/[\n\t\r]/g, ''),
                'date' : $(children[4]).text()
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushAccord(postarray){
    return new Promise(function(resolve, reject) {
        databasejs.getDB(accorddb).then(function (database) {
            database.serialize(function () {
                postarray.forEach(function (value) {
                    databasejs.insertPostsData(database, value);
                });
            });
            database.close();
            resolve(postarray.length);
        });
    });
}

function requestCau(){
    return new Promise(function(resolve, reject) {
        let webdriver = require('selenium-webdriver');
        let By = webdriver.By;
        let body;
        let driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();
        driver.get(cau_url)
            .then(function () {
                body = driver.findElement(By.tagName('body')).getAttribute('innerHTML');
            })
            .then(function () {
                driver.quit();
                resolve(body);
            });
    });
}
function parseCau(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.bbslist tbody tr');
        postElements.each(function(){
            let children = $(this).children();
            let row = {
                'number':Number($(children[1]).find('a').attr('href').replace(/[^0-9]/g,'')),
                'title': $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'date': $(children[2]).text()
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushCau(postarray){
    return new Promise(function(resolve, reject) {
        databasejs.getDB(caudb).then(function (database) {
            database.serialize(function () {
                postarray.forEach(function (value) {
                    databasejs.insertPostsData(database, value);
                });
            });
            database.close();
            resolve(postarray.length);
        });
    });
}
function requestDor(){
    return new Promise(function(resolve, reject) {
        let webdriver = require('selenium-webdriver');
        let By = webdriver.By;
        let body;
        let driver = new webdriver.Builder()
            .forBrowser('chrome')
            .build();
        driver.get(dor_url)
            .then(function () {
                body = driver.findElement(By.tagName('body')).getAttribute('innerHTML');
            })
            .then(function () {
                driver.quit();
                resolve(body);
            });
    });
}
function parseDor(body){
    let postarray=[];
    return new Promise(function(resolve, reject){
        let $ = cheerio.load(body, {
            normalizeWhitespace: true
        });
        let postElements = $('table.tbl_board tbody tr');
        postElements.each(function (){
            let children = $(this).children();
            if(children.text()==='' || $(children[0]).text()==='번호'){
                return;
            }
            let row = {
                'number':Number($(children[1]).find('a').attr('href').replace(/[^0-9]/g,'')),
                'title': $(children[1]).text().replace(/[\n\t\r]/g, ''),
                'date' : $(children[4]).text()
            };
            postarray.push(row);
        });
        resolve(postarray);
    });
}
function pushDor(postarray){
    return new Promise(function(resolve, reject) {
        databasejs.getDB(dordb).then(function (database) {
            database.serialize(function () {
                postarray.forEach(function (value) {
                    databasejs.insertPostsData(database, value);
                });
            });
            database.close();
            resolve(postarray.length);
        });
    });
}

function _update() {
    requestIct()
        .then(parseIct)
        .then(pushIct)
        .catch(function(error){
            logger.log('error', error);
        });
    requestCse()
        .then(parseCse)
        .then(pushCse)
        .catch(function(error){
            logger.log('error', error);
        });
    requestAccord()
        .then(parseAccord)
        .then(pushAccord)
        .catch(function(error){
            logger.log('error', error);
        });
    requestCau()
        .then(parseCau)
        .then(pushCau)
        .catch(function(error){
           logger.log('error', error);
        });
    requestDor()
        .then(parseDor)
        .then(pushDor)
        .catch(function(error){
            logger.log('error', error);
        });
}

exports.update=_update;
let schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0,59,5);
schedule.scheduleJob(rule, function() {
    logger.log('info', 'cronjob start update');
    _update();
});

