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

sum = function(array) {
  var num = 0;
  for (var i = 0, l = array.length; i < l; i++) num += array[i];
  return num;
}

mean = function(array) {
  return sum(array) / array.length;
}

variance = function(array) {
  var m = mean(array);
  return mean(array.map(function(num) {
    return Math.pow(num - m, 2);
  }));
}

appendUri = function(array, uri, delimiter) {
  for (var i = 0; i < array.length; i++) {
    uri += array[i]
    if (i < array.length - 1) {
      uri += delimiter
    }
  }
  return uri
}

StatsUtils.prototype.trends = function(records) {
  var means = this.getMeans(records)
  var trend = []
  var dates = this.getSortedDates(records)

  dates.forEach(function(date) {
    trend.push(means[date])
  })

  var spearman = new Spearman(this.range(0, trend.length - 1), trend)

  var chartUri = "https://image-charts.com/chart?chs=999x300&chco=FE9A2E,AF3C3C,AF3C3C&cht=lc&chg=20,50&chf=bg,s,E6E6E6&chxt=x,y&chls=2|1,6,3|1,6,3|&chd=t:"
  chartUri = appendUri(spearman.Y, chartUri, ',')
  var ecarttype = Math.sqrt(variance(spearman.Y))

  var confidenceIntervalMinus = []
  var confidenceIntervalPlus = []

  spearman.Y.forEach(function(y) {
    confidenceIntervalMinus.push(y - ecarttype)
    confidenceIntervalPlus.push(y + ecarttype)
  })

  chartUri = appendUri(confidenceIntervalMinus, chartUri + "|", ',')
  chartUri = appendUri(confidenceIntervalPlus, chartUri + "|", ',')
  chartUri = appendUri(dates, chartUri + '&chxl=0:|', '|')

  return spearman.calc()
    .then(function(rho) {
      if (rho < 0) {
        return 'Bad vibes :disapointed: \n' + chartUri
      } else {
        return 'OK, good vibes! :tada: \n' + chartUri
      }

    }).catch(function(err) {console.error(err)})
}

module.exports = StatsUtils;
