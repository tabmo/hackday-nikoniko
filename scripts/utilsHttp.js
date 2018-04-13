var CustomHttpService = require('./customHttpService')

var UtilsHttp = function(robot) {
  this.customHttpService = new CustomHttpService(robot)

  this.airTableUrl = 'https://api.airtable.com/v0/appDrZAT5gWrRGi6X/'
  this.abonnementsTableUrl = this.airTableUrl + 'Abonnements'
  this.nikoNikoTableUrl = this.airTableUrl + 'NikoNiko'
  this.eventsTableUrl = this.airTableUrl + 'Event%20list'
}

/**********************
 *    Subscription    *
 *********************/

UtilsHttp.prototype.getAllSubscribtions = function(callback) {
  this.customHttpService.get(this.abonnementsTableUrl + '?maxRecords=100', callback)
}

UtilsHttp.prototype.addAbonnement = function(data, callback) {
  this.customHttpService.post(this.abonnementsTableUrl, data, callback)
}

UtilsHttp.prototype.removeAbonnement = function(subscriberId, callback) {
  this.customHttpService.delete(this.abonnementsTableUrl + '/' + subscriberId, callback)
}

/**********************
 *        Events       *
 *********************/
UtilsHttp.prototype.addEvent = function(data, callback) {
  this.customHttpService.post(this.eventsTableUrl, data, callback)
}

UtilsHttp.prototype.getAllEvents = function(callback) {
  this.customHttpService.get(this.eventsTableUrl, callback)
}

UtilsHttp.prototype.getEventBySearch= function(eventName, callback) {
  console.log("hello");

  this.customHttpService.get(this.eventsTableUrl +"?filterByFormula=SEARCH('" +  eventName + "',event)", callback)
}

UtilsHttp.prototype.patchMoodLine = function(data, id, callback ){
  this.customHttpService.patch(this.eventsTableUrl + '/' + id, data, callback)
}


/**********************
 *        Stats       *
 *********************/

UtilsHttp.prototype.getMoodLineForDate = function(date, callback) {
  this.customHttpService.get(this.nikoNikoTableUrl + "?filterByFormula=IS_SAME({Date},'" + date + "')", callback)
}

// TODO prendre en compte une date dynamique
UtilsHttp.prototype.getTrendsStats = function(date, callback) {
  this.customHttpService.get(
    this.nikoNikoTableUrl + "?maxRecords=100&" +
      "filterByFormula=AND(OR(IS_AFTER({Date},'" + date +
      "'),IS_SAME({Date},'" + date + "')),IS_BEFORE({Date},'"+ date + "'))",
    callback)
}

module.exports = UtilsHttp;
