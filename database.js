/**
 * Created by md98 on 17. 7. 26.
 */

// TODO: database.js 에 getDB, setDBTABLE, getDBTABLE 등 구현하고 scrapping.js 와 slack.js와 연동하기
ictdb='db/ict.db';

logger = require('./logger.js').logger('log/database.log');
function setDBTable(dataBase){
    return new Promise(function(resolve){
        logger.log('info', 'start setDBTable');
        let fs = require('fs');
        dataBase.serialize(function () {
            data = fs.readFileSync('db.sql', 'utf-8');
            dataBase.run(data);
        });
        resolve();
    });
}


function _getDB(databaseName){
    return new Promise(function(resolve) {
        logger.log('info', 'start getDB');
        let sqlite3 = require('sqlite3').verbose();
        let dataBase = new sqlite3.Database(databaseName);
        setDBTable(dataBase).then(function(){
            resolve(dataBase);
        });
    });
}


exports.getDB = function(databaseName) {
    return _getDB(databaseName);
};


exports.getIctPostsData = function(){
    logger.log('info', 'getIctPostsData start');

    let datas =[];
    return new Promise(function(resolve) {
        _getDB(ictdb).then(function (dataBase) {
            dataBase.serialize(function () {
                dataBase.each('select * from ictPosts where readCheck=0;', function (error, row) {
                    let data = {
                        idx: row.idx,
                        title: row.Title,
                        date: row.recent_date,
                        readcheck: row.readCheck
                    };
                    datas.push(data);
                    dataBase.run('update ictPosts set readCheck=1 where readCheck=0;')
                }, function () {
                    logger.log('info', 'getIctPostsData end');
                    resolve(datas);
                });
            });
        });
    });
};

exports.insertIctPostsData = function(database, value){
    logger.log('info', 'insertIctPostsData start');

    database.run('INSERT OR IGNORE INTO ictPosts(idx, title, recent_date, readCheck) VALUES(' + value['number'] + ',\"' + value['title'] + '\",\"' + value['date'] + '\",0);');

    logger.log('info', 'insertIctPostsData end');
};
