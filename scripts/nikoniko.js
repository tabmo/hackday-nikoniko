/**
 * Description:
 *    TODO
 #
 # Commands:
 #   niko test - affiche Bonjour !
 #   hubot
 #   hubot
 */

module.exports = function(robot) {

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

};