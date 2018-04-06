/**
 * Description:
 *    TODO
 #
 # Commands:
 #   niko test - affiche Bonjour !
 #   inscrit moi - Pour recevoir la question quotidienne `Comment s'est passé cette journée ?`
 #   désinscrit moi - Pour ne plus recevoir la question quotidienne `Comment s'est passé cette journée ?`
 #   trends - Affiche la tendance de l'humeur
 */

var moodQuestionFile = require('./moodMessageQuestion.json')
var UtilsHttp = require('./utilsHttp')
var SubscribersService = require('./subscribersService')
var StatsUtils = require('./statsUtils')

const path = require('path');
const fs = require('fs');
var mime = require('mime');

const serveFile = filePath => (req, res) => {
  const fullPath = path.join(__dirname, filePath);
  fs.readFile(fullPath, {encoding: 'utf-8'}, function(err, data){
    if (!err) {
      res.writeHead(200, {'Content-Type': mime.lookup(fullPath)});
      res.write(data);
      res.end();
    } else {
      console.log(err);
    }
  });
};

module.exports = function(robot) {

robot.router.get('/', serveFile('../index.html'));

  var messageSend = false;
  var utilHttp = new UtilsHttp(robot)
  var statsUtils = new StatsUtils()

  setInterval( function() {
    var date = new Date();
    if (!messageSend && date.getDay() !== 0 && date.getDay() !== 6 && date.getHours() === 12) {

      utilHttp.getAllSubscribtions(function(err, response, body) {
        var subscribers = SubscribersService.parseSubscribers(body)
        subscribers.forEach(function(roomId) {
          if (roomId.startsWith('D')) { // id of a direct message
            robot.messageRoom(roomId, moodQuestionFile)
          }
        })

      })
      messageSend = true;
    }
  }, 1000)

  robot.respond(/day/i, function(res) {
    date = new Date()
    today = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate()
    utilHttp.getMoodLineForDate(today, function(err, response, body) {
      records = JSON.parse(body).records[0]
      total = records.fields["1"] + records.fields["2"] + records.fields["3"] + records.fields["4"] + records.fields["5"]
      chartUrl = "https://image-charts.com/chart?cht=pd&chd=t%3A"
        + records.fields["1"] +"%2C"
        + records.fields["2"] +"%2C"
        + records.fields["3"] +"%2C"
        + records.fields["4"] +"%2C"
        + records.fields["5"] +"&chof=.png&chs=800x300&chdl=Pas%20bien%7CBof%7CMoyen%7CBien%7CTr%C3%A8s%20bien&chdls=000000&chco=F56991%2CFF9F80%2CFFC48C%2CD1F2A5%2CEFFAB4&chtt=Humeur%20du%20jour&chdlp=b&chf=bg%2Cs%2CFFFFFF&chbh=10&chli="
        + total + "%20Membres&icwt=false"
      res.reply(chartUrl)
    })

  });

  robot.respond(/inscrit moi/i, function(conv) {
    utilHttp.getAllSubscribtions(function(err, response, body) {
      var subscribers = SubscribersService.parseSubscribers(body)
      var roomId = conv.message.user.room

      if(!subscribers.includes(roomId)) {
        var data = JSON.stringify({ fields : { 'Handle': roomId } })
        utilHttp.addAbonnement(data, function() {
          conv.reply("Inscription :white_check_mark: ! Rendez-vous chaque jour à 16h00 !")
        })
      } else {
        conv.reply("Tu es déjà inscrit :wink: !")
      }
    })
  });

  robot.respond(/désinscrit moi/i, function(conv) {
    utilHttp.getAllSubscribtions(function(err, response, body) {
      var subscribers = SubscribersService.parseSubscribers(body)
      var roomId = conv.message.user.room
      var subscriber = SubscribersService.getSubscriberByRoomId(body,roomId)

      if(subscribers.includes(roomId)) {
        utilHttp.removeAbonnement(subscriber.id, function(){
          conv.reply("Je ne t'embêterai plus ...  c'est promis ! Si tu changes d'avis, écris moi simplement `inscrit moi` !")
        })
      } else {
        conv.reply("Tu n'es pas inscrit !")
      }
    })
  })

  robot.respond(/Ajoute l'event (.*)/i, function(conv) {
    var newEvent = conv.match[1]
    var data = JSON.stringify({ fields : { 'Event': newEvent } })
    utilHttp.addEvent(data, function() {
      conv.reply("Event ajouté à la liste! Si l'évènement a lieu aujourd'hui écrire: `Aujourd'hui c'est " + newEvent +"`")
    })
  })

  robot.respond(/Liste moi les events/i, function(conv) {
    utilHttp.getAllEvents(function(err, response, body) {
      var records = JSON.parse(body).records
      var list = records.map(function(s) {
        return s.fields.Event
      })
      conv.reply(list + " Pour ajouter un nouvel évènement à la liste `Ajoute l'event myEvent`, pour définir l'évènement du jour `Aujourd'hui c'est myEvent`")
    })
  })

  robot.respond(/trends/i, function(res) {
    utilHttp.getTrendsStats(function(err, response, body) {
      var records = JSON.parse(body).records
      statsUtils.trends(records).then(function(r) {
        res.reply(r)
      })
    })
  })


robot.respond(/Aujourd'hui c'est (.*)/i, function(conv) {
  var eventName = conv.match[1]
  var eventId
  utilHttp.getEventBySearch(eventName, function(err, response, body){
    eventId = JSON.parse(body).records[0].id
    date = new Date()
    today = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate()
    utilHttp.getMoodLineForDate(today, function(err, response, body){
      var dayId = JSON.parse(body).records[0].id
      var eventsOfDay = JSON.parse(body).records[0].fields.Event
      if(!eventsOfDay){
        eventsOfDay= [];
      }
      eventsOfDay.push(eventId)
      var data = JSON.stringify({ fields: { 'Event': eventsOfDay } })
      utilHttp.patchMoodLine(data, dayId, function(err, response, body) {
          conv.reply(eventName +" enregistré pour aujourd'hui ! ")
      })
    })
  })
})

}