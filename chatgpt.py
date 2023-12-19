import os

import certifi
import openai
from flask import redirect, session, url_for
from flask_login import logout_user
from pymongo import MongoClient, ReturnDocument
from dotenv import load_dotenv

# take environment variables from .env.
load_dotenv()  

openai.organization = os.getenv("OPENAI_ORGANIZATION")
openai.api_key = os.getenv("OPENAI_API_KEY")

systemPrompt = {"role": "system", "content": "You are a helpful assistant."}
data = []

# Connect database
username = os.getenv("MONGO_USERNAME")
password = os.getenv("MONGO_PASSWORD")
database = os.getenv("MONGO_DATABASE")

client = MongoClient(
    f"mongodb+srv://{username}:{password}@talkcluster.els0bio.mongodb.net/",
    tlsCAFile=certifi.where()
)

db = client[database]

def get_response(incoming_msg):
    user_id = session.get("user_id", None)
    if user_id is None:
        return "You need to login first."

    if 'data' not in session:
        session['data'] = [{"role": "user", "content": incoming_msg}]
    else:
        session['data'] += [{"role": "user", "content": incoming_msg}]

    # Check if the user is an admin
    if user_id == "admin":
        messages = session['data']
    else:
        messages = [systemPrompt]
        messages.extend(session['data'])

    print(len(session['data']))

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=messages
        )
        content = response["choices"][0]["message"]["content"]

        # Store assistant's response in session data.
        session['data'] += [{"role": "assistant", "content": content}]

    except openai.error.RateLimitError as e:
        print(e)
        return ""

    if user_id != "admin" and len(session['data']) > 20:
        try:
            chat_logs = db['users'].find_one_and_update(
                {"_id": user_id},
                {
                    "$push": {"chat_logs": {"$each": session['data']}},
                    "$set": {"logged_out": True}
                },
                upsert=True,
                return_document=ReturnDocument.AFTER
            )
        except Exception as e:
            print(e)
        
        if chat_logs is not None:
            session.clear()
            return "##USER_LOGOUT##"
        else:
            return "Error saving chat logs. Please try again."


    return content
