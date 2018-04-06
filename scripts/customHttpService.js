var CustomHttpService = function(robot) {
  this.robot = robot
  this.authKey = 'Bearer keyNUv3Laq95pQOU7'
  this.contentType = 'application/json'
}

CustomHttpService.prototype.get = function(url, callback) {
  return this.robot.http(url)
    .header('Authorization', this.authKey)
    .header('Accept', this.contentType)
    .get()(callback)
}

CustomHttpService.prototype.post = function(url, data, callback) {
  return this.robot.http(url)
    .header('Authorization', this.authKey)
    .header('Content-Type', this.contentType)
    .post(data)(callback)
}

CustomHttpService.prototype.delete = function(url, callback) {
  return this.robot.http(url)
    .header('Authorization', this.authKey)
    .header('Content-Type', this.contentType)
    .delete()(callback)
}

module.exports = CustomHttpService
