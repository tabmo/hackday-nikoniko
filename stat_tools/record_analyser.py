import json
import scipy.stats

class RecordAnalyser:

    def __init__(self, records):
        self.records = records

    def get_dates(self):
        dates = []
        for rec in self.records:
            dates.append(rec['fields']['Date'])
        return(sorted(dates))

    def get_means(self):
        means = {}
        for rec in self.records:
            sum_rec, nrec = 0, 0
            for f in ["1", "2", "3", "4", "5"]:
                nrec += rec['fields'][f]
                sum_rec += float(f)* rec['fields'][f]
            means[rec['fields']['Date']] = sum_rec/float(nrec) 
        return(means)

    def get_vars(self):
        rec_vars = {}
        rec_means = self.get_means() 
        for rec in self.records:
            rec_date = rec['fields']['Date']
            sum_rec, nrec = 0, 0
            for f in ["1", "2", "3", "4", "5"]:
                nrec += rec['fields'][f]
                sum_rec += ((float(f) - rec_means[rec_date])**2)* rec['fields'][f]
            rec_vars[rec_date] = sum_rec/float(nrec)
        return(rec_vars)

    def cor_trend(self):    
        means = self.get_means()
        trend = []
        for d in self.get_dates():
            trend.append(means[d])
        rho, p = scipy.stats.spearmanr(range(0, len(trend)), trend)
        if rho < 0:
            print("bad vibes :( with confidence "+ str(1 - p))
        else: 
            print("OK, good vibes! with confidence "+str(1 - p))


