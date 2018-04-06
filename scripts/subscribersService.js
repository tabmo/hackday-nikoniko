var SubscribersService = function() {};

SubscribersService.parseSubscribers = function(body) {
  var records = JSON.parse(body).records
  return records.map(function(s) {
    return s.fields.Handle
  })
}

SubscribersService.getSubscriberByRoomId = function(body, roomId) {
  var records = JSON.parse(body).records
  return records.find(function(s) {
    return s.fields.Handle === roomId
  })
}

module.exports = SubscribersService
