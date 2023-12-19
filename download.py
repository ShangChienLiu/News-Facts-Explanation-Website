from pymongo import MongoClient
import json
import os
from bson import json_util  # Import for handling ObjectId during JSON serialization

from dotenv import load_dotenv

# take environment variables from .env.
load_dotenv()  

# Connect to database
username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
database = os.getenv("MONGO_DATABASE")

client = MongoClient(
    f"mongodb+srv://{username}:{password}@talkcluster.els0bio.mongodb.net/"
)

db = client[database]

# Collection name is 'data_collection'
data_collection = db['questionCollectionSurvey']

# Perform the query and sort
# Perform the query and sort
query = {
    "questionCollection_id": {
        "$in": [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
            50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 
            100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 
            150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 
            200, 201, 202, 203, 204, 205, 206, 207, 208, 209
        ]
    },
    "finished": True,  # 現有條件
    "PROLIFIC_PID": {
        "$regex": "^[0-9a-fA-F]{24}$"
    }  # 新增的正則表達式條件
}

# Calculate the number of results
results_count = data_collection.count_documents(query)

# Print the number of results
print(f"Total number of matching documents: {results_count}")

# Get the query results and sort
query_results = data_collection.find(query).sort("questionCollection_id", 1)

# Convert the query results to a list
results_list = list(query_results)

# Save the results as a JSON file using json_util to handle ObjectId
with open('query_results.json', 'w', encoding='utf-8') as file:
    json.dump(results_list, file, default=json_util.default, ensure_ascii=False, indent=4)

