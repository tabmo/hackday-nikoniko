import math

class ChartRequester:
    
    def __init__(self, dates, means, variances):
        self.base_uri = "https://image-charts.com/chart?"
        self.dates = dates
        self.means = means
        self.variances = variances

    def get_uri(self):
        my_url = self.base_uri + 'chs=600x300&chco=0000FF,FF0000,0000FF&cht=lc&' 
        values, values_up, values_down = '', '', ''
        xx = ''
        for x in range(0, len(self.dates)):
            xx = xx + str(x) + ','
        for d in self.dates: 
            values = values + str(self.means[d]) +','
            values_up = values_up + str(self.means[d] + math.sqrt(self.variances[d])) + ','
            values_down = values_down + str(self.means[d] - math.sqrt(self.variances[d])) + ','
        my_url = my_url + "chd=t:" + xx[:-1] + '|' + values[:-1] + '|' + xx[:-1] + '|' + values_up[:-1] + '|'  + xx[:-1] + '|' + values_down[:-1]
        print(my_url)

            

