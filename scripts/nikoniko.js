/**
 * Description:
 *    TODO
 #
 # Commands:
 #   niko test - affiche Bonjour !
 #   niko inscription - ajoute l'identifiant room dans la table inscription
 */

module.exports = function(robot) {

  var messageSend = false;

  setInterval( function() {
    var date = new Date();
    if (!messageSend && date.getDay() !== 0 && date.getDay() !== 6 && date.getHours() === 10) {
      robot.messageRoom("@audrey", {
        "text": "Comment s'est passé cette journée ?",
        "attachments": [
          {
            "text": "",
            "callback_id": "nikoniko",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
              {
                "name":"excellent",
                "text": ":smile: Excellente journée",
                "type": "button",
                "style": "primary",
                "value": "4"
              },
              {
                "name":"good",
                "text": ":slightly_smiling_face: Bonne journée",
                "type": "button",
                "value": "3"
              },
              {
                "name":"indifferent",
                "text": ":neutral_face: Bof, journée moyenne",
                "type": "button",
                "value": "2"
              },
              {
                "name":"difficult",
                "text": ":slightly_frowning_face: Journée difficile",
                "type": "button",
                "value": "1"
              },
              {
                "name":"bad",
                "text": ":triumph: Mauvaise journée",
                "type": "button",
                "value": "0",
                "style":"danger"
              }
            ]
          }
        ]
      });

      robot.on('slack:msg_action:nikoniko', function(data, res) { console.log('tata') });

      messageSend = true;
    }
  }, 1000)

  robot.respond(/test/i, function(res) {
    response = robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/NikoNiko")
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
    })

  });

  robot.respond(/inscription/i, function(res) {
    response = robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Abonnements")
    .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
    .header('Accept', 'application/json')
    .get()

    response(function(err, response, body) {
      subscribers = JSON.parse(body).records
      var t = subscribers.map(function(s) {
        return s.fields.Handle
      })

    if(!t.includes(res.message.user.room)){
      room = JSON.stringify({ fields : { "Handle": res.message.user.room} })
      response = robot.http("https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Abonnements")
          .header('Authorization', 'Bearer keyNUv3Laq95pQOU7')
          .header('Content-Type', 'application/json')
          .post(room)

    } else {
      res.reply("Tu es déjà inscrit :wink: !")
    }
  })

  });
}
