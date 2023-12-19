import { postTestOptions, postTestOptionsQuestions, preTestOptions, preTestOptionsQuestions, questionsAndExplanationOptions, questionsAndExplanationQuestions, questionsAndExplanationRound, summaryExplanationOptions, summaryExplanationQuestions, userPreferenceScoreOptions, userPreferenceScoreQuestions } from "./questions.js";

const msgerForm = get(".msger-inputarea");
const msgerInput = get(".msger-input");
const msgerChat = get(".msger-chat");
const popContent = get(".popup-content");

// Icons made by Freepik from www.flaticon.com
const BOT_IMG = "https://img.icons8.com/dotty/160/futurama-bender.png";
const PERSON_IMG = "https://img.icons8.com/ios-filled/512/guest-male.png";
const BOT_NAME = "ExplainerGPT";
const PERSON_NAME = user_id;
var questionIds = [];
var questionOptionIds = [];
var inputarea_context = "";
var other_context = "";
var reason_context = "";
var inputarea_context_list = [];
var radioAnswers = [];
var varExplanation = "";
var userPreferenceExplanations = [];
var radioChecked = null
//global variableClaim
var allHistory = "";
var allMessageExp = [];
var isFirstTime = 1;
var questionList = {};
var questionRound = 0;
//timeStamp
var buttonClickTimestamps = [];
var clickTimesAndTimeList = [];
var PretestQuestionClickTimes = 0;
var PretestQuestionTime = 0;

var QuestionAndExplanationClickTimesAndTimeList = [];

var SummaryExplanationClickTimes = 0;
var SummaryExplanationTime = 0;

var UserPreferenceClickTimes = 0;
var UserPreferenceTime = 0;

var PostQuestionClickTimes = 0;
var PostQuestionTime = 0;


// Main program variable
let questionsAndExplanationCompleted = false;
let endQuestionsAndExplanation = false;

let summaryExplanationCompleted = false;
let endSummaryExplanation = false;

let userPreferenceScoreCompleted = false;
let enduserPreferenceScore = false;

let pretestCompleted = false;
let endPretest = false;

let posttestCompleted = false;
let endPosttest = false;



var finishedAll = false;
let intervalID;

// let allowToCheck = false;
let endConversation = false
let appendConversationOpen = true;
let isError = false;
var timestamp;

var titleButton = document.getElementById('title-btn');
var closeButton = document.getElementById('close-btn');
var submitBtn = document.getElementById('submit-btn');
let startTime = 0;
let totalDurationTime = 0;
let clickTimes = 0;

//計時三分鐘，如果沒有動作，就登出
let timeout;

function triggerDeactivate() {
    // Use Fetch API to call the /deactivate route
    fetch('deactivate', { method: 'GET' })
    .then(response => {
        // Check if the response is a redirect
        if (response.redirected) {
            // Redirect the browser to the response's URL
            window.location.href = response.url;
        } else {
            // Handle non-redirect responses (e.g., errors)
            if (response.headers.get("content-type") === "application/json") {
                return response.json();
            } else {
                return response.text();
            }
        }
    })
    .then(data => {
        // Handle the data from the response (if not a redirect)
        console.log('Success:', data);
    })
    .catch((error) => {
        // Handle errors
        console.error('Error:', error);
    });
}


function resetTimer() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        if (finishedAll) {
            return; // 提前退出函數
        }

        alert("Please re-register and log in again as there has been no activity for 5 minutes.");
        // Call triggerDeactivate here, after the alert
        setTimeout(() => {
            triggerDeactivate();
        }, 100); // 稍微延遲執行
        
    }, 600000); // 10 minutes = 600000 milliseconds
}

// Set initial timer
resetTimer();

// Add event listeners for user activity
window.addEventListener('click', resetTimer, false);
window.addEventListener('keypress', resetTimer, false);


setInterval(() => {
    fetch('heartbeat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log("heartbeat")
}, 60000); // 每 60 秒發送一次

  

// //如果超過70分鐘沒有完成(logout = true)的時候，就重新loading頁面
// function checkUserStatus() {
//     if (finishedAll) {
//         clearInterval(intervalID); // 清除間隔計時器
//         return; // 提前退出函數
//     }

//     fetch('checkUserStatus')
//     .then(response => response.json())
//     .then(data => {
//         if (data.loggedOut) {
//             // Show an alert to the user
//             alert("Please re-register and log in again as there has been no finished for 70 minutes.");
            
//             // After the alert is closed, trigger the deactivate function
//             setTimeout(() => {
//                 triggerDeactivate();
//             }, 100); // 稍微延遲執行
//         }
//     })
//     .catch(error => console.error('Error:', error));
// }


// // 每分钟检查一次用户状态
// intervalID = setInterval(checkUserStatus, 2700000); // 45分鐘 =  2700000 毫秒


function getCurrentTimeInSeconds() {
    return parseFloat((new Date().getTime() / 1000).toFixed(2));
}

titleButton.addEventListener('click', function () {
    startTime = getCurrentTimeInSeconds();
    clickTimes += 1;
    console.log("titleButton: clickTimes, startTime ", clickTimes, startTime);
});

closeButton.addEventListener('click', function () {
    if (startTime !== 0) {
        let elapsed = getCurrentTimeInSeconds() - startTime;
        totalDurationTime += elapsed;
        totalDurationTime = parseFloat(totalDurationTime.toFixed(2));
        console.log("closeButton: totalDurationTime ", totalDurationTime);
        startTime = 0;
    }
});

submitBtn.addEventListener('click', recordTimestamp);

//一開始的 IRB 頁面 
window.onload = function () {
    Swal.fire({
        width: '100%',
        heightAuto: false,
        allowOutsideClick: false,
        confirmButtonText: 'Accept',
        backdrop: `
        rgba(0,0,123,0.4)
        `,
        grow: 'fullscreen',
        html: `
        <div style="text-align: left;">
        <h1 style="text-align: center; font-size: 40px; font-weight: bold; color: #6E66D9; text-shadow: 2px 2px 4px #888888; font-family: 'Arial', sans-serif;">Consent form</h1>
        <h2 style="font-size: 28px;">Welcome to Our Survey!</h2>
        <p style="font-size: 20px;">Before you begin, please take a moment to review the following consent form. This form provides essential information about the survey. If you agree to participate, kindly click the "Accept" button at the bottom.</p>
        <h2 style="font-size: 28px;">Informed Consent Form</h2>
        <p style="font-size: 20px;">We invite you to take part in a research study titled "Generation of Fake News Explanation." This study is led by Research Fellow Lun-Wei Ku from the Institute of Information Science at Academia Sinica. We will provide a detailed description of the study and address any questions you may have. Funding for this research comes from the Institute of Information Science at Academia Sinica, the Lun-Wei Ku laboratory (3006), and the National Science and Technology Council (NSTC).</p>
        <p style="font-size: 20px;">Your participation in this study is entirely voluntary. You are under no obligation to participate, and if you decide to join but later change your mind, you can withdraw at any time without facing any penalties or consequences.</p>
        <h2 style="font-size: 28px;">Participation Requirements:</h2>
        <p style="font-size: 20px;">To take part in this research, you must be at least 18 years old, regardless of nationality, and have the ability to read English news.</p>
        <h2 style="font-size: 28px;">Purpose of the Research:</h2>
        <p style="font-size: 20px;">This study aims to assess fake news debunking strategies. We hope to achieve this by utilizing a Natural Language Generation (NLG) model, specifically a large language model (LLM), to generate explanations for existing fake news. Most artificial intelligence research related to fake news focuses on developing highly accurate fake news classifiers. However, our research seeks to contribute to artificial intelligence's role in combating fake news by providing generated explanations to help people recognize and mitigate the impact of fake news.</p>
        <p style="font-size: 20px;">This survey does not collect any personally identifiable information from participants. It is solely for academic research purposes and potential paper publication.</p>
        <h2 style="font-size: 28px;">Procedures:</h2>
        <p style="font-size: 20px;">Participants should first register for an account on Prolific, read the experiment instructions and this informed consent form, and agree to adhere to the experiment's guidelines. During the experiment, participants will read a single fake claim and answer multiple-choice and open-ended questions that require them to provide ideas and feedback. Participants are free to exit the experiment at any time without the need for a specific reason.</p> 
        <p style="font-size: 20px;">The survey consists of three parts, and the entire process takes approximately 30 minutes to complete. Participants can withdraw during the process, but full payments are only provided to those who complete the survey and follow the instructions correctly. If you have any questions during the task, you may contact us directly by sending an email to <span style="font-style: italic; color: blue;">yili.hsu@iis.sinica.edu.tw</span></p>       
        <h2 style="font-size: 28px;">Privacy/Confidentiality/Data Security:</h2>   
        <p style="font-size: 20px;">In this research experiment, once participants have completed the experiment, the research team can download de-identified data provided by the platform, which will be used for potential paper publication. The research team will not have access to any personally identifiable information from participants. De-identified data will be deleted after 120 days of retention on the platform. De-identified data from this study may be shared with the broader research community to advance scientific knowledge.</p>        
        <h2 style="font-size: 28px;">Contact Information:</h2>   
        <p style="font-size: 20px;">The primary researcher conducting this study is Lun-Wei Ku, a Research Fellow at the Institute of Information Science, Academia Sinica. If you have questions, you may contact us directly by sending an email to our laboratory at yili.hsu@iis.sinica.edu.tw. For inquiries or concerns about your rights as a study participant, please contact the Academia Sinica IRB Humanities and Social Science Research at <span style="font-style: italic; color: blue;">+886-2789-8722</span>, email: <span style="font-style: italic; color: blue;">irb@gate.sinica.edu.tw</span>, or visit their website at <a href="https://hs.irb.sinica.edu.tw" target="_blank">https://hs.irb.sinica.edu.tw</a></p>
        <p style="font-size: 20px;">By proceeding to the next step in the survey, you confirm that you are at least 18 years old, have read this consent form, and agree to participate in this research study. You are free to discontinue your participation at any time of your choosing.</p>
        </div>
        `,
    }).then((result) => {
        if (result.isConfirmed) {
            recordTimestamp(1, 'Accept');
            // Show the second popup with the instructions
            Swal.fire({
                width: '100%',
                heightAuto: false,
                allowOutsideClick: false,
                confirmButtonText: 'Continue',
                backdrop: 'rgba(0,0,123,0.4)',
                html: `
                <div style="text-align: left;">
                    <h1 style="text-align: center; font-size: 40px; font-weight: bold; color: #6E66D9; text-shadow: 2px 2px 4px #888888; font-family: 'Arial', sans-serif;">Instructions</h1>
                    <h2 style="font-size: 28px;">This survey aims to investigate the effectiveness of strategies for debunking fake news.</h2>
                    <h2 style="font-size: 28px;">It consists of three parts:</h2>
                    <br>

                    <h2 style="font-size: 28px;">Part 1: Pre-test</h2>
                    <p style="font-size: 20px;">In this section, you will evaluate your familiarity with a given news claim and determine its veracity. You will also answer questions about your news consumption habits and political leanings.</p>
                    <br>

                    <h2 style="font-size: 28px;">Part 2: Chatbot Environment</h2>
                    <h2 style="font-size: 22px;">- 2.1: Evaluate Explanation Quality and Ask Questions</h2>
                    <p style="font-size: 20px;">    You will receive an explanation for the news claim from Part 1 and rate it on five dimensions. After rating the explanation, you will have the opportunity to ask a question to seek clarification or additional information. The AI-explainer will refine the explanation based on your questions, with this process repeating for 3 to 10 rounds.</p>

                    <h2 style="font-size: 22px;">- 2.2: Evaluate Chat History Summary</h2>
                    <p style="font-size: 20px;">    You will be presented with a comprehensive summary explanation of the chat history. Rate this summary in five dimensions.</p>

                    <h2 style="font-size: 22px;">- 2.3: Select Best and Worst Explanations</h2>
                    <p style="font-size: 20px;">    You will compare the initial explanation, the last round explanation, and the summary explanation. Choose the best and worst explanations based on your own knowledge and preference.</p>

                    <br>
                    <h2 style="font-size: 28px;">Part 3: Post-test</h2>
                    <p style="font-size: 20px;">In this section, you will evaluate the veracity of a news claim, and provide feedback on your overall survey experience.</p>
                    <p style="font-size: 20px;">Upon completing all three parts of the survey, you will receive a completion code. Enter this code in Prolific to confirm your survey completion.</p>
                    <p style="font-size: 20px;">Note: Please be aware that once you click the "Next" button, you will not be able to return to the previous page.</p>

                </div>
                `,
                //claim
            }).then((result) => {
                recordTimestamp(1, 'Continue');
                if (result.isConfirmed) {
                    updateInitialPopUpLine();
                    console.log("claim:", claim, "initial_explanation:", initial_explanation);
                    //10秒後關掉claim的叉叉才會出來
                    showPopupWithShortTimeout();
                }
            });
        }
    });
};

//save initial_explanation
varExplanation = initial_explanation;


//save initial_explanation into array
userPreferenceExplanations.push(initial_explanation);


// Start pre-test question 最開始得pre-test問題出現
askPretestQuestion(
    preTestOptionsQuestions,
    preTestOptions,
    BOT_IMG,
    PERSON_IMG,
    BOT_NAME,
    PERSON_NAME,
    questionRound
);

// Main program 每一次按下submit之後，確認問種類
msgerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    msgerForm.querySelector(".msger-send-btn").disabled = true; // Disable the send button

    if (finishedAll) {
        msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button
        console.log("finishedAll", finishedAll);

        returnSignup();
        return;
    }

    const isDataValid = checkData();

    if (isDataValid) {
        recordTimestamp(1, 'Submit');

        console.log("IsDataValid_questionRound", questionRound)

        if (!endPretest) {
            questionList = preTestToTemplate(radioAnswers, other_context);
            console.log("template", questionList);

            try {
                console.log("")
                await saveToDatabase(null, questionList.databaseResult, "PreTest", null);

                clickTimesAndTimeList.push({ "PreTestClaimClickTime": clickTimes, "PreTestDurationTime": totalDurationTime })
                clickTimes = 0;
                totalDurationTime = 0;

            } catch (error) {
                msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                console.error("Failed to save data to database.", error);
                let reminder_one = "Failed to save data to database! Please submit again 😊"
                appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
                return; // This will stop the function execution if there is an error

            }

            //finish condition
            if (questionRound == 0) {
                pretestCompleted = true;
                endPretest = true;
                questionRound = 0;

                //First QuestionAndExplanation pop up
                updatePopupLineTitle(questionRoundToTitle(1));
                updateQuestionAndExplanationPopUpLine(initial_explanation);
                showPopupWithShortTimeout();
            }

        }
        else if (!endQuestionsAndExplanation) {

            if (appendConversationOpen) {
                if (checkWhetherAskEndConversation()) {
                    radioAnswers = [];
                    appendConversationOpen = false;

                    msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                    return;
                }
            }

            questionList = questionsAndExplanationAnswersToTemplate(radioAnswers, inputarea_context, reason_context, other_context, questionRound);
            console.log("template", questionList);

            if (!isError) {
                try {
                    await saveToDatabase(varExplanation, questionList.databaseResult, "QuestionsAndExplanation", "");
                    let round = questionRound + 1
                    clickTimesAndTimeList.push({ "Round": round, "QuestionsAndExplanationClickTimes": clickTimes, "QuestionsAndExplanationDurationTime": totalDurationTime })
                    clickTimes = 0;
                    totalDurationTime = 0;
                } catch (error) {
                    msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                    console.error("Failed to save data to database.", error);
                    let reminder_one = "Failed to save data to database! Please submit again 😊"
                    appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
                    return; // This will stop the function execution if there is an error
                }
            }


            //finish condition, jump to summaryquestions if it reaches requirements
            if (endConversation) {
                questionsAndExplanationCompleted = true;
                endQuestionsAndExplanation = true;
                pretestCompleted = false;
                // allowToCheck = false;
                endConversation = false;
                questionRound = 0;

                try {
                    await summaryExplanationResponse(questionCollection_id, allHistory, questionList.historyResult);
                    isError = false;
                } catch (error) {
                    msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                    isError = true;
                    appendMessage(
                        BOT_NAME,
                        BOT_IMG,
                        "left",
                        "Sorry, the AI is currently overloaded. Please try again later."
                    );
                    return; // This will stop the function execution if there is an error
                }

                userPreferenceExplanations.push(varExplanation);
                showPopupWithShortTimeout();
            }
            else {
                try {
                    await explanationResponse(questionCollection_id, initial_explanation, questionList.historyResult, allMessageExp, allHistory, questionRound);
                    isError = false;
                } catch (error) {
                    msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                    isError = true;
                    appendMessage(
                        BOT_NAME,
                        BOT_IMG,
                        "left",
                        "Sorry, the AI is currently overloaded. Please try again later."
                    );
                    return; // This will stop the function execution if there is an error
                }

                userPreferenceExplanations.push(varExplanation);
                showPopupWithShortTimeout();
                appendConversationOpen = true;

                questionRound++;
            }


        }
        else if (!endSummaryExplanation) {
            questionList = summaryExplanationAnswersToTemplate(radioAnswers);
            console.log("template", questionList);

            try {
                await saveToDatabase(varExplanation, questionList.databaseResult, "SummaryExplanation", "");

                clickTimesAndTimeList.push({ "SummaryExplanationClickTimes": clickTimes, "SummaryExplanationDurationTime": totalDurationTime })
                clickTimes = 0;
                totalDurationTime = 0;
            } catch (error) {
                msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                console.error("Failed to save data to database.", error);
                let reminder_one = "Failed to save data to database! Please submit again 😊"
                appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
            }

            //finish condition, jump to summaryquestions if it reaches requirements
            if (questionRound == 0) {
                summaryExplanationCompleted = true;
                questionsAndExplanationCompleted = false;
                endSummaryExplanation = true;
                questionRound = 0;

                updatePopupLineTitle("Three Explanations");
                userPreferencePopupContent(userPreferenceExplanations);
                showPopupWithLongTimeout();
            }

        }
        else if (!enduserPreferenceScore) {
            questionList = userPreferenceScoreAnswersToTemplate(radioAnswers);
            console.log("template", questionList);

            try {
                await saveToDatabase("", questionList.databaseResult, "UserPreferenceScore", userPreferenceExplanations);
                clickTimesAndTimeList.push({ "UserPreferenceClickTimes": clickTimes, "UserPreferenceDurationTime": totalDurationTime })
                clickTimes = 0;
                totalDurationTime = 0;
            } catch (error) {
                msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                console.error("Failed to save data to database.", error);
                let reminder_one = "Failed to save data to database! Please submit again 😊"
                appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
            }

            //finish condition, jump to summaryquestions if it reaches requirements
            if (questionRound == 0) {
                userPreferenceScoreCompleted = true;
                summaryExplanationCompleted = false;
                enduserPreferenceScore = true;
                questionRound = 0;

                resetPopupToInitialState();
                updateInitialPopUpLine();
                console.log("claim:", claim, "initial_explanation:", initial_explanation);
                //10秒後關掉claim的叉叉才會出來
                showPopupWithShortTimeout();
            }


        }
        else if (!endPosttest) {
            questionList = postTestToTemplate(radioAnswers);
            console.log("template", questionList);


            try {
                await saveToDatabase("", questionList.databaseResult, "PostTest", "");
                clickTimesAndTimeList.push({ "PostTestClaimClickTime": clickTimes, "PostTestDurationTime": totalDurationTime })
                clickTimes = 0;
                totalDurationTime = 0;

                console.log("buttonClickTimestamps", buttonClickTimestamps);
                await saveToDatabase("", buttonClickTimestamps, "TimeStamps", "");

                console.log("clickTimesAndTime", clickTimesAndTimeList);
                await saveToDatabase("", clickTimesAndTimeList, "ClickTimesAndTime", "");
            } catch (error) {
                msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button


                console.error("Failed to save data to database.", error);
                let reminder_one = "Failed to save data to database! Please submit again 😊"
                appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
                return; // This will stop the function execution if there is an error
            }
            //finish condition
            if (questionRound == 0) {
                posttestCompleted = true;
                userPreferenceScoreCompleted = false;
                endPosttest = true;
                questionRound = 0;
            }


        }

        msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button
        handleFormSubmit();
    }
});

//根據問題種類，給出不同問題
async function handleFormSubmit() {
    switch (true) {
        case pretestCompleted:
            msgerChat.innerHTML = "";
            inputarea_context = "";
            other_context = "";
            reason_context = "";
            radioAnswers = [];
            radioChecked = null;
            questionIds = [];

            if (questionRound < 2) {
                let reminder_one = `<span class="redFont">Please evaluate this explanation.</span>`
                appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
            }

            if (questionRound >= 2) {
                let reminder_one = `<span class="redFont">Please evaluate this explanation.</span>`
                appendMessage(BOT_NAME, BOT_IMG, "left", reminder_one);
                // allowToCheck = true;
            }

            //ask summaryExplanation questions
            askQuestionsAndExplanation(
                questionsAndExplanationQuestions,
                questionsAndExplanationOptions,
                BOT_IMG,
                PERSON_IMG,
                BOT_NAME,
                PERSON_NAME,
                questionRound
            );

            console.log("handleForSubmit_questionRound", questionRound);

            break;

        case questionsAndExplanationCompleted:
            msgerChat.innerHTML = "";
            inputarea_context = "";
            radioAnswers = [];
            radioChecked = null;
            questionIds = [];

            let reminder_two = `<span class="redFont">Please evaluate this explanation.</span>`
            appendMessage(BOT_NAME, BOT_IMG, "left", reminder_two);

            //ask summaryExplanation questions
            askSummaryExplanation(
                summaryExplanationQuestions,
                summaryExplanationOptions,
                BOT_IMG,
                PERSON_IMG,
                BOT_NAME,
                PERSON_NAME
            );

            break;

        case summaryExplanationCompleted:

            msgerChat.innerHTML = "";
            inputarea_context = "";
            radioAnswers = [];
            radioChecked = null;
            questionIds = [];

            // let reminder_three = "Please evaluate this explanation."
            // appendMessage(BOT_NAME, BOT_IMG, "left", reminder_three);

            //ask userPreferenceScore questions
            askUserPreferenceScore(
                userPreferenceScoreQuestions,
                userPreferenceScoreOptions,
                BOT_IMG,
                PERSON_IMG,
                BOT_NAME,
                PERSON_NAME
            );

            break;

        case userPreferenceScoreCompleted:
            msgerChat.innerHTML = "";
            inputarea_context = "";
            radioAnswers = [];
            radioChecked = null;
            questionIds = [];

            //ask post-test questions
            askPosttestQuestion(
                postTestOptionsQuestions,
                postTestOptions,
                BOT_IMG,
                PERSON_IMG,
                BOT_NAME,
                PERSON_NAME,
                questionRound
            )

            break;

        case posttestCompleted:
            msgerChat.innerHTML = "";
            inputarea_context = "";
            radioAnswers = [];
            radioChecked = null;
            questionIds = [];

            let finish_id = `Thank you for your participation in our study! <br>
            To receive your reward, please be sure to enter the completion code 
            <span style="font-style: italic; color: blue;">CQ7SEJM4</span> 
            into the following <a href=" https://app.prolific.co/submissions/complete?cc=CQ7SEJM4" target="_blank">Link</a> <br>
            We sincerely appreciate your involvement in our research.
            `;

            let finish_msg = `After entering your code into the link, press 'Submit' to leave!`

            appendMessage(BOT_NAME, BOT_IMG, "left", finish_id);
            // appendImage(BOT_NAME, BOT_IMG, "left", "static/images/finish_image.png")

            appendMessage(BOT_NAME, BOT_IMG, "left", finish_msg);

            posttestCompleted = false;

            //The End
            finish();
            finishedAll = true;
            // checkExplanations();

        default:

            break;
    }
}

//轉換格式的函數，目的是為了存進資料庫好看
function preTestToTemplate(radioAnswers, other_context) {
    let databaseResult = "";
    let historyResult = "";

    databaseResult = `Q1. ${radioAnswers[0]}, Q2. ${radioAnswers[1]}, Q3. ${radioAnswers[2]}, Q4. ${preTestOptions[3][radioAnswers[3] - 1]}, Q5. ${preTestOptions[4][radioAnswers[4] - 1]} ${other_context}`;
    historyResult = `Q1. ${radioAnswers[0]}, Q2. ${radioAnswers[1]}, Q3. ${radioAnswers[2]}, Q4. ${preTestOptions[3][radioAnswers[3] - 1]}, Q5. ${preTestOptions[4][radioAnswers[4] - 1]} ${other_context}`;

    return { databaseResult, historyResult };
}

function postTestToTemplate(radioAnswers) {
    let databaseResult = "";
    let historyResult = "";

    databaseResult = `Q1. ${radioAnswers[0]}, Q2. ${radioAnswers[1]}`;
    historyResult = `Q1. ${radioAnswers[0]}, Q2. ${radioAnswers[1]}`;

    return { databaseResult, historyResult };
}

function questionsAndExplanationAnswersToTemplate(radioAnswers, inputarea_context, reason_context, other_context, questionRound) {

    let baseQuestions = "";
    let baseHistory = "";
    if (questionRound == 1) {
        baseQuestions = `Attention: ${radioAnswers[0]}, Persuasiveness: ${radioAnswers[1]}, Logical Correctness: ${radioAnswers[2]}, Completeness: ${radioAnswers[3]}, Conciseness: ${radioAnswers[4]}, Agreement: ${radioAnswers[5]}, Aspect: ${questionsAndExplanationOptions[5][radioAnswers[5] - 1]} ${other_context}, Question: ${inputarea_context}`;
        baseHistory = `Persuasiveness: ${radioAnswers[1]}, Logical Correctness: ${radioAnswers[2]}, Completeness: ${radioAnswers[3]}, Conciseness: ${radioAnswers[4]}, Agreement: ${radioAnswers[5]}, Aspect: ${questionsAndExplanationOptions[5][radioAnswers[5] - 1]} ${other_context}, Question: ${inputarea_context}`;
    }
    else {
        baseQuestions = `Persuasiveness: ${radioAnswers[0]}, Logical Correctness: ${radioAnswers[1]}, Completeness: ${radioAnswers[2]}, Conciseness: ${radioAnswers[3]}, Agreement: ${radioAnswers[4]}, Aspect: ${questionsAndExplanationOptions[5][radioAnswers[5] - 1]} ${other_context}, Question: ${inputarea_context}`;
        baseHistory = `Persuasiveness: ${radioAnswers[0]}, Logical Correctness: ${radioAnswers[1]}, Completeness: ${radioAnswers[2]}, Conciseness: ${radioAnswers[3]}, Agreement: ${radioAnswers[4]}, Aspect: ${questionsAndExplanationOptions[5][radioAnswers[5] - 1]} ${other_context}, Question: ${inputarea_context}`;
    }


    const reasonText = reason_context ? `, End Conversation Reason: ${reason_context}` : ``;

    const databaseResult = `${baseQuestions}${reasonText}`;
    const historyResult = `${baseHistory}`;

    return { databaseResult, historyResult };
}


function summaryExplanationAnswersToTemplate(radioAnswers) {

    const databaseResult = `Persuasiveness: ${radioAnswers[0]}, Logical Correctness: ${radioAnswers[1]}, Completeness: ${radioAnswers[2]}, Conciseness: ${radioAnswers[3]}, Agreement: ${radioAnswers[4]}`;
    const historyResult = `Persuasiveness: ${radioAnswers[0]}, Logical Correctness: ${radioAnswers[1]}, Completeness: ${radioAnswers[2]}, Conciseness: ${radioAnswers[3]}, Agreement: ${radioAnswers[4]}`;

    return { databaseResult, historyResult };
}

function userPreferenceScoreAnswersToTemplate(radioAnswers) {

    let databaseResult = `Q1. ${radioAnswers[0]}, Q2. ${radioAnswers[1]}`;
    let historyResult = `Q1. ${radioAnswers[0]}, Q2. ${radioAnswers[1]}`;

    return { databaseResult, historyResult };
}
/////////////

/*get explanationResponse 傳到後端，讓gpt4生出每一輪新的解釋*/
async function explanationResponse(id, previous_exp, question_list, message_exp, history, questionRound) {
    showLoadingIcon(); // Show loading icon

    // show second round explanation
    let title = questionRoundToTitle(questionRound + 2)
    // console.log(id, previous_exp, question_list, is_first_time, message_exp, history);

    const url = "getExplanationResponse";
    const data = {
        id: id,
        previous_exp: previous_exp,
        question_list: question_list,
        message_exp: message_exp,
        history: history,
        question_round: questionRound
    };

    // Return the promise
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                appendPopupContent(title, data.explanationResponse);
                updatePopupLineTitle(title);
                varExplanation = data.explanationResponse;
                console.log("data.explanationResponse", data.explanationResponse);
                console.log("title", title);
                console.log("allHistory", allHistory);
                allHistory = data.recordHistory;
                console.log("allHistory", allHistory);
                allMessageExp = data.recordMessageExp;
                console.log("allMessageExp", allMessageExp);
                resolve();  // Resolve the promise
            })
            .catch(error => {
                console.error("Request failed: " + error.message);
                throw new Error("Request failed: " + error.message);
            })
            .finally(() => {
                hideLoadingIcon(); // Hide loading icon
            });
    });
}


/*get summaryExplanationResponse 傳到後端，讓gpt4生出總結解釋**/
async function summaryExplanationResponse(id, history, question_list) {
    showLoadingIcon(); // Show loading icon

    const url = "getSummaryExplanationResponse";
    const data = {
        id: id,
        history: history,
        question_list: question_list
    };

    // return the promise
    return new Promise((resolve, reject) => {
        fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                appendPopupContent("Summary Explanation", data.finalExplanationContentget);
                updatePopupLineTitle("Summary Explanation");
                varExplanation = data.finalExplanationContentget;
                console.log("Summary explanationResponse: ", data.finalExplanationContentget);
                console.log("allHistory", allHistory);
                allHistory = data.recordHistory;
                console.log("allHistory", allHistory);
                resolve(data); // This will "complete" the promise when the data has been handled.
            })
            .catch(error => {
                console.error("Request failed: " + error.message);
                throw new Error("Request failed: " + error.message);
            })
            .finally(() => {
                hideLoadingIcon(); // Hide loading icon
            });
    });
}

// convert number of round to str round 每一輪的title的名稱轉換
function questionRoundToTitle(questionRound) {
    switch (questionRound) {
        case 1:
            return "First Explanation";
        case 2:
            return "Second Explanation";
        case 3:
            return "Third Explanation";
        case 4:
            return "Fourth Explanation";
        case 5:
            return "Fifth Explanation";
        case 6:
            return "Sixth Explanation";
        case 7:
            return "Seventh Explanation";
        case 8:
            return "Eighth Explanation";
        case 9:
            return "Ninth Explanation";
        case 10:
            return "Tenth Explanation";
        case 11:
            return "Eleventh Explanation";
        case 12:
            return "Twelfth Explanation";
        case 13:
            return "Thirteenth Explanation";
        case 14:
            return "Fourteenth Explanation";
        case 15:
            return "Fifteenth Explanation";
        default:
            return "Invalid round Explanation";
    }
}


// 判斷是否達到提前離開解釋的標準，或是最後如何結束.
function checkWhetherAskEndConversation() {
    // Only consider the first 5 elements from radioAnswers for our checks
    const relevantAnswers = radioAnswers.slice(0, 5);

    const hasRatingBelow4 = relevantAnswers.some((radioAnswer) => radioAnswer < 4);
    const hasAtLeastOne5 = relevantAnswers.includes(5);

    console.log("!hasRatingBelow4", !hasRatingBelow4);
    console.log("hasAtLeastOne5", hasAtLeastOne5);
    console.log(questionRound);

    if (questionRound >= 14) {
        endConversation = true;
        return false;
    } else if (questionRound >= 4 && questionRound < 14) {
        appendEndConversation(BOT_NAME, BOT_IMG, "left", "EndConversation");
        appendConversationOpen = false;
        return true;
    } else if (!hasRatingBelow4 && hasAtLeastOne5 && questionRound >= 2) {
        appendEndConversation(BOT_NAME, BOT_IMG, "left", "EndConversation");
        appendConversationOpen = false;
        return true;
    }
    else {
        return false;
    }
}


// Check all data and then store in database 每一輪使用者輸入答案後，都會在這裡確定使否每一個值都有填到
function checkData() {
    // Check if all ids are defined
    const areAllIdsDefined = questionIds.every(id => id !== undefined);

    if (!areAllIdsDefined) {
        console.error('One or more formId is undefined!');
        return;
    }

    const areAllFormsFilled = questionIds.every((formId) => {
        // console.log("check data id :", formId );
        const form = document.getElementById(formId);

        // Check if form is not null
        if (!form) {
            console.error(`No form with id: ${formId}`);
            return false;
        }

        const radioChecked = form.querySelector("input[type='radio']:checked");
        const otherTextChecked = form.querySelector("input[type='text']");

        if (radioChecked) {
            console.log("radioChecked.value", radioChecked.value);
        }
        else if (otherTextChecked) {
            console.log("otherTextChecked.value", otherTextChecked.value);
        }

        // If either radio button or text area has a value, return true
        if (radioChecked) {
            if (radioChecked.id.startsWith("RadioCheck-") && radioChecked.value.trim() !== "") {
                if (radioChecked.value == "Other") {
                    if (otherTextChecked) {
                        if (otherTextChecked.value.trim() == "") {
                            return false;
                        }
                        else {
                            other_context = otherTextChecked.value.trim();
                            return true;
                        }
                    }
                }

                if (radioChecked.value == "Yes") {
                    if (otherTextChecked) {
                        if (otherTextChecked.value.trim() !== "") {
                            reason_context = otherTextChecked.value.trim();
                            endConversation = true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                }
                return true;
            }
        }
        else if (formId.startsWith("TextArea-") && inputarea_context.trim() !== "") {
            return true;
        }

        return false;
    });

    if (!areAllFormsFilled) {
        msgerForm.querySelector(".msger-send-btn").disabled = false; // activate the send button
        // If any form is not filled, handle it here
        appendMessage(
            BOT_NAME,
            BOT_IMG,
            "left",
            "❗❗Please ensure that all forms have been filled out with data."
        );

        return false;
    } else {
        questionIds.forEach((formId) => {
            const form = document.getElementById(formId);
            if (form) {
                const radioChecked = form.querySelector("input[type='radio']:checked");

                if (radioChecked) {
                    console.log("save checkvalue", radioChecked.value);
                    radioAnswers.push(convertFirstNumberToNumber(radioChecked.id));
                }

                // Disable all inputs and textareas inside the form
                const allInputsAndTextareas = form.querySelectorAll("input, textarea");
                allInputsAndTextareas.forEach(element => {
                    element.disabled = true;
                });
            }
        });

        console.log("radioAnswers", radioAnswers)

        return true;

    }
}

//將選擇題的答案從html中轉換出來
function convertFirstNumberToNumber(str) {
    const regex = /\d+/; // Regular expression to match numbers
    const match = str.match(regex); // Find the first number text

    if (match) {
        const firstNumberText = match[0]; // Get the first number text
        const number = parseInt(firstNumberText, 10); // Convert the number text to a number

        return number;
    }

    return null; // Return null or appropriate value if no number is found
}


// Ask a series of questions for pre-test 每一輪pre-test得問題
function askPretestQuestion(
    questions,
    options,
    BOT_IMG,
    PERSON_IMG,
    BOT_NAME,
    PERSON_NAME,
    questionRound,
    questionIndex = 0
) {
    if (questionIndex >= questions.length) {
        return;
    }



    console.log("questionIndex", questionIndex);

    const question = `Q${questionIndex + 1}. ${questions[questionIndex]}`;
    const oneOptions = options[questionIndex];
    let timeStampName = `Q${questionIndex + 1}. PretestQuestion`

    appendExplanationQuestions(BOT_NAME, BOT_IMG, "left", question, oneOptions, timeStampName).then((answer) => {

        console.log(`Answer ${questionIndex + 1}: ${answer}`);

        // Recursively call to continue asking the next question
        askPretestQuestion(
            questions,
            options,
            BOT_IMG,
            PERSON_IMG,
            BOT_NAME,
            PERSON_NAME,
            questionRound,
            questionIndex + 1
        );
    });
}

// Ask a series of questions for askQuestionsAndExplanation 每一輪解釋的問題
function askQuestionsAndExplanation(
    questions,
    options,
    BOT_IMG,
    PERSON_IMG,
    BOT_NAME,
    PERSON_NAME,
    questionRound,
    questionIndex = 0
) {

    let finalQuestion = "";
    let question = "";
    let oneOptions = "";
    let timeStampName = "";

    if (questionRound == 1) {
        if (questionIndex >= questions.length + 1) {

            finalQuestion = `Q8. Ask a question to explainer {based on your selection (Q7.)} Make sure your question doesn't share similar meanings with previous questions. Please ensure it consists of more than one word, is a complete question.`

            appendMessage(BOT_NAME, BOT_IMG, "left", finalQuestion);
            // When the question index exceeds the number of options, it means all questions have been answered, perform the final response
            appendTextAreaResponse(PERSON_NAME, PERSON_IMG, "right");

            return;
        }

        if (questionIndex == 0) {
            question = `Q${questionIndex + 1}. Please select "Definitely yes" so that we know you are paying attention in the survey.`;
            oneOptions = options[0];
            timeStampName = `Q${questionIndex + 1}. QuestionsAndExplanation Round:${questionRound + 1}`
        }
        else {
            let currentQuestion = questions[questionIndex - 1];
            //更換每一輪explanation的前綴
            if (questions[questionIndex - 1].includes('explanation')) {
                currentQuestion = questions[questionIndex - 1].replace('explanation', questionsAndExplanationRound[questionRound]);
            }

            question = `Q${questionIndex + 1}. ${currentQuestion}`;
            oneOptions = options[questionIndex - 1];
            timeStampName = `Q${questionIndex + 1}. QuestionsAndExplanation Round:${questionRound + 1}`
        }
    }
    else {
        if (questionIndex >= questions.length) {

            finalQuestion = `Q7. Ask a question to explainer {based on your selection (Q6.)} Make sure your question doesn't share similar meanings with previous questions. Please ensure it consists of more than one word, is a complete question.`

            appendMessage(BOT_NAME, BOT_IMG, "left", finalQuestion);
            // When the question index exceeds the number of options, it means all questions have been answered, perform the final response
            appendTextAreaResponse(PERSON_NAME, PERSON_IMG, "right");

            return;
        }

        console.log("questionIndex", questionIndex);

        let currentQuestion = questions[questionIndex];
        //更換每一輪explanation的前綴
        if (questions[questionIndex].includes('explanation')) {
            currentQuestion = questions[questionIndex].replace('explanation', questionsAndExplanationRound[questionRound]);
        }

        question = `Q${questionIndex + 1}. ${currentQuestion}`;
        oneOptions = options[questionIndex];
        timeStampName = `Q${questionIndex + 1}. QuestionsAndExplanation Round:${questionRound + 1}`
    }

    appendExplanationQuestions(BOT_NAME, BOT_IMG, "left", question, oneOptions, timeStampName).then((answer) => {
        console.log(`Answer ${questionIndex + 1}: ${answer}`);



        // Recursively call to continue asking the next question
        askQuestionsAndExplanation(
            questions,
            options,
            BOT_IMG,
            PERSON_IMG,
            BOT_NAME,
            PERSON_NAME,
            questionRound,
            questionIndex + 1
        );
    });
}


// Ask a series of questions for askSummaryExplanation 每一輪總結的問題
function askSummaryExplanation(
    questions,
    options,
    BOT_IMG,
    PERSON_IMG,
    BOT_NAME,
    PERSON_NAME,
    questionIndex = 0
) {
    if (questionIndex >= questions.length) {
        return;
    }
    else {
        const question = `Q${questionIndex + 1}. ${questions[questionIndex]}`;
        const oneOptions = options[questionIndex];
        let timeStampName = `Q${questionIndex + 1}. SummaryExplanation`

        appendExplanationQuestions(BOT_NAME, BOT_IMG, "left", question, oneOptions, timeStampName).then((answer) => {
            console.log(`Answer ${questionIndex + 1}: ${answer}`);

            // Recursively call to continue asking the next question
            askSummaryExplanation(
                questions,
                options,
                BOT_IMG,
                PERSON_IMG,
                BOT_NAME,
                PERSON_NAME,
                questionIndex + 1
            )
        });
    }
}


// Ask a series of questions for askUserPreferenceScore 每一輪userPreference的問題
function askUserPreferenceScore(
    questions,
    options,
    BOT_IMG,
    PERSON_IMG,
    BOT_NAME,
    PERSON_NAME,
    questionIndex = 0
) {
    if (questionIndex >= questions.length) {
        return;
    }
    else {
        const question = `Q${questionIndex + 1}. ${questions[questionIndex]}`;
        let timeStampName = `Q${questionIndex + 1}. UserPreference`

        appendUserPreferenceQuestions(BOT_NAME, BOT_IMG, "left", question, options, timeStampName).then((answer) => {
            console.log(`Answer ${questionIndex + 1}: ${answer}`);

            // Recursively call to continue asking the next question
            askUserPreferenceScore(
                questions,
                options,
                BOT_IMG,
                PERSON_IMG,
                BOT_NAME,
                PERSON_NAME,
                questionIndex + 1
            )
        });
    }
}

// Ask a series of questions for post-test 每一輪post-test得問題
function askPosttestQuestion(
    questions,
    options,
    BOT_IMG,
    PERSON_IMG,
    BOT_NAME,
    PERSON_NAME,
    questionRound,
    questionIndex = 0
) {
    if (questionIndex >= questions.length) {
        return;
    }

    console.log("questionIndex", questionIndex);

    const question = `Q${questionIndex + 1}. ${questions[questionIndex]}`;
    const oneOptions = options[questionIndex];
    let timeStampName = `Q${questionIndex + 1}. PosttestQuestion`

    appendExplanationQuestions(BOT_NAME, BOT_IMG, "left", question, oneOptions, timeStampName).then((answer) => {
        console.log(`Answer ${questionIndex + 1}: ${answer}`);

        // Recursively call to continue asking the next question
        askPosttestQuestion(
            questions,
            options,
            BOT_IMG,
            PERSON_IMG,
            BOT_NAME,
            PERSON_NAME,
            questionRound,
            questionIndex + 1
        );
    });
}

function appendMessage(name, img, side, text) {
    // const escapedText = escapeHtml(text);
    // const formattedText = escapedText.replace(/\n/g, "<br>");

    let colorText = highlightText(text);
    console.log("colorText", colorText);


    const msgHTML = `
<div class="msg ${side}-msg">
    <div class="msg-img" style="background-image: url(${img})"></div>
    <div class="msg-bubble">
        <div class="msg-info">
            <div class="msg-info-name">${name}</div>
            <div class="msg-info-time">${formatDate(new Date())}</div>
        </div>
        <div class="msg-info-text">${colorText}</div>
    </div>
</div>
`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
}

function appendEndConversation(name, img, side, timeStampName) {
    return new Promise((resolve) => {
        let text = "Would you like to end this conversation?";
        let options = ["Yes", "No"];

        const formId = `RadioCheck-EndConversationID`;
        questionIds.push(formId);
        let optionHTML = "";

        if (options.length > 0) {
            optionHTML = `<form id="${formId}">`;
            for (let i = 0; i < options.length; i++) {
                const optionId = `RadioCheck-${i + 1}option${formId}`;
                questionOptionIds.push(optionId);

                //如果有Yes的選項，當點下Yes的時候，應該有一欄填空讓使用者填寫
                if (options[i] === "Yes") {
                    optionHTML += `
                    <input type="radio" id="${optionId}" name="option" value="${options[i]}">
                    <label for="${optionId}">${options[i]}</label>
                    <input type="text" id="${optionId}Text" style="display:none; width:250px;" placeholder="please specify your reason">
                    <br>
                    `;
                } else {
                    optionHTML += `
                    <input type="radio" id="${optionId}" name="option" value="${options[i]}">
                    <label for="${optionId}">${options[i]}</label>
                    <br>
                    `;
                }
            }

            optionHTML += "</form>";
        }

        const msgHTML = `
            <div class="msg ${side}-msg">
                <div class="msg-img" style="background-image: url(${img})"></div>
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">${name}</div>
                        <div class="msg-info-time">${formatDate(new Date())}</div>
                    </div>
                    <div id="chatContainer" class="msg-info-text">${text}</div>
                    <div id="chatContainer" >${optionHTML}</div>
                </div>
            </div>
        `;

        msgerChat.insertAdjacentHTML("beforeend", msgHTML);
        msgerChat.scrollTop += 500;


        document.getElementById(formId).addEventListener("change", function (e) {
            // Prevent the form from submitting normally
            e.preventDefault();
            recordTimestamp(1, timeStampName);


            const otherInput = document.getElementById(e.target.id + "Text");

            if (e.target.value === "Yes") {
                otherInput.style.display = "inline-block";
                // otherInput.focus();

                document.getElementById(formId).addEventListener("submit", function (e) {
                    e.preventDefault(); // This prevents the form from submitting
                    if (otherInput.value.trim() !== "") {
                    }
                });
            }

            const selectedOption = this.querySelector('input[type="radio"]:checked').value;
            resolve(selectedOption);
        });
    });
}



function appendImage(name, img, side, imageUrl) {
    const msgHTML = `
    <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
            </div>
            <div class="msg-info-text">
                <img src="${imageUrl}" style="width: 100%; height: auto;" />
            </div>
        </div>
    </div>
    `;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;
}

function appendTextAreaResponse(name, img, side) {
    const textareaId = `TextArea-${Math.random().toString(36)}`;
    // console.log("textareaId :", textareaId);

    questionIds.push(textareaId);

    const msgHTML = `
    <div class="msg ${side}-msg">
        <div class="msg-img" style="background-image: url(${img})"></div>
        <div class="msg-bubble">
            <div class="msg-info">
                <div class="msg-info-name">${name}</div>
                <div class="msg-info-time">${formatDate(new Date())}</div>
            </div>
            <textarea class="msg-text" id="${textareaId}" style="height: 200px;" placeholder="Ensure it consists of more than one word, is a complete question!"></textarea>
        </div>
    </div>
`;

    msgerChat.insertAdjacentHTML("beforeend", msgHTML);
    msgerChat.scrollTop += 500;

    // Set the textarea height to fit its content
    const textarea = document.getElementById(textareaId);
    textarea.style.height = `${textarea.scrollHeight}px`;

    // Store input data
    textarea.addEventListener("input", function () {
        inputarea_context = this.value;
    });
}

function highlightText(inputString) {
    // 使用正则表达式匹配两个大括号之间的任意字符
    const regex = /\{(.*?)\}/g;

    // 替换找到的模式为带有<span>标签的字符串
    const highlightedString = inputString.replace(regex, '<span class="highlight">$1</span>');

    // 返回替换后的字符串
    return highlightedString;
}

function handleOtherOptionInput(optionId) {
    const textInput = document.getElementById(`${optionId}Text`);
    const radioInput = document.getElementById(optionId);

    // Enable the radio button as soon as there is text
    radioInput.disabled = textInput.value.trim() === "";
}

// Ask questions 新增解釋問題
function appendExplanationQuestions(name, img, side, text, options, timeStampName) {
    return new Promise((resolve) => {
        const formId = `RadioCheck-explanationForm${Math.random().toString(36)}`;
        questionIds.push(formId);
        let optionHTML = "";

        if (options && options.length > 0) {
            optionHTML = `<form id="${formId}">`;
            for (let i = 0; i < options.length; i++) {
                const optionId = `RadioCheck-${i + 1}option${formId}`;
                questionOptionIds.push(optionId);

                if (options[i] === "Other") {
                    optionHTML += `
                    <input type="radio" id="${optionId}" name="option" value="${options[i]}" disabled>
                    <label for="${optionId}">${options[i]}</label>
                    <input type="text" id="${optionId}Text" style="width:100%; max-width:250px; font-size:16px;" placeholder="Please specify... and click Other">
                    <br>
                    `;
                } else {
                    optionHTML += `
                    <input type="radio" id="${optionId}" name="option" value="${options[i]}">
                    <label for="${optionId}">${options[i]}</label>
                    <br>
                    `;
                }
            }
            optionHTML += "</form>";
        }

        let colorText = highlightText(text);
        console.log("colorText", colorText);

        const msgHTML = `
            <div class="msg ${side}-msg">
                <div class="msg-img" style="background-image: url(${img})"></div>
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">${name}</div>
                        <div class="msg-info-time">${formatDate(new Date())}</div>
                    </div>

                    <div id="chatContainer" class="msg-info-text">
                       ${colorText}
                    </div>

                    <div id="chatContainer" >${optionHTML}</div>
                </div>
            </div>
        `;

        msgerChat.insertAdjacentHTML("beforeend", msgHTML);
        msgerChat.scrollTop += 500;

        document.body.addEventListener('input', function (event) {
            if (event.keyCode === 13) {
                event.preventDefault();
            }

            if (event.target.id.endsWith('Text') && event.target.type === 'text') {
                var optionId = event.target.id.replace('Text', '');
                handleOtherOptionInput(optionId);
            }
        });

        document.getElementById(formId).addEventListener("submit", function (e) {
            e.preventDefault(); // This prevents the form from submitting
        });

        document.getElementById(formId).addEventListener("change", function (e) {
            // Prevent the form from submitting normally
            e.preventDefault();

            const selectedRadio = this.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                const selectedOption = selectedRadio.value;
                recordTimestamp(1, timeStampName);
                resolve(selectedOption);
            }
        });
    });
}



// Ask questions 新增問題UserPreference問題的函數
function appendUserPreferenceQuestions(name, img, side, text, options, timeStampName) {
    return new Promise((resolve) => {
        const formId = `RadioCheck-userPreferenceForm${Math.random().toString(36)}`;
        // console.log("formId :", formId);

        questionIds.push(formId);

        let optionHTML = "";
        if (options && options.length > 0) {
            optionHTML = `<form id="${formId}">`;
            for (let i = 0; i < options.length; i++) {
                const optionId = `RadioCheck-${i + 1}option${formId}`;
                questionOptionIds.push(optionId);
                optionHTML += `
                <input type="radio" id="${optionId}" name="option" value="${options[i]}">
                <label for="${optionId}">${options[i]}</label><br>
                `;
            }
            optionHTML += "</form>";
        }

        let colorText = highlightText(text);

        const msgHTML = `
            <div class="msg ${side}-msg">
                <div class="msg-img" style="background-image: url(${img})"></div>
                <div class="msg-bubble">
                    <div class="msg-info">
                        <div class="msg-info-name">${name}</div>
                        <div class="msg-info-time">${formatDate(new Date())}</div>
                    </div>
                    <div id="chatContainer" class="msg-info-text">${colorText}</div>
                    <div id="chatContainer" >${optionHTML}</div>
                </div>
            </div>
        `;

        // console.log(formId);

        msgerChat.insertAdjacentHTML("beforeend", msgHTML);
        msgerChat.scrollTop += 500;

        // Add event listener to the form to resolve the promise when an option is selected
        document.getElementById(formId).addEventListener("change", function (e) {
            // Prevent the form from submitting normally
            e.preventDefault();

            const selectedRadio = this.querySelector('input[type="radio"]:checked');
            if (selectedRadio) {
                const selectedOption = selectedRadio.value;
                recordTimestamp(1, timeStampName);
                resolve(selectedOption);
            }
        });
    });
}

/* update Popup */

//initial claim and explanation according to the url ids
function updateInitialPopUpLine() {
    const popupScroll = document.querySelector('.popup-scroll');
    const popupLines = popupScroll.querySelectorAll('.popup-line');

    popupLines.forEach(line => {
        // 檢查是否為 "Claim" 部分
        const isClaim = line.querySelector('h2').textContent.trim() === 'Claim';
        // 檢查是否為 "Read 'Claim' for 10 Seconds" 部分
        const isReadClaim = line.querySelector('h2').textContent.trim() === 'Read "Claim" for 10 Seconds';

        if (isClaim) {
            // 在 <p> 中插入 "claim"
            const pElement = line.querySelector('p');
            if (pElement) {
                pElement.textContent = claim; // 或者使用 pElement.textContent = claim; 如果 'claim' 是一個變數
            }
        } else if (!isReadClaim) {
            // 如果不是 "Claim" 也不是 "Read 'Claim' for 10 Seconds"，則清空該行的內容
            const h2Element = line.querySelector('h2');
            const pElement = line.querySelector('p');
            if (h2Element) {
                h2Element.textContent = '';
            }
            if (pElement) {
                pElement.textContent = '';
            }
        }
    });
}

//update claim and explanations of updateQuestionAndExplanation
function updateQuestionAndExplanationPopUpLine(initial_explanation) {
    // 找到 popup-scroll 元素
    const popupScroll = document.querySelector('.popup-scroll');

    // 創建新的 .popup-line 元素
    const newPopupLine = document.createElement('div');
    newPopupLine.classList.add('popup-line');

    // 創建新的 h2 元素
    const newH2 = document.createElement('h2');
    newH2.style.color = 'red';
    newH2.textContent = 'First Explanation';
    newPopupLine.appendChild(newH2);

    // 創建新的 p 元素
    const newP = document.createElement('p');
    newP.textContent = initial_explanation; // 設定 p 元素的內容
    newPopupLine.appendChild(newP);

    // 將新的 .popup-line 元素添加到 popup-scroll 的末尾
    if (popupScroll) {
        popupScroll.appendChild(newPopupLine);
    }
}

//set title of userPreference
function updatePopupLineTitle(questionNumber) {
    var h2Title = document.querySelectorAll('.popup-line h2')[0];

    if (questionNumber == 'Three Explanations') {
        h2Title.textContent = `Read "Claim" & "${questionNumber}" for 20 Seconds`
    }
    else {
        h2Title.textContent = `Read "Claim" & "${questionNumber}" for 10 Seconds`
    }
}
//set the topest explanation red
function appendPopupContent(title, explanation) {

    let msgHTML = "";

    if (title == "Summary Explanation") {
        msgHTML = `
        <div class="popup-line">
            <h2 style="color: yellow; font-size: 20px;">*Note that the following summary explanation is generated based on your chat history (scores and questions) by ExplainerGPT.</h2>
            <!-- Title -->
            <h2 style="color: red;">${title}</h2>
            <!-- Explanation -->
            <p>${explanation}</p>
        </div>
    `;
    }
    else {
        msgHTML = `
        <div class="popup-line">
            <h2 style="color: yellow; font-size: 20px;">Explanation in each round is independent from each other. Please evaluate them separately.</h2>
            <!-- Title -->
            <h2 style="color: red;">${title}</h2>
            <!-- Explanation -->
            <p>${explanation}</p>
        </div>
    `;
    }

    // Get the popup div element.
    var popupDiv = document.querySelector('#popup');
    if (!popupDiv) {
        console.log('Popup div not found');
        return;
    }

    // Get all the 'popup-line' div elements inside 'popup' div.
    var popupLineDivs = popupDiv.querySelectorAll('.popup-line');
    if (popupLineDivs.length < 3) {
        console.log('Less than 3 popup-line divs found');
        return;
    }

    // Get all h2 elements in the third 'popup-line' div
    var h2ElementsInThirdPopupLine = popupLineDivs[2].querySelectorAll('h2');

    // Check if there are more than one h2 elements
    if (h2ElementsInThirdPopupLine.length > 1) {
        // Loop through all but the last h2 element
        for (let i = 0; i < h2ElementsInThirdPopupLine.length - 1; i++) {
            // Remove the h2 element from the document
            h2ElementsInThirdPopupLine[i].remove();
        }
    }

    // Now, get the remaining (or the only) h2 element in the third 'popup-line' div
    var lastH2Element = popupLineDivs[2].querySelector('h2');

    // If there is an h2 element, change its color to white
    if (lastH2Element) {
        lastH2Element.style.color = 'white';
    }

    // Then, insert the new content before the 'Initial Explanation' div
    popupLineDivs[2].insertAdjacentHTML("beforebegin", msgHTML);
}

//set claim and explanations of userPreference
function userPreferencePopupContent(userPreferenceExplanations) {
    const msgHTML = `
        <div class="popup-line">
            <!-- Title -->
            <h2>Claim</h2>
            <!-- Explanation -->
            <p>${claim}</p>
        </div>
        <div class="popup-line">
            <!-- Title -->
            <h2>Summary Explanation</h2>
            <!-- Explanation -->
            <p>${userPreferenceExplanations[userPreferenceExplanations.length - 1]}</p>                    
        </div>
        <div class="popup-line">
            <!-- Title -->
            <h2> Last Round Explanation</h2>
            <!-- Explanation -->
            <p>${userPreferenceExplanations[userPreferenceExplanations.length - 2]}</p>
        </div>
        <div class="popup-line">
            <!-- Title -->
            <h2>First Explanation</h2>
            <!-- Explanation -->
            <p>${userPreferenceExplanations[0]}</p>
        </div>
    `;

    // Find the 'Claim' div element.
    var claimDiv = document.querySelector('.popup-scroll > .popup-line');

    if (!claimDiv) {
        console.log('Claim div not found');
        return;
    }

    // Get the parent of the 'claimDiv'
    var parentDiv = claimDiv.parentNode;

    // Remove all following siblings of 'claimDiv'
    while (claimDiv.nextElementSibling) {
        parentDiv.removeChild(claimDiv.nextElementSibling);
    }

    // Insert the new content after the 'Claim' div.
    claimDiv.insertAdjacentHTML("afterend", msgHTML);
}

function resetPopupToInitialState() {
    // 取得 popup 元素
    const popup = document.getElementsByClassName('popup-content')[0];

    // 定義你想要的初始內容
    const initialContent = `
          <div class="popup-scroll">
            <div class="popup-line">
              <!-- Before summary Explanation: -->
              <h2 style="color: red;">Read "Claim" for 10 Seconds</h2>
            </div>
            <div class="popup-line">
              <!-- claim -->
              <h2 style="color: red;">Claim</h2>
              <!-- claim content -->
              <p></p>
            </div>
          </div>
    `;

    // 將初始內容設定為 popup 的 innerHTML
    popup.innerHTML = initialContent;
}


//According different questionType, save data into database. 資料庫存取資料的API
async function saveToDatabase(explanation, questionList, questionType, userPreferenceExplanations) {
    const payload = {
        explanation: explanation,
        questionList: questionList,
        questionType: questionType,
        userPreferenceExplanations: userPreferenceExplanations
    };

    const response = await fetch('save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (response.ok) {
        console.log("Data successfully saved to database.");
    } else {
        console.error("Failed to save data to database.");
        throw new Error("Failed to save data to database.");
    }
}


function returnSignup() {
    fetch('returnSignup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        // Check if the response is a redirect
        if (response.redirected) {
            // Redirect the browser to the response's URL
            window.location.href = response.url;
        } else {
            // Handle non-redirect responses (e.g., errors)
            if (response.headers.get("content-type") === "application/json") {
                return response.json();
            } else {
                return response.text();
            }
        }
    })
    .then(data => {
        // Handle the data from the response (if not a redirect)
        console.log('Success:', data);
    })
    .catch((error) => {
        // Handle errors
        console.error('Error:', error);
    });
}

function finish() {
    fetch('finish', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        // Handle non-redirect responses (e.g., errors)
        if (response.headers.get("content-type") === "application/json") {
            return response.json();
        } else {
            return response.text();
        }
    })
    .then(data => {
        // Handle the data from the response (if not a redirect)
        console.log('Success:', data);
    })
    .catch((error) => {
        // Handle errors
        console.error('Error:', error);
    });
}


// //確認有沒有存到
// function checkExplanations() {
//     fetch('check_explanations', { method: 'GET' })
//         .then(response => response.json())
//         .then(data => {
//             // Check the 'message' property in the response
//             if (data.message === "Update successful.") {
//                 console.log("Survey is finished");
//             } else {
//                 // If the message is not "Update successful.", something went wrong
//                 console.log("Survey is not finished yet or there was an error");
//                 console.error('Error:', data.message);
//             }
//         })
//         .catch((error) => {
//             console.error('Fetch Error:', error);
//         });
// }




// timestamp
function recordTimestamp(shouldRecord, stringParam) {
    if (shouldRecord === 1) {
        timestamp = new Date();
        buttonClickTimestamps.push({ stringParam, timestamp });
        console.log(`Button clicked with param: ${stringParam} at: ${timestamp}`);
    }
}

function handleButtonClick() {
    if (canClose) {
        recordTimestamp(1, 'close');
        // After recording the timestamp, remove the event listener
        button.removeEventListener('click', handleButtonClick);
    }
}

/* button element */
let canClose;
let button = document.getElementById('close-btn');

function showPopupWithShortTimeout() {
    // Initially, let the popup appear
    $("#popup").fadeIn();

    // Initially, set it so that it cannot be closed
    canClose = false;
    $("#close-btn").fadeOut();

    startTime = getCurrentTimeInSeconds();
    console.log("popup: startTime", startTime);

    // After 10 seconds, allow the popup to be closed and show the close button
    setTimeout(function () {
        canClose = true;
        $("#close-btn").fadeIn();
    }, 10000);  // 10000 milliseconds equals 10 seconds

    // Add the event listener
    button.addEventListener('click', handleButtonClick);
}

function showPopupWithLongTimeout() {
    // Initially, let the popup appear
    $("#popup").fadeIn();

    // Initially, set it so that it cannot be closed
    canClose = false;
    $("#close-btn").fadeOut();

    startTime = getCurrentTimeInSeconds();
    console.log("popup: startTime", startTime);

    // After 20 seconds, allow the popup to be closed and show the close button
    setTimeout(function () {
        canClose = true;
        $("#close-btn").fadeIn();
    }, 20000);  // 20000 milliseconds equals 20 seconds

    button.addEventListener('click', handleButtonClick);
}

$(document).ready(function () {
    // Call the function
    // showPopupWithShortTimeout();

    // When the title button is clicked, open the popup
    $("#title-btn").click(function () {
        $("#popup").fadeIn();
        $("#close-btn").fadeIn();  // Show the close button when manually opened
        canClose = true;  // When manually opened, directly set it to be closable
    });

    // When the close button is clicked, close the popup if it's allowed
    $("#close-btn").click(function (event) {
        event.stopPropagation();  // Prevent event bubbling
        if (canClose) {
            $("#popup").fadeOut();
            $("#close-btn").fadeOut();  // Hide the close button when popup is closed
        }
    });
});


// Avoid XSS
function escapeHtml(text) {
    var element = document.createElement("div");
    element.textContent = text;
    return element.innerHTML;
}

// Time
function formatDate(date) {
    const h = "0" + date.getHours();
    const m = "0" + date.getMinutes();
    return `${h.slice(-2)}:${m.slice(-2)}`;
}

// Utils
function get(selector, root = document) {
    return root.querySelector(selector);
}

// Show loading icon
function showLoadingIcon() {
    const loadingIcon = document.getElementById("loading-icon");

    // Create a new span element for the text
    const newText = document.createElement("span");
    newText.innerHTML = "Please wait for 5-10 seconds, ExplainerGPT is generating the next explanation.";

    // Apply the CSS styles
    newText.style.fontWeight = "bold";
    newText.style.fontSize = "16px";
    newText.style.color = "black";
    newText.style.textAlign = "center";

    // Append the text and the loading icon to the loadingIcon element
    loadingIcon.appendChild(newText);
    loadingIcon.innerHTML += "<i class='fas fa-spinner fa-spin'></i>";

    loadingIcon.classList.add("loading-icon"); // Add a CSS class for styling
    loadingIcon.style.fontSize = "25px"; // Increase the font size of loading icon

    msgerInput.disabled = true; // Disable the input field
    msgerForm.querySelector(".msger-send-btn").disabled = true; // Disable the send button
}



// Hide loading icon
function hideLoadingIcon() {
    const loadingIcon = document.getElementById("loading-icon");
    loadingIcon.innerHTML = "";

    msgerInput.disabled = false; // Enable the input field
    msgerForm.querySelector(".msger-send-btn").disabled = false; // Enable the send button
}

msgerInput.addEventListener("input", autoResize, true);

function autoResize() {
    this.style.height = "auto";
    this.style.height = this.scrollHeight + "px";
}



