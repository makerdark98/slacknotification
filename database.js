/**
 * Created by md98 on 17. 7. 26.
 */

logger = require('./logger.js').logger('log/database.log');
function setDBTable(dataBase){
    return new Promise(function(resolve){
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


exports.getPostDatas = function(database){
    let datas =[];
    return new Promise(function(resolve) {
            database.serialize(function () {
                database.each('select * from Posts where readCheck=0;', function (error, row) {
                    let data = {
                        idx: row.idx,
                        title: row.Title,
                        date: row.recent_date,
                        readcheck: row.readCheck
                    };
                    datas.push(data);
                    database.run('update Posts set readCheck=1 where readCheck=0;')
                }, function () {
                    resolve(datas);
                });
            });
    });
};

exports.insertPostsData = function(database, value){
    database.run('INSERT OR IGNORE INTO Posts(idx, title, recent_date, readCheck) VALUES('
        + value['number'] + ',\"'
        + value['title'] + '\",\"'
        + value['date'] + '\",0);'
    );
};
