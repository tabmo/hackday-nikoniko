import requester
import record_analyser
import sys
import chart_requester

def main(argv):
    request_tool = requester.Requester()
    records = request_tool.get_records()

    my_analyser = record_analyser.RecordAnalyser(records['records'])  
    my_analyser.cor_trend()

    chart_tool = chart_requester.ChartRequester(my_analyser.get_dates(), my_analyser.get_means(), my_analyser.get_vars())
    chart_tool.get_uri()
    

if __name__ == "__main__":
    main(sys.argv) 



