/**
 * Created by md98 on 17. 7. 26.
 */
//TODO: DB close 구현
/* ==================================== Require Declaration=============================== */
let fs = require('fs');
let slack = require('@slack/client');
let logger = require('./logger.js').logger('log/slack.log');
let databaseJs = require('./database.js');
let ictDB = 'db/ict.db';
let cseDB = 'db/cse.db';
let commands = {
    list: [],
    registerCommand: function (commandArr, response, func=function(){}) {
        this.list.push({
            commandText: commandArr,
            responseText: response,
            proc: func
        });
    },
    getCommandString: function(){
      let commandstr='';
      for(let i = 0; i<this.list.length; i++){
          commandstr+=this.list[i].commandText[0];
          if(this.list[i].commandText.length>1) {
              commandstr += '(';
              for (let j = 1; j < this.list[i].commandText.length; j++) {
                  commandstr += this.list[i].commandText[j] + ' ';
              }
              commandstr += ')';
          }
          commandstr += '\n\n';
      }
      return commandstr;
    }
};
/* ======================================================================================= */

/* ===================================== Token =========================================== */
let token = fs.readFileSync('token.txt','utf-8');
let RTM_EVENTS = require('@slack/client').RTM_EVENTS;
/* ======================================================================================= */

/* ==================================== Slack RTM ========================================= */
let RtmClient = slack.RtmClient;
let CLIENT_EVENTS = slack.CLIENT_EVENTS;
let rtm = new RtmClient(token);
let generalChannelId;
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData){
    for (const channel of rtmStartData.channels) {
        if(channel.is_member && channel.name ==='general') { generalChannelId = channel.id}
    }
    logger.log('info',`Logged in as ${rtmStartData.self.name} \
of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});
rtm.on(RTM_EVENTS.MESSAGE, function(message){
    //메시지 받았을 때 수행할 작업을 여기에 작성합니다.
    let isUnknownMessage = true;
    logger.log('info', `${message.channel} : ${message.user} : ${message.text}`);
    commands.list.forEach(function(command){
        if(command.commandText.includes(message.text)){
            rtm.sendMessage(command.responseText, message.channel);
            command.proc(message.channel);
            isUnknownMessage = false;
        }
    });
    if(isUnknownMessage){
        rtm.sendMessage('무슨말인지 잘 모르겠어요~ㅠㅠ\n', message.channel);
    }
});
logger.log('info', 'rtm start');
rtm.start();
/* ======================================================================================== */

/* ===================================== Schedule ========================================= */


let schedule = require('node-schedule');
let rule = new schedule.RecurrenceRule();
rule.minute = new schedule.Range(0,59,10);
schedule.scheduleJob(rule, function() {
    logger.log('info', 'cronjob start');
    require('./scrapping').update();
    databaseJs.getDB(ictDB)
        .then(databaseJs.getPostDatas)
        .then(function (postDatas) {
            if (postDatas.length !== 0) {
                rtm.sendMessage(ictText, generalChannelId);
                sendDataToChannel(postDatas, generalChannelId);
            }
        });
    databaseJs.getDB(cseDB)
        .then(databaseJs.getPostDatas)
        .then(function (postDatas) {
            if (postDatas.length !== 0) {
                rtm.sendMessage(cseText, generalChannelId);
                sendDataToChannel(postDatas, generalChannelId);
            }
        });
});

/* ========================================================================================= */


/* ==================================== Command Lists ==================================== */
commands.registerCommand(['!rualive', '!rualive?', '!areyoualive', '!areyoualive?'], '엄마 나 아직 살아있어요!');
commands.registerCommand(['hello', 'hi', '안녕'],
    '안녕하세요! 저는 공지봇이에요. 무엇을 도와드릴까요?\n' +
    '더 궁금하시면 !help를 쳐보세요');
commands.registerCommand(['!ict'], 'ict라고 했어요!', function(channel){
    let noIctText = '아쉽게도 ict새소식이 없어요. ㅠ\n업데이트 해보시려면 !update라고 말해줘요.';
    let ictText = '오늘의 ict새소식이에요!\n칭찬해주세요~!';
    databaseJs.getDB(ictDB)
        .then(databaseJs.getPostDatas)
        .then(function (postDatas) {
            if (postDatas.length === 0) {
                rtm.sendMessage(noIctText, channel);
            }
            else {
                rtm.sendMessage(ictText, channel);
                sendDataToChannel(postDatas, channel);
            }
        });
});
commands.registerCommand(['!cse'], 'cse라고 했어요!', function(channel){
    let noCseText = '아쉽게도 cse새소식이 없어요. ㅠ\n업데이트 해보시려면 !update라고 말해줘요.';
    let cseText = '오늘의 cse새소식이에요!\n칭찬해주세요~!';
    databaseJs.getDB(cseDB)
        .then(databaseJs.getPostDatas)
        .then(function (postDatas) {
            if (postDatas.length === 0) {
                rtm.sendMessage(noCseText, channel);
            }
            else {
                rtm.sendMessage(cseText,channel);
                sendDataToChannel(postDatas, channel);
            }
        });
});
commands.registerCommand(['!update'],
    '업데이트~ 업데이트~ 업~데~이~트~'+
    '업데이트에는 조금 시간이 걸려요\n', function(){
    require('./scrapping.js').update();});
commands.registerCommand(['!help'], '현재 가능한 명령은 (괄호 안은 동일 명령)\n' +
    commands.getCommandString()+
    '\n가 있어요');
function sendDataToChannel(datas, channel){
    datas.forEach(function(data) {
        rtm.sendMessage(data.title + data.date, channel);
    });
}
/* ======================================================================================== */
