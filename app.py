import json
import logging
import os
import pdb
import string
from datetime import datetime, timedelta, timezone
from http import client
from apscheduler.schedulers.background import BackgroundScheduler
from bson.objectid import ObjectId
from dotenv import load_dotenv
from flask import (Blueprint, Flask, g, jsonify, redirect, render_template,
                   request, session, url_for, current_app)
from flask.cli import with_appcontext
from flask_login import (LoginManager, UserMixin, current_user, login_required,
                         login_user, logout_user)
from flask_pymongo import PyMongo
from flask_session import Session
from pymongo import MongoClient, ReturnDocument
from pymongo.errors import PyMongoError

from werkzeug.middleware.dispatcher import DispatcherMiddleware
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.serving import run_simple

from chatgpt import get_response
from dateutil import parser  # Corrected import
from prompt import (get_explanationResponse, get_summaryExplanationResponse,
                    initialmessage)
import pytz
import logging

logging.basicConfig(filename='app.log', level=logging.INFO)

logging.info('This is an info message')

# take environment variables from .env.
load_dotenv()

# global variable
Message_exp = ""

class CustomProxyFix(ProxyFix):
    def __call__(self, environ, start_response):
        script_name = environ.get('HTTP_X_FORWARDED_PREFIX', '')
        if script_name:
            environ['SCRIPT_NAME'] = script_name
        return super().__call__(environ, start_response)

app = Flask(__name__)
app.debug = False

#app.config['APPLICATION_ROOT'] = '/ChatAI'
app.secret_key = os.getenv("SECRET_KEY")
# app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_prefix=1)
app.wsgi_app = CustomProxyFix(app.wsgi_app)

# connect to mongoDB
def create_mongo_client():
    username = os.getenv("MONGO_USERNAME")
    password = os.getenv("MONGO_PASSWORD")

    return MongoClient(f"mongodb+srv://{username}:{password}@talkcluster.els0bio.mongodb.net/?retryWrites=false")

def get_mongo_client():
    username = os.getenv("MONGO_USERNAME")
    password = os.getenv("MONGO_PASSWORD")

    if "mongo_client" not in g:
        g.mongo_client = MongoClient(f"mongodb+srv://{username}:{password}@talkcluster.els0bio.mongodb.net/?retryWrites=false")
    return g.mongo_client

def get_db():
    database = os.getenv("MONGO_DATABASE")
    return get_mongo_client()[database]

# Initialize the User object with an id.
class User(UserMixin):
    def __init__(self, user_id):
        self.id = user_id

# see signin page first
login_manager = LoginManager(app)
login_manager.login_view = 'signin'


@app.teardown_appcontext
def teardown_db(error):
    mongo_client = g.pop("mongo_client", None)
    if mongo_client is not None:
        mongo_client.close()

# Load a user from the database using their user_id.
@login_manager.user_loader
def load_user(user_id):
    user = get_db()['users'].find_one({"user_id": user_id})  # Use get_db() instead of db
    if user:
        return User(user_id)
############################################
  


ADMIN_EMAIL = "admin@NIpeQFlP2hfo"
MAX_LOGIN_ATTEMPTS = 5
############################################
def get_user_by_id(userID):
    db = get_db()
    return db['users'].find_one({"user_id": userID})

def validate_user_credentials(user, password):
    return user and check_password_hash(user['password'], password)

def handle_login_attempts(user):
    db = get_db()
    if user['login_times'] > MAX_LOGIN_ATTEMPTS and user['user_id'] != ADMIN_EMAIL:
        db['users'].update_one({"user_id": user['user_id']}, {"$set": {"logged_out": True}})
        return False, "You have exceeded the maximum number of login attempts. You are now logged out."
    return True, None

def assign_question_collection(db, userID, mongoSession):
    # 指定的隨機樣本列表
    random_sample_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 51, 52, 53, 54, 55, 56, 57, 58, 59, 101, 102, 103, 104, 105, 106, 107, 108, 109, 151, 152, 153, 154, 155, 156, 157, 158, 159, 201, 202, 203, 204, 205, 206, 207, 208, 209]

    #[1, 2, 3, 4, 5, 6, 7, 8, 9, 51, 52, 53, 54, 55, 56, 57, 58, 59, 101, 102, 103, 104, 105, 106, 107, 108, 109, 151, 152, 153, 154, 155, 156, 157, 158, 159, 201, 202, 203, 204, 205, 206, 207, 208, 209]


    try:
        # 從指定的列表中尋找符合條件的問題集
        questionCollection = db.questionCollectionData.find(
            {
                "questionCollection_id": {"$in": random_sample_list},
                "assigned_count": {"$lt": 5}
            },
            session=mongoSession
        ).sort("questionCollection_id", 1).limit(1).next()

        # 更新問題集的指派次數
        db.questionCollectionData.update_one(
            {"_id": questionCollection["_id"]},
            {"$inc": {"assigned_count": 1}},
            session=mongoSession
        )

        # print(datetime.utcnow().replace(tzinfo=pytz.UTC))

        # 過期時間30分鐘
        expiration_time = datetime.utcnow().replace(tzinfo=pytz.UTC) + timedelta(minutes=45)
        
        # print(expiration_time)
        
        # 更新用戶資訊，包括分配的問題集ID和過期時間
        db.users.update_one(
            {"user_id": userID},
            {
                "$set": {
                    "questionCollection_id": questionCollection["questionCollection_id"],
                    "expiration_time": expiration_time
                }
            },
            upsert=True,
            session=mongoSession
        )
        return True

    except StopIteration:
        # 沒有找到符合條件的問題集
        return False
    except Exception as e:
        # 處理其他可能的錯誤
        logging.info("An error occurred: ", e)
        return False

def check_user_status():
    with app.app_context():
        current_time = datetime.utcnow().replace(tzinfo=pytz.UTC)
        db = get_db()

        users = db.users.find({"logged_out": False})
        
        for user in users:
            last_heartbeat = user['last_heartbeat']
            if last_heartbeat:
                time_since_last_heartbeat = current_time - last_heartbeat.replace(tzinfo=pytz.UTC)
                if time_since_last_heartbeat.total_seconds() > 70:
                    if 'expiration_time' in user:
                        expiration_time = user['expiration_time'].replace(tzinfo=pytz.UTC)

                        if expiration_time < current_time:
                            logging.info("expiration_time: %s", expiration_time)
                            logging.info("current_time: %s", current_time)
                            # Update survey status
                            db.questionCollectionData.update_one(
                                { "questionCollection_id": user['questionCollection_id'] },
                                { "$inc": { "assigned_count": -1 } }
                            )
                            logging.info(f"check expiration_time => Update questionCollectionData: assigned_count")

                            # 删除用户记录
                            db.users.delete_one({"user_id": user['user_id']})
                            logging.info(f"deactivate => Delete user: all")

                
# 初始化 APScheduler
scheduler = BackgroundScheduler()
scheduler.add_job(func=check_user_status, trigger="interval", minutes = 2)
scheduler.start()

@app.route("/", methods=['GET'])
def home():
    # id = request.args.get('id', type=int)  # Get the 'id' parameter from the URL
    pID = request.args.get('PROLIFIC_PID', type=str) # Use 'str' instead of 'string'
    return render_template("signin.html", PROLIFIC_PID = pID)  # Pass the 'PROLIFIC_PID' parameter to the template

@app.route('/heartbeat', methods=['POST'])
@login_required  # 假設您使用 Flask-Login 或類似機制
def heartbeat():
    try:        
        pID = session.get('PROLIFIC_PID')
        userID = session.get('user_id')
        current_time = datetime.utcnow().replace(tzinfo=pytz.UTC)

        db = get_db()
        db.users.update_one({'user_id': userID}, {'$set': {'last_heartbeat': current_time}})

        return jsonify({'status': 'success'})
    except PyMongoError as e:
        logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
        return "Database operation failed.", 500


# @app.route('/checkUserStatus')
# def user_status():
#     try:        
#         db = get_db()
#         pID = session.get('PROLIFIC_PID')
#         userID = session.get('user_id')
#         user = db.users.find_one({"user_id": userID, "logged_out": False})
#         if user:
#             return jsonify({"loggedOut": "should log out user"}), 200
#         else:
#             return "no need to log out", 200
#     except PyMongoError as e:
#         logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
#         return "Database operation failed.", 500
    
@app.route("/signin", methods=['GET', 'POST'])
def signin():
    try:
        if request.method == 'POST':
            userID = request.form.get("user_id")
            passWord = request.form.get("password")
            pID = request.form.get('PROLIFIC_PID', type=str)

            user = get_user_by_id(userID)


            if not user:
                return "Invalid user ID."
            
            if user['PROLIFIC_PID'] != pID:
                return "The entered PID does not match the registered PROLIFIC_PID."

            if user['expiration_time'].replace(tzinfo=pytz.UTC) < datetime.utcnow().replace(tzinfo=pytz.UTC):
                return "Your account is expired.(Only available for 30 minutes after you create an account)"
            
            if not validate_user_credentials(user, passWord):
                return "Invalid password."
            
            is_valid, error_message = handle_login_attempts(user)
            if not is_valid:
                return error_message
            
            # if user['activate'] == False:
            #     return "Please re-register your account, as it has not been active for at least 30 minutes. Thank you."
            
            if user['logged_out'] == True:
                return "You Already finished your survey."
            
            
            user_obj = User(userID)
            login_user(user_obj)
            session['questionCollection_id'] = user['questionCollection_id']
            session['user_id'] = userID
            session['PROLIFIC_PID'] = pID
            
            return redirect(url_for('chat', PROLIFIC_PID=pID))

        return render_template("signin.html")
    except PyMongoError as e:
        logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
        return "Database operation failed.", 500

@app.route("/signup/", methods=['GET', 'POST'])
def signup():

    pID = request.args.get('PROLIFIC_PID', type=str)

    if pID is None:
        return "No PROLIFIC_PID provided, Could not create account."

    return render_template("signup.html", PROLIFIC_PID = pID)


@app.route("/signup/goback", methods=['GET', 'POST'])
def goback():
    # Initialize pID to None for GET request
    pID = None
    
    if request.method == 'POST':
        userID = request.form.get("user_id")
        passWord = request.form.get("password")
        pID = request.form.get('PROLIFIC_PID', type=str)
        current_time = datetime.utcnow().replace(tzinfo=pytz.UTC)


        # Input validation (just a basic example, you might need more comprehensive checks)
        if not userID or not passWord or not pID:
            return "Incomplete form data. Please fill all fields."

        # Check if the number of users in the database is 40 or more
        # user_count = get_db()['users'].count_documents({})
        # if user_count >= 1000:
        #     return "User limit reached. Cannot create more accounts."

        existingUser = get_db()['users'].find_one({"user_id": userID})
        if existingUser:
            return "Your Prolific ID has been successfully registered before. Please return to the sign-in page and log in using your password."

        hashed_password = generate_password_hash(passWord)

        existingPID = get_db()['users'].find_one({"PROLIFIC_PID": pID})
        if existingPID:
            return "PROLIFIC_PID already taken."

        client = get_mongo_client()
        db = get_db()

        with client.start_session() as mongoSession:
            # 开始一个事务
            mongoSession.start_transaction()

            try:
                # 执行数据库操作
                db['users'].insert_one({
                    "user_id": userID,
                    "password": hashed_password,
                    "logged_out": False,
                    "login_times": 0,
                    "PROLIFIC_PID": pID,
                    "last_heartbeat": current_time
                }, session=mongoSession)

                if not assign_question_collection(db, userID, mongoSession):
                    return "Thank you for your interest! Our survey is full at the moment. Check back later for available spots. We appreciate your understanding."

                # 提交事务
                mongoSession.commit_transaction()

            except PyMongoError as e:
                # 发生错误，回滚事务
                mongoSession.abort_transaction()
                logging.info("An error occurred: ", e, "pid:", pID)
                return "An error occurred, unable to process request."

        return redirect(url_for("home", PROLIFIC_PID=pID))

    return redirect(url_for('home'))

@app.route("/returnSignup", methods=['POST'])
def returnSignup():

    pID = session.get('PROLIFIC_PID')

    session.pop('user_id', None)
    session.clear()
    return redirect(url_for('home', PROLIFIC_PID=pID))

@app.route("/finish", methods=['POST'])
def finish():
    try:
        userID = session.get('user_id')  # Assuming the user ID is stored in the session
        questionCollectionID = session['questionCollection_id']
        pID = session.get('PROLIFIC_PID')


        # If the user is not admin, set logged_out to True in the database.
        if userID and userID != "admin@NIpeQFlP2hfo":
            db = get_db()  # Assuming get_db is a function that returns a connection to your database.
            db['users'].update_one({"user_id": userID}, {"$set": {"logged_out": True}})
            db['questionCollectionData'].update_one({"questionCollection_id": questionCollectionID}, {"$inc": {"completed_count": 1}})
            db['questionCollectionSurvey'].update_one({"user_id": userID}, {"$set": {"finished": True}})

        logout_user()    

        return "Users successfully finished", 200
    except PyMongoError as e:
        logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
        return "Database operation failed.", 500

# According to questionCollection_id generate initial claim and explanation, and then go to chat page
@app.route("/chat")
@login_required
def chat():
    try:
        questionCollectionID = session.get('questionCollection_id')
        # print(questionCollectionID)
        pID = request.form.get('PROLIFIC_PID', type=str)


        result = get_db()['questionCollectionData'].find_one({"questionCollection_id": questionCollectionID})

        if result:
            claim = result.get('claim', 'No claim found.')
            initialExplanation = result.get('explanations', 'No initial_explanation found.')
        else:
            claim = 'No document with matching questionCollection_id found.'
            initialExplanation = 'No document with matching initial_explanation found.'

            userID = session.get('user_id')  # Assuming the user ID is stored in the session


        userID = session.get('user_id')  # Assuming the user ID is stored in the session

        if userID:
            # Connect to database
            db = get_db()

            user = db['users'].find_one({"user_id": userID})

            # Check login times
            if user and user['login_times'] > 4:
                if userID != "admin@NIpeQFlP2hfo":
                    db['users'].update_one({"user_id": userID}, {"$set": {"logged_out": True}})
                    logout_user() # from flask_login import logout_user
                    session.clear()
                    return "You have exceeded the maximum number of login attempts. You are now logged out."
            else:
                # Increase the login times and update the user in the database only if it's not the admin user
                if userID != "admin@NIpeQFlP2hfo":
                    # Update the login_times in the database
                    db['users'].update_one({"user_id": userID}, {"$inc": {"login_times": 1}})

                    # Retrieve the updated user information from the database
                    updated_user = db['users'].find_one({"user_id": userID})
                    session['login_times'] = updated_user['login_times']

        return render_template("index.html", user_id=current_user.get_id(), claim = claim, initial_explanation = initialExplanation, id=questionCollectionID)
    except PyMongoError as e:
        logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
        return "Database operation failed.", 500
    
@app.route("/getExplanationResponse", methods=["POST"])
def get_explanation_response():

    if request.method == 'POST':
        data = request.get_json()
        questionCollectionID = int(data.get('id'))
        previousExp = data.get('previous_exp')
        questionList = data.get('question_list')
        messageExp = data.get('message_exp')
        history = data.get('history')
        questionRound = int(data.get('question_round'))
        # pdb.set_trace()  # 這將設置一個斷點

        if(questionRound == 0):
            _, firstMessageExp, _, firstRoundHistory = initialmessage(questionCollectionID)
            explanationResponse, recordMessageExp, recordHisotry = get_explanationResponse(questionCollectionID, previousExp, questionList, firstMessageExp, firstRoundHistory)
        
        else:
        # pdb.set_trace()  # 這將設置一個斷點
            explanationResponse, recordMessageExp, recordHisotry = get_explanationResponse(questionCollectionID, previousExp, questionList, messageExp, history)

        response_data = {
        'explanationResponse': explanationResponse,
        'recordMessageExp': recordMessageExp,
        'recordHistory': recordHisotry
        }
 
        return jsonify(response_data)

    os.abort(405)  # Method Not Allowed


@app.route("/getSummaryExplanationResponse", methods=["GET", "POST"])
def get_summary_eplanation_response():

    if request.method == 'POST':
        data = request.get_json()
        questionCollectionID = int(data.get('id'))
        history = data.get('history')
        questionList = data.get('question_list')

        summaryExplanationResponse, recordHistory = get_summaryExplanationResponse(questionCollectionID, history, questionList)

        response_data = {
        'finalExplanationContentget': summaryExplanationResponse,
        'recordHistory': recordHistory
        }

        return jsonify(response_data)

    os.abort(405)  # Method Not Allowed


@app.route('/save', methods=['POST'])
def save_to_database():
    try:    
        userID = session.get('user_id')
        questionCollectionID = session.get('questionCollection_id')
        pID = session.get('PROLIFIC_PID')
        loginTimes = session.get('login_times')

        payload = request.get_json()

        explanation = payload['explanation']
        questionList = payload['questionList']
        questionType = payload['questionType']
        userPreferenceExplanations = payload['userPreferenceExplanations']

        # create mapping for questionType to key in the database
        questionType_mapping = {
            'PreTest': 'pre_test',
            'QuestionsAndExplanation': 'explanation_and_explanationAnswers',
            'SummaryExplanation': 'explanation_and_summaryExplanationAnswers',
            'UserPreferenceScore': 'explanations_and_userPreferenceAnswers',
            'PostTest': 'post_test',
            'TimeStamps': 'time_stamps',
            'ClickTimesAndTime': 'clickTimes_and_time'
        }

        if questionType not in questionType_mapping.keys():
            return "Invalid question type.", 400

        db_key = questionType_mapping[questionType]

        db = get_db()

        collection = db.questionCollectionSurvey

        # create a unique compound index if it doesn't already exist
        collection.create_index([("PROLIFIC_PID", 1), ("user_id", 1), ("questionCollection_id", 1)], unique=True)

        data = None
        if questionType == 'PreTest':
            data = {"preTest": questionList}
        elif questionType == 'QuestionsAndExplanation':
            data = {"explanation": explanation, "explanationAnswers": questionList}
        elif questionType == 'SummaryExplanation':
            data = {"summaryExplanation": explanation, "summaryExplanationAnswers": questionList}
        elif questionType == 'UserPreferenceScore':
            data = {"userPreferenceExplanations": userPreferenceExplanations, "userPreferenceAnswers": questionList}
        elif questionType == 'PostTest':
            data = {"postTest": questionList}
        elif questionType == 'ClickTimesAndTime':
            data = {"clickTimesAndTime": questionList}
        elif questionType == 'TimeStamps':
            data = {"timeStamps": questionList}


        # Get existing document without considering login_times
        existing_doc = collection.find_one({"PROLIFIC_PID": pID, "user_id": userID, "questionCollection_id": questionCollectionID})

        if existing_doc and existing_doc["login_times"] == loginTimes:
            # Document found with same login_times, update it
            collection.update_one({"_id": existing_doc['_id']}, {"$push": {db_key: data}})
            doc_id = existing_doc['_id']  # You already have the document id
        else:
            # Document not found with same login_times or does not exist
            if existing_doc:
                # Remove the existing document
                collection.delete_one({"_id": existing_doc['_id']})

            # Insert a new document
            new_doc = {"PROLIFIC_PID": pID, "user_id": userID, "questionCollection_id": questionCollectionID, "login_times": loginTimes, db_key: [data]}
            insert_result = collection.insert_one(new_doc)
            doc_id = insert_result.inserted_id  # Get the new document id

        if doc_id:
            # Store document id in session
            session['doc_id'] = str(doc_id)
            return "Data successfully saved to database.", 200
        else:
            return "Failed to save data to database.", 500
    except PyMongoError as e:
        logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
        return "Database operation failed.", 500


# @app.route('/check_explanations', methods=['GET'])
# def check_explanations():
#     try:
#         document_id = session.get('doc_id')
#         userID = session.get('user_id')
#         pID = session.get('PROLIFIC_PID')

#         if document_id is None:
#             return jsonify({"message": "No session id found."}), 400

#         db = get_db()

#         document = db['questionCollectionSurvey'].find_one({"_id": ObjectId(document_id)})
#         user_data = db.users.find_one({"user_id": userID})

#         if document and document.get('explanations_and_userPreferenceAnswers'):
#             db['questionCollectionSurvey'].update_one({"_id": ObjectId(document_id)}, {"$set": {"finished": True}})
#             db.questionCollectionData.update_one(
#                 {"_id": user_data['questionCollection_id']},
#                 {"$inc": {"completed_count": 1}}
#             )
#             return jsonify({"message": "Update successful."}), 200
#         else:
#             return jsonify({"message": "No explanations and user preference answers found or document doesn't exist."}), 400
#     except PyMongoError as e:
#         logging.warning(f"MongoDB connection error: {e}, PID: {pID}")
#         return jsonify({"message": "Database operation failed."}), 500

@app.route('/deactivate', methods=['GET'])
def deactivate_user():
    try:
        db = get_db()
        pID = session.get('PROLIFIC_PID')
        questionCollectionID = session.get('questionCollection_id')

        userID = session.get('user_id')
        if not userID:
            return "No user ID in session", 400

        user = db.users.find_one({"user_id": userID, "logged_out": False})
        if user:
            # 如果存在相关联的 questionCollectionData，更新或处理它
            if 'questionCollection_id' in user:
                db.questionCollectionData.update_one(
                    {"questionCollection_id": user['questionCollection_id']},
                    {"$inc": {"assigned_count": -1}}
                )

            # 删除用户记录
            db.users.delete_one({"user_id": userID})
            logging.info(f"deactivate => Delete user: all")


        else:
            # Update survey status
            db.questionCollectionData.update_one(
                {"questionCollection_id": questionCollectionID },
                {"$inc": {"assigned_count": -1}}
            )
            logging.info(f"deactivate => Update questionCollectionData: assigned_count")

            # Mark user as logged out
            db.users.update_one({"_id": userID}, {"$set": {"logged_out": True, "activate": False}})
            logging.info(f"deactivate => => Update users: logged_out, activate")
    except PyMongoError as e:
        logging.warning(f"MongoDB connection error: {e}, PID: {pID}")

    except Exception as e:
        logging.warning(f"An error occurred: {e}")
        return "An internal server error occurred", 500

    finally:
        # 無論是否發生異常，都執行注銷用戶和清除 session 的操作
        logout_user()  # 注销用户
        session.clear()  # 清除 session

        return redirect(url_for('signup', PROLIFIC_PID=pID))



# When user finish form, automatically go back to signin page
@app.errorhandler(500)
def internal_error(error):

    return redirect(url_for('home'))

# manage session data in database
@app.route('/set/')
def set():
    session_id = str(ObjectId())

    session['session_id'] = session_id

    get_db().sessions.insert_one({'_id': session_id, 'data': 'value',
                                  'expiration': datetime.utcnow().replace(tzinfo=pytz.UTC) + timedelta(hours=1)})  # Use get_db() instead of db
    return 'ok'

# manage session data in database
@app.route('/get/')
def get():
    session_id = session.get('session_id')

    db_session = get_db().sessions.find_one({'_id': session_id})  # Use get_db() instead of db

    if db_session and db_session['expiration'] > datetime.utcnow().replace(tzinfo=pytz.UTC):
        return db_session['data']
    else:
        return 'not set'


if __name__ == '__main__':
    app.run(host=app['HOST'],
            port=app['PORT'],
            debug=app['DEBUG'])
