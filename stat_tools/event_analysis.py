import requester
import record_analyser
import sys
import chart_requester
import scipy.stats as stats

def main(argv):
    request_tool = requester.Requester()
    event_id = request_tool.get_event_id('plancha')
    records = request_tool.get_records()

    my_analyser = record_analyser.RecordAnalyser(records['records'])
    M = my_analyser.get_means()
    E = my_analyser.get_event_presence(event_id)
    print(M.values())
    print(E.values())
    print(stats.f_oneway(M.values(), E.values()))

if __name__ == "__main__":
    main(sys.argv) 



