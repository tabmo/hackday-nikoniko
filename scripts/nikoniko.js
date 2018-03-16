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
const Spearman = require('spearman-rho')

module.exports = function(robot) {


  var messageSend = false;

  var getAllSubscribtions = function(callback) {
    robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Abonnements?maxRecords=100")
      .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
      .header('Accept', 'application/json')
      .get()(callback)
  }

  var parseSubscribers = function(body) {
    var records = JSON.parse(body).records
    return records.map(function(s) {
      return s.fields.Handle
    })
  }

  var getSubscriberByRoomId = function(body, roomId) {
    var records = JSON.parse(body).records
    return records.find(function(s) {
      return s.fields.Handle === roomId
    })
  }

  setInterval( function() {
    var date = new Date();
    if (!messageSend && date.getDay() !== 0 && date.getDay() !== 6 && date.getHours() === 16) {

      getAllSubscribtions(function(err, response, body) {
        var subscribers = parseSubscribers(body)
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
    response = robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/NikoNiko?filterByFormula=IS_SAME({Date},'" + today + "')")
        .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
        .header('Accept', 'application/json')
        .get()

    response(function(err, response, body) {
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
    getAllSubscribtions(function(err, response, body) {
      var subscribers = parseSubscribers(body)
      var roomId = conv.message.user.room

      if(!subscribers.includes(roomId)) {
        var data = JSON.stringify({ fields : { 'Handle': roomId } })
        robot.http('https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Abonnements')
          .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
          .header('Content-Type', 'application/json')
          .post(data)(function(err,response, body){
            conv.reply("Inscription :white_check_mark: ! Rendez-vous chaque jour à 16h00 !")
          })
      } else {
        conv.reply("Tu es déjà inscrit :wink: !")
      }
    })
  });

  robot.respond(/désinscrit moi/i, function(conv) {
    getAllSubscribtions(function(err, response, body) {
      var subscribers = parseSubscribers(body)
      var roomId = conv.message.user.room
      var suscriber = getSubscriberByRoomId(body,roomId);
      console.log(suscriber.id, "susb")

      if(subscribers.includes(roomId)) {
        var data = JSON.stringify({ fields : { 'Handle': roomId } })
        robot.http('https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Abonnements/' + suscriber.id)
          .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
          .header('Content-Type', 'application/json')
          .delete()(function(err,response, body){
            conv.reply("Je ne t'embêterai plus ...  c'est promis ! Si tu changes d'avis, écris moi simplement `inscrit moi` !")
          })
      } else {
        conv.reply("Tu n'est pas inscrit !")
      }
    })
  });



  var sortDates = function(dates) {
    return dates.sort(function(a,b){
      return new Date(a) - new Date(b)
    })
  }

  var getDates = function(records) {
    var unsortedDates = records.map(function(r) {
      return r.fields.Date
    })
    return sortDates(unsortedDates)
  }

  var getMeans = function(records) {
    var moodTable = ["1", "2", "3", "4", "5"]
    var means = {}
    records.forEach((function(rec) {
      var sum_rec = 0
      var nrec = 0
      moodTable.forEach(function(moodValue) {
        nrec += rec.fields[moodValue]
        sum_rec += parseFloat(moodValue) * rec.fields[moodValue]
      })
      means[rec.fields.Date] = sum_rec / parseFloat(nrec)
    }))
    return means
  }

  function range(start, end) {
    var foo = [];
    for (var i = start; i <= end; i++) {
      foo.push(i);
    }
    return foo;
  }

  var trends = function(records) {
    var means = getMeans(records)
    var trend = []
    var dates = getDates(records)

    dates.forEach(function(date) {
      trend.push(means[date])
    })

    const spearman = new Spearman(range(0, trend.length - 1), trend)

    return spearman.calc()
      .then(function(rho) {
        if (rho < 0) {
          return 'Bad vibes :disapointed:'
        } else {
          return 'OK, good vibes!  :tada:'
        }

      }).catch(function(err) {console.error(err)})
  }

  robot.respond(/trends/i, function(res) {

    robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/NikoNiko?maxRecords=100&filterByFormula=AND(OR(IS_AFTER({Date},'2018-03-01'),IS_SAME({Date},'2018-03-11')),IS_BEFORE({Date},'2018-03-18'))")
      .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
      .header('Accept', 'application/json')
      .get()(function(err, response, body) {
        var records = JSON.parse(body).records
        trends(records).then(function(r) {
          res.reply(r)
        })
      })
  })

}
