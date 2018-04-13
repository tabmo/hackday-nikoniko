var DateUtils = function () { }

DateUtils.prototype.formatDate = function(date) {
  const padding = n => n.toString(10).padStart(2, '0')
  return date.getFullYear() + "-" + padding(date.getMonth() + 1) + "-" + padding(date.getDate())
}

DateUtils.prototype.formatNow = function () {
  return this.formatDate(new Date())
}

module.exports = DateUtils;
