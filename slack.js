/**
 * Created by md98 on 17. 7. 26.
 */

//Logger
let logger = require('./logger.js').logger('log/slack.log');


let RtmClient = require('@slack/client').RtmClient;
let CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

let fs = require('fs');
let token = fs.readFileSync('token.txt','utf-8');
logger.log('info', 'Get Token from token.txt');
let rtm = new RtmClient(token);




rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData){
   logger.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

let RTM_EVENTS = require('@slack/client').RTM_EVENTS;
//Slack 팀으로부터의 모든 메시지 받기
rtm.on(RTM_EVENTS.MESSAGE, function(message){
    //메시지 받았을 때 수행할 작업을 여기에 작성합니다.
    if(message.text==='!ict') {
        require('./database.js').getIctPostsData().then(function(datas){
            for(dataidx in datas) {
                rtm.sendMessage(datas[dataidx].title+datas[dataidx].date, message.channel);
            }
        });
    }
});

logger.log('info', 'rtm start');
rtm.start();
