/**
 * Description:
 *    TODO
 #
 # Commands:
 #   niko test - affiche Bonjour !
 #   niko inscription - ajoute l'identifiant room dans la table inscription
 */

var moodQuestionFile = require('./moodMessageQuestion.json')

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

  setInterval( function() {
    var date = new Date();
    if (!messageSend && date.getDay() !== 0 && date.getDay() !== 6 && date.getHours() === 15) {

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


  robot.respond(/week/i, function(res) {
    date = new Date()
    today = date.getFullYear() + "-0" + (date.getMonth() + 1) + "-0" + date.getDate()
    response = robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/NikoNiko?filterByFormula=IS_SAME({Date},'" + today + "')")
        .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
        .header('Accept', 'application/json')
        .get()

    response(function(err, response, body) {
      records = JSON.parse(body).records[0]
      console.log(records.fields["1"])
      total = records.fields["1"] + records.fields["2"] + records.fields["3"] + records.fields["4"] + records.fields["5"]
      chartUrl = "https://image-charts.com/chart?cht=pd&chd=t%3A"
        + records.fields["1"] +"%2C"
        + records.fields["2"] +"%2C"
        + records.fields["3"] +"%2C"
        + records.fields["4"] +"%2C"
        + records.fields["5"] +"&chof=.png&chs=800x300&chdl=Pas%20bien%7CBof%7CMoyen%7CBien%7CTr%C3%A8s%20bien&chdls=000000&chco=F56991%2CFF9F80%2CFFC48C%2CD1F2A5%2CEFFAB4&chtt=Humeur%20du%20jour&chdlp=b&chf=bg%2Cs%2CFFFFFF&chbh=10&chli="
        + total + "%20Membres&icwt=false"
      res.reply(chartUrl)

      // curl -H "Authorization: Bearer keyNUv3Laq95pQOU7" "https://api.airtable.com/v0/appDrZAT5gWrRGi6X/NikoNiko?maxRecords=100&filterByFormula=AND(OR(IS_AFTER({Date},'2018-03-01'),IS_SAME({Date},'2018-03-01')),IS_BEFORE({Date},'2018-04-01'))" -v
    })

  });

  robot.respond(/inscription/i, function(res) {
    getAllSubscribtions(function(err, response, body) {
      var subscribers = parseSubscribers(body)
      var roomId = res.message.user.room

      if(!subscribers.includes(roomId)) {
        var data = JSON.stringify({ fields : { 'Handle': roomId } })
        robot.http('https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Abonnements')
          .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
          .header('Content-Type', 'application/json')
          .post(data)
      } else {
        res.reply("Tu es déjà inscrit :wink: !")
      }
    })

  });
}
