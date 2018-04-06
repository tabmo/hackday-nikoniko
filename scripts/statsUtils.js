var Spearman = require('spearman-rho')

var StatsUtils = function() {}

StatsUtils.prototype.sortDates = function(dates) {
  return dates.sort(function(a,b){
    return new Date(a) - new Date(b)
  })
}

StatsUtils.prototype.getSortedDates = function(records) {
  var unsortedDates = records.map(function(r) {
    return r.fields.Date
  })
  return this.sortDates(unsortedDates)
}

StatsUtils.prototype.getMeans = function(records) {
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

StatsUtils.prototype.range = function(start, end) {
  var foo = [];
  for (var i = start; i <= end; i++) {
    foo.push(i);
  }
  return foo;
}

StatsUtils.prototype.trends = function(records) {
  var means = this.getMeans(records)
  var trend = []
  var dates = this.getSortedDates(records)

  dates.forEach(function(date) {
    trend.push(means[date])
  })

  var spearman = new Spearman(this.range(0, trend.length - 1), trend)

  return spearman.calc()
    .then(function(rho) {
      if (rho < 0) {
        return 'Bad vibes :disapointed:'
      } else {
        return 'OK, good vibes!  :tada:'
      }

    }).catch(function(err) {console.error(err)})
}

module.exports = StatsUtils;
