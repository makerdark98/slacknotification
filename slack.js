/**
 * Created by md98 on 17. 7. 26.
 */

//Logger
let logger = require('./logger.js').logger('log/slack.log');
let databasejs = require('./database.js');


let RtmClient = require('@slack/client').RtmClient;
let CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

let fs = require('fs');
let token = fs.readFileSync('token.txt','utf-8');
logger.log('info', 'Get Token from token.txt');
let rtm = new RtmClient(token);



let c_general;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData){
    for (const c of rtmStartData.channels) {
        if(c.is_member && c.name ==='general') { c_general = c.id}
    }
    logger.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

let RTM_EVENTS = require('@slack/client').RTM_EVENTS;
//Slack 팀으로부터의 모든 메시지 받기
//메시지 text
let rualive = '엄마 나 아직 살아있어요!';
let logtext = '엄마 여기 로그파일이에요!\n\n';
let noicttext = '아쉽게도 ict새소식이 없어요. ㅠ\n업데이트 해보시려면 !update라고 말해줘요.';
let icttext = '오늘의 ict새소식이에요!\n칭찬해주세요~!';
let nocsetext = '아쉽게도 cse새소식이 없어요. ㅠ\n업데이트 해보시려면 !update라고 말해줘요.';
let csetext = '오늘의 cse새소식이에요!\n칭찬해주세요~!';
let updatetext = '업데이트~ 업데이트~ 업~데~이~트~ 업데이트!!!\n';
//
rtm.on(RTM_EVENTS.MESSAGE, function(message){
    //메시지 받았을 때 수행할 작업을 여기에 작성합니다.
    if (message.text==='!rualive?'){
        rtm.sendMessage(rualive, message.channel);
    }
    else if(message.log=='!log'){
        let log=fs.readFileSync('log/slack.log');
        rtm.sendMessage(logtext, message.channel);
        rtm.sendMessage(log);
    }
    
    else if(message.text==='!ict') {
        databasejs.getDB('db/ict.db')
            .then(databasejs.getPostsData)
            .then(function (datas) {
                if (datas.length === 0) {
                    rtm.sendMessage(noicttext, message.channel);
                }
                else {
                    rtm.sendMessage(icttext, message.channel);
                    for (dataidx in datas) {
                        rtm.sendMessage(datas[dataidx].title + datas[dataidx].date, message.channel);
                    }
                }
            });
    }
    else if(message.text==='!cse') {
        databasejs.getDB('db/cse.db')
            .then(databasejs.getPostsData)
            .then(function (datas) {
                if (datas.length === 0) {
                    rtm.sendMessage(nocsetext, message.channel);
                }
                else {
                    rtm.sendMessage(csetext, message.channel);
                    for (dataidx in datas) {
                        rtm.sendMessage(datas[dataidx].title + datas[dataidx].date, message.channel);
                    }
                }
            });
    }
    else if(message.text==='!update'){
        require('./scrapping.js').update();
        rtm.sendMessage(updatetext,message.channel);
    }
});

logger.log('info', 'rtm start');
rtm.start();

let schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0,59,10);
schedule.scheduleJob(rule, function() {
    logger.log('info', 'cronjob start');
    require('./scrapping').update();
    databasejs.getDB('db/ict.db')
        .then(databasejs.getPostsData)
        .then(function (datas) {
            if (datas.length !== 0) {
                rtm.sendMessage(icttext, c_general);
                for (dataidx in datas) {
                    rtm.sendMessage(datas[dataidx].title + datas[dataidx].date, c_general);
                }
            }
        });
    databasejs.getDB('db/cse.db')
        .then(databasejs.getPostsData)
        .then(function (datas) {
            if (datas.length !== 0) {
                rtm.sendMessage(csetext, c_general);
                for (dataidx in datas) {
                    rtm.sendMessage(datas[dataidx].title + datas[dataidx].date, c_general);
                }
            }
        });
});

