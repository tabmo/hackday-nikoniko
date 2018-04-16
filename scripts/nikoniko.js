// Description:
//   Generates help commands for Hubot.
//
// Commands:
//   hubot Humeur du jour - Pour afficher un camembert représentant le bien être du jour de l'équipe
//   hubot Tendance <nbJours> - afficher la tendance du bien être de l'équipe (par défaut calculé sur les 7 derniers jours, sinon fait par rapport à <nbJours>)
//   hubot inscris moi - Pour s'abonner et recevoir la question quotidienne
//   hubot désinscris moi - Pour ne plus recevoir la question quotidienne
//   hubot Liste les events - Pour afficher les évènements créés
//   hubot Aujourd'hui c'est <yourEvent> - Pour associer l'évènement <yourEvent> à aujourd'hui
//   hubot Ajoute l'event - Pour créer un nouvel évènement qui pourra être associé à une journée
//   hubot Mood for <event> - pour afficher un camenbert représentant la moyenne de bien être pour l'évenement donné


var moodQuestionFile = require('./moodMessageQuestion.json')
var UtilsHttp = require('./utilsHttp')
var SubscribersService = require('./subscribersService')
var StatsUtils = require('./statsUtils')
var DateUtils = require('./dateUtils')
const path = require('path');
const fs = require('fs');
var mime = require('mime');

const serveFile = filePath => (req, res) => {
  const fullPath = path.join(__dirname, filePath);
  fs.readFile(fullPath, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
      res.writeHead(200, { 'Content-Type': mime.lookup(fullPath) });
      res.write(data);
      res.end();
    } else {
      console.log(err);
    }
  });
};

module.exports = function (robot) {

  robot.router.get('/', serveFile('../index.html'));

  var messageSend = false;
  var utilHttp = new UtilsHttp(robot)
  var statsUtils = new StatsUtils()
  var dateUtils = new DateUtils()

  setInterval(function () {
    var date = new Date();
    if (!messageSend && date.getDay() !== 0 && date.getDay() !== 6 && date.getHours() === 14) {

      utilHttp.getAllSubscribtions(function (err, response, body) {
        var subscribers = SubscribersService.parseSubscribers(body)
        subscribers.forEach(function (roomId) {
          if (roomId.startsWith('D')) { // id of a direct message
            robot.messageRoom(roomId, moodQuestionFile)
          }
        })

      })
      messageSend = true;
    }
  }, 1000)

  robot.respond(/Humeur du jour/i, function (res) {
    today = dateUtils.formatNow()
    utilHttp.getMoodLineForDate(today, function (err, response, body) {
      records = JSON.parse(body).records[0]
      total = records.fields["1"] + records.fields["2"] + records.fields["3"] + records.fields["4"] + records.fields["5"]
      chartUrl = "https://image-charts.com/chart?cht=pd&chd=t%3A"
        + records.fields["1"] + "%2C"
        + records.fields["2"] + "%2C"
        + records.fields["3"] + "%2C"
        + records.fields["4"] + "%2C"
        + records.fields["5"] + "&chof=.png&chs=800x300&chdl=Pas%20bien%7CBof%7CMoyen%7CBien%7CTr%C3%A8s%20bien&chdls=000000&chco=F56991%2CFF9F80%2CFFC48C%2CD1F2A5%2CEFFAB4&chtt=Humeur%20du%20jour&chdlp=b&chf=bg%2Cs%2CFFFFFF&chbh=10&chli="
        + total + "%20Membres&icwt=false"
      res.reply(chartUrl)
    })

  });

  robot.respond(/inscris moi/i, function (conv) {
    utilHttp.getAllSubscribtions(function (err, response, body) {
      var subscribers = SubscribersService.parseSubscribers(body)
      var roomId = conv.message.user.room

      if (!subscribers.includes(roomId)) {
        var data = JSON.stringify({ fields: { 'Handle': roomId } })
        utilHttp.addAbonnement(data, function () {
          conv.reply("Inscription :white_check_mark: ! Rendez-vous chaque jour à 16h00 !")
        })
      } else {
        conv.reply("Tu es déjà inscrit :wink: !")
      }
    })
  });

  robot.respond(/désinscris moi/i, function (conv) {
    utilHttp.getAllSubscribtions(function (err, response, body) {
      var subscribers = SubscribersService.parseSubscribers(body)
      var roomId = conv.message.user.room
      var subscriber = SubscribersService.getSubscriberByRoomId(body, roomId)

      if (subscribers.includes(roomId)) {
        utilHttp.removeAbonnement(subscriber.id, function () {
          conv.reply("Je ne t'embêterai plus ...  c'est promis ! Si tu changes d'avis, écris moi simplement `inscris moi` !")
        })
      } else {
        conv.reply("Tu n'es pas inscrit !")
      }
    })
  })

  robot.respond(/Ajoute l'event (.*)/i, function (conv) {
    var newEvent = conv.match[1].toLowerCase()
    var data = JSON.stringify({ fields: { 'Event': newEvent } })
    utilHttp.addEvent(data, function () {
      conv.reply("Event ajouté à la liste ! Si l'évènement a lieu aujourd'hui tapez: `Aujourd'hui c'est " + newEvent + "`")
    })
  })

  robot.respond(/Liste les events/i, function (conv) {
    utilHttp.getAllEvents(function (err, response, body) {
      var records = JSON.parse(body).records
      var list = records.map(function (s) {
        return `\n${s.fields.Event}`
      })
      console.log('list: ', list);
      conv.reply(list + "\n Pour ajouter un nouvel évènement à la liste `Ajoute l'event myEvent`, pour définir l'évènement du jour `Aujourd'hui c'est myEvent`")
    })
  })

  robot.respond(/Tendance\b(.*)/i, function (conv) {
    var nbDaysForTrends = conv.match[1] || 7

    if (isNaN(nbDaysForTrends)) {
      return conv.reply("Vous devez saisir un chiffre après la commande `Tendance` (ou ne rien mettre - par défaut le calcul se fait sur 7j). (voir help)")
    }

    var date = new Date()
    date.setDate(date.getDate() - nbDaysForTrends)

    utilHttp.getTrendsStats(dateUtils.formatDate(date), function (err, response, body) {
      var records = JSON.parse(body).records
      statsUtils.trends(records).then(function (r) {
        conv.reply(r)
      })
    })
  })


  robot.respond(/Aujourd'hui c'est (.*)/i, function (conv) {
    var eventName = conv.match[1].toLowerCase()
    utilHttp.getEventBySearch(eventName, function (err, response, body) {
      var eventRecord = JSON.parse(body).records[0]
      if (eventRecord === undefined) {
        return conv.reply("L'event : \"" + eventName + "\" n'existe pas, pour ajouter un nouvel event à la liste demandez : `Ajoute l'event myEvent`, utilisez `Liste les events` pour lister les events existants")
      }
      var eventId = eventRecord.id
      var today = dateUtils.formatNow()
      utilHttp.getMoodLineForDate(today, function (err, response, body) {
        var firstRecord = JSON.parse(body).records[0]
        if (firstRecord === undefined) {
          utilHttp.setNewMoodLine(JSON.stringify({
            fields: {
              'Date': today,
              '1': 0,
              '2': 0,
              '3': 0,
              '4': 0,
              '5': 0
            }
          }), function (err, response, body) {
            var dayId = JSON.parse(body).id
            var data = JSON.stringify({ fields: { 'Event': [eventId] } })
            utilHttp.patchMoodLine(data, dayId, function () {
              conv.reply(eventName + " enregistré pour aujourd'hui ! ")
            })
          })
        } else {
          var dayId = firstRecord.id
          var eventsOfDay = JSON.parse(body).records[0].fields.Event
          if (!eventsOfDay) {
            eventsOfDay = [];
          }
          eventsOfDay.push(eventId)
          var data = JSON.stringify({ fields: { 'Event': eventsOfDay } })
          utilHttp.patchMoodLine(data, dayId, function () {
            conv.reply(eventName + " enregistré pour aujourd'hui ! ")
          })
        }
      })
    })
  })


robot.respond(/Mood for (.*)/i, function (res) {
  var eventName = res.match[1].toLowerCase()
  utilHttp.getEventBySearch(eventName,function (err, response, body) {
    try {
      event = JSON.parse(body).records[0]
      if (event.fields.NikoNiko) {
        utilHttp.getMoodLineForEvent(eventName, function (err, response, body){
          text = encodeURIComponent(`Humeur de l'event ${event.fields.Event}`)
          records = JSON.parse(body).records
          var one = two = three = four = five = 0;
          records.forEach(r => {
            one += r.fields["1"]
            two += r.fields["2"]
            three += r.fields["3"]
            four += r.fields["4"]
            five += r.fields["5"]
          })
          total = one + two + three + four + five
          chartUrl = "https://image-charts.com/chart?cht=pd&chd=t%3A"
            + one/records.length + "%2C"
            + two/records.length + "%2C"
            + three/records.length + "%2C"
            + four/records.length + "%2C"
            + five/records.length + `&chof=.png&chs=800x300&chdl=Pas%20bien%7CBof%7CMoyen%7CBien%7CTr%C3%A8s%20bien&chdls=000000&chco=929292%2CFFB632%2CF5E872%2CE8E8E8%2CFF9300&chtt=${text}&chdlp=b&chf=bg%2Cs%2CFFFFFF&chbh=10&chli=`
            + total + "%20Votes&icwt=false"
          res.reply(chartUrl)
            })
      } else {
        res.reply('Pas de réponse pour cet évenement')
      }
    }
    catch (err){
      res.reply("Cet évenement n'existe pas !")
    }
  })
})

}

