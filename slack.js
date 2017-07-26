/**
 * Created by md98 on 17. 7. 26.
 */

//Logger
var winston = require('winston');
var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)({
            timestamp: true
        }),
        new (winston.transports.File)({
            timestamp: 'true',
            filename: 'log/slack.log'
        })
    ]
});
logger.log('info', '==============Slack.js logging start=================');

function DBload(){
    return new Promise(function(resolve, reject){
        let sqlite3 = require('sqlite3').verbose();
        let db = new sqlite3.Database('data.db');
        let posts = [];
        db.serialize(function () {
            fs.readFile('db.sql', 'utf-8', function (error, data) {
                //console.log(data);
                if (error) {
                    logger.log('error', error);
                    reject(error);
                    throw error;
                }
                db.run(data);
            });

        });


        resolve(posts);
    });
}



var slack = require('@slack/client');
var RtmClient = slack.RtmClient;

var fs = require('fs');
var token = fs.readFileSync('token.txt','utf-8');
logger.log('info', 'Get Token from token.txt');
var rtm = new RtmClient(token, {logLevel: 'debug'});
logger.log('info', 'rtm start');
rtm.start();

var CLIENT_EVENTS = slack.CLIENT_EVENTS;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData){
   logger.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

var RTM_EVENTS = slack.RTM_EVENTS;
//Slack 팀으로부터의 모든 메시지 받기
rtm.on(RTM_EVENTS.MESSAGE, function(message){
    //메시지 받았을 때 수행할 작업을 여기에 작성합니다.
    if(message.text=='!ict'){
        rtm.sendMessage('')
    }
});

//팀에서 채널이 새로 생성 되었다는 메시지 받기.
rtm.on(RTM_EVENTS.CHANNEL_CREATED, function (message){
});



logger.log('info', '==============Slack.js File End=====================');
