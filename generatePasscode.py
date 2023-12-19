import string
import random
import json

def get_random_string(length):
    letters = string.ascii_letters + string.digits
    result_str = ''.join(random.choice(letters) for i in range(length))
    return result_str

data = []
for i in range(300):
    _id = get_random_string(10) # 10個字元的亂數
    temp_dict = {"_id" : _id, "used" : False}
    data.append(temp_dict)

json_data = json.dumps(data, indent=4)

print(json_data)
