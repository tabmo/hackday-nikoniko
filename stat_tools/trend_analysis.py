import requester
import record_analyser
import sys

def main(argv):
    request_tool = requester.Requester()
    records = request_tool.get_records()

    my_analyser = record_analyser.RecordAnalyser(records['records'])  
    my_analyser.cor_trend()

if __name__ == "__main__":
    main(sys.argv) 



