const question = document.querySelector(".question");
const progressText = document.getElementById("progress-text");
const answers = Array.from(document.getElementsByClassName("answer-text"));
const progressBar = document.getElementById("progress-bar");
const progressBarFill = document.getElementById("progress-bar__fill");
const scoreText = document.getElementById("score");
const loader = document.getElementById("loader");
const infoMenu = document.getElementById("info-menu");

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];

let questions = [];

fetch(
    "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple"
  )
  .then(res => {
    return res.json();
    console.log(res);
  })
  .then(loadedQuestions => {
    questions = loadedQuestions.results.map(loadedQuestion => {

      const formattedQuestion = {
        question: loadedQuestion.question
      };

      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });

      return formattedQuestion;
    });
    startGame();
  })
  .catch(err => {
    console.log(err);
  });

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

startGame = _ => {
  questionCounter = 0;
  score = 0;
  availableQuestions = [...questions];
  getNewQuestion();
  infoMenu.classList.remove("hidden");
  loader.classList.add("hidden");
};

getNewQuestion = _ => {
  if (availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS) {
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("/end.html");
  }
  questionCounter++;
  progressText.innerHTML = `Question ${questionCounter}/${MAX_QUESTIONS}`;
  progressBarFill.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

  const questionIndex = Math.floor(Math.random() * availableQuestions.length);

  currentQuestion = availableQuestions[questionIndex];

  decodeHtml = (html) => {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  question.innerText = decodeHtml(currentQuestion.question);


  answers.forEach(answer => {
    const number = answer.dataset["number"];
    answer.innerText = decodeHtml(currentQuestion["choice" + number]);
  });

  availableQuestions.splice(questionIndex, 1);
  acceptingAnswers = true;
};

answers.forEach(answer => {
  answer.addEventListener("click", e => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    const classToApply =
      selectedAnswer == currentQuestion.answer ? "correct" : "incorrect";

    if (classToApply == "correct") {
      incrementScore(CORRECT_BONUS);
    }

    selectedChoice.parentElement.classList.add(classToApply);

    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      getNewQuestion();
    }, 1000);
  });
});



incrementScore = nume => {
  score += nume;
  scoreText.innerText = score;
};