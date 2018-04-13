import json
import requests


class Requester:
    
    def __init__(self):
        self.headers = {'Content-Type': 'application/json', 'Authorization': 'Bearer keyNUv3Laq95pQOU7'} 
        self.request_url = "https://api.airtable.com/v0/appDrZAT5gWrRGi6X/NikoNiko?maxRecords=100&filterByFormula=AND(OR(IS_AFTER({Date},'2018-03-01'),IS_SAME({Date},'2018-03-11')),IS_BEFORE({Date},'2018-03-18'))"
        self.request_event_url = "https://api.airtable.com/v0/appDrZAT5gWrRGi6X/Event list?maxRecords=100"

    def get_records(self):
        resp = requests.get(self.request_url, headers=self.headers)         
        return(resp.json())

    def get_event_id(self, event_name):
        resp = requests.get(self.request_event_url, headers=self.headers)
        my_resp = resp.json()['records']
        for it in my_resp:
            if it['fields']['Event'] == event_name:
                return it['id']

