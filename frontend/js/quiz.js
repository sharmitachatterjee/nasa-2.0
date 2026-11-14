const TOTAL_QUESTIONS = 10;
const RECORD_KEY = "abnf-explorer-record-v1";
const ranks = [
  { minimum: 0, name: "Rookie Star Scout", title: "THE COSMIC CADET" },
  { minimum: 4, name: "Planetary Pathfinder", title: "THE PLANETARY PATHFINDER" },
  { minimum: 7, name: "Mission Specialist", title: "THE MISSION SPECIALIST" },
  { minimum: 10, name: "Galaxy Guide", title: "THE GALAXY GUIDE" },
];
const cardColors = ["#b7a4ff", "#64e0c1", "#ffcb79", "#ff8fa3"];

const welcomeSection = document.querySelector("[data-quiz-welcome]");
const playSection = document.querySelector("[data-quiz-play]");
const resultsSection = document.querySelector("[data-quiz-results]");
const sharedSection = document.querySelector("[data-shared-card]");
const questionText = document.querySelector("[data-question-text]");
const answerList = document.querySelector("[data-answer-list]");
const feedback = document.querySelector("[data-answer-feedback]");
const progressTrack = document.querySelector("[data-progress-track]");
const progressBar = document.querySelector("[data-progress-bar]");
const nextButton = document.querySelector("[data-next-question]");
const recordMessage = document.querySelector("[data-quiz-record]");
const callsignInput = document.querySelector("#callsign");
const cardCanvas = document.querySelector("[data-explorer-card]");
const sharedCardCanvas = document.querySelector("[data-shared-explorer-card]");
const shareStatus = document.querySelector("[data-share-status]");

let questions = [];
let questionIndex = 0;
let score = 0;
let selectedCallsign = "STAR EXPLORER";
let currentCard = { score: 0, callsign: selectedCallsign, rank: ranks[0] };

function getRank(value) {
  return [...ranks].reverse().find((rank) => value >= rank.minimum);
}

function sanitizeCallsign(value) {
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
  return cleaned || "STAR EXPLORER";
}

function readRecord() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECORD_KEY) || "null");
    if (
      !saved ||
      !Number.isInteger(saved.bestScore) ||
      !Number.isInteger(saved.attempts) ||
      saved.bestScore < 0 ||
      saved.bestScore > TOTAL_QUESTIONS ||
      saved.attempts < 1
    ) {
      return null;
    }
    return saved;
  } catch (error) {
    console.error("Could not read the Explorer Academy record:", error);
    return null;
  }
}

function showRecord() {
  const record = readRecord();
  if (!record) return;
  recordMessage.hidden = false;
  recordMessage.textContent =
    `Your personal best: ${record.bestScore}/${TOTAL_QUESTIONS} · ${getRank(record.bestScore).name} · ${record.attempts} ${record.attempts === 1 ? "mission" : "missions"} flown`;
}

function saveRecord(finalScore) {
  const previous = readRecord();
  const record = {
    bestScore: Math.max(previous?.bestScore ?? 0, finalScore),
    attempts: (previous?.attempts ?? 0) + 1,
  };
  try {
    localStorage.setItem(RECORD_KEY, JSON.stringify(record));
    return record;
  } catch (error) {
    console.error("Could not save the Explorer Academy record:", error);
    return null;
  }
}

function drawWrappedText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  const lines = [];
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  lines.forEach((value, index) => context.fillText(value, x, y + index * lineHeight));
  return lines.length;
}

function drawExplorerCard(canvas, card) {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot create an Explorer Card.");

  const { width, height } = canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#171b36");
  gradient.addColorStop(0.55, "#11162a");
  gradient.addColorStop(1, "#080b16");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  let seed = 173;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let index = 0; index < 95; index += 1) {
    const x = 48 + random() * (width - 96);
    const y = 40 + random() * (height - 80);
    context.globalAlpha = 0.18 + random() * 0.65;
    context.fillStyle = index % 8 === 0 ? "#b7a4ff" : "#f3f5ff";
    context.beginPath();
    context.arc(x, y, index % 8 === 0 ? 2.7 : 1.4, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const color = cardColors[ranks.indexOf(card.rank)];
  context.strokeStyle = "rgba(183, 164, 255, 0.35)";
  context.lineWidth = 2;
  context.beginPath();
  context.ellipse(975, 330, 230, 120, -0.3, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.ellipse(975, 330, 175, 85, 0.24, 0, Math.PI * 2);
  context.stroke();

  const planet = context.createRadialGradient(950, 290, 15, 975, 330, 130);
  planet.addColorStop(0, color);
  planet.addColorStop(0.65, "#55518a");
  planet.addColorStop(1, "#20243e");
  context.fillStyle = planet;
  context.beginPath();
  context.arc(975, 330, 112, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#fff4d6";
  context.beginPath();
  context.arc(1125, 245, 12, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = color;
  context.font = "700 24px system-ui, sans-serif";
  context.letterSpacing = "5px";
  context.fillText("ABNF  /  EXPLORER ACADEMY", 72, 82);
  context.letterSpacing = "0px";

  context.fillStyle = "#a7aec4";
  context.font = "600 20px system-ui, sans-serif";
  context.fillText("COLLECTIBLE EXPLORER CARD", 74, 180);

  context.fillStyle = "#f3f5ff";
  context.font = "800 48px system-ui, sans-serif";
  drawWrappedText(context, card.callsign.toUpperCase(), 72, 247, 660, 60);

  context.fillStyle = color;
  context.font = "800 38px system-ui, sans-serif";
  drawWrappedText(context, card.rank.title, 74, 365, 700, 48);

  context.fillStyle = "#f3f5ff";
  context.font = "750 100px system-ui, sans-serif";
  context.fillText(String(card.score).padStart(2, "0"), 72, 500);
  context.fillStyle = "#a7aec4";
  context.font = "600 28px system-ui, sans-serif";
  context.fillText(`/ ${TOTAL_QUESTIONS} CORRECT`, 220, 500);

  context.fillStyle = "#a7aec4";
  context.font = "500 18px system-ui, sans-serif";
  context.fillText("MISSION KNOWLEDGE • CURIOSITY • EXPLORATION", 74, 590);
  context.fillText("A little more of the universe, understood.", 74, 625);
}

function renderQuestion() {
  const question = questions[questionIndex];
  answerList.replaceChildren();
  feedback.hidden = true;
  feedback.classList.remove("is-wrong");
  nextButton.hidden = true;
  document.querySelector("[data-category]").textContent = question.category;
  document.querySelector("[data-question-count]").textContent =
    `QUESTION ${questionIndex + 1} OF ${TOTAL_QUESTIONS}`;
  questionText.textContent = question.question;
  progressTrack.setAttribute("aria-valuenow", questionIndex);
  progressBar.style.width = `${(questionIndex / TOTAL_QUESTIONS) * 100}%`;
  document.querySelector("[data-score-preview]").textContent = `Correct answers: ${score}`;

  question.answers.forEach((answer, answerIndex) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.type = "button";
    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = String.fromCharCode(65 + answerIndex);
    const copy = document.createElement("span");
    copy.className = "answer-copy";
    copy.textContent = answer;
    button.append(letter, copy);
    button.addEventListener("click", () => selectAnswer(answerIndex));
    answerList.append(button);
  });
  questionText.focus();
}

function selectAnswer(selectedIndex) {
  const question = questions[questionIndex];
  const answerButtons = [...answerList.querySelectorAll(".answer-option")];
  if (answerButtons.some((button) => button.disabled)) return;
  answerButtons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correctIndex) button.classList.add("is-correct");
    else if (index === selectedIndex) button.classList.add("is-wrong");
  });

  const isCorrect = selectedIndex === question.correctIndex;
  if (isCorrect) score += 1;
  progressTrack.setAttribute("aria-valuenow", questionIndex + 1);
  progressBar.style.width = `${((questionIndex + 1) / TOTAL_QUESTIONS) * 100}%`;
  feedback.hidden = false;
  feedback.classList.toggle("is-wrong", !isCorrect);
  document.querySelector("[data-feedback-title]").textContent = isCorrect
    ? "That’s right!"
    : "Good try—now you know.";
  document.querySelector("[data-feedback-copy]").textContent = question.explanation;
  const source = document.querySelector("[data-feedback-source]");
  source.href = question.source;
  document.querySelector("[data-score-preview]").textContent = `Correct answers: ${score}`;
  nextButton.textContent =
    questionIndex === TOTAL_QUESTIONS - 1 ? "See your Explorer Card" : "Next question";
  nextButton.hidden = false;
  nextButton.focus();
}

function createShareUrl(card) {
  const url = new URL("quiz.html", window.location.href);
  url.searchParams.set("share", "1");
  url.searchParams.set("score", String(card.score));
  url.searchParams.set("callsign", card.callsign);
  return url.href;
}

function finishQuiz() {
  welcomeSection.hidden = true;
  playSection.hidden = true;
  resultsSection.hidden = false;
  const rank = getRank(score);
  currentCard = { score, callsign: selectedCallsign, rank };
  const record = saveRecord(score);
  document.querySelector("[data-results-title]").textContent =
    `${rank.name}, ${selectedCallsign}!`;
  document.querySelector("[data-results-copy]").textContent =
    record && record.bestScore === score
      ? `You got ${score} out of ${TOTAL_QUESTIONS} right—and set your personal best. Your new rank is ${rank.name}.`
      : `You got ${score} out of ${TOTAL_QUESTIONS} right. Every mission makes you a stronger explorer.`;
  shareStatus.textContent = record
    ? `Personal best: ${record.bestScore}/${TOTAL_QUESTIONS} · ${record.attempts} ${record.attempts === 1 ? "mission" : "missions"} flown on this device.`
    : "Your score is ready. This browser could not save a local personal best.";
  shareStatus.classList.toggle("is-error", !record);
  drawExplorerCard(cardCanvas, currentCard);
  cardCanvas.setAttribute(
    "aria-label",
    `${selectedCallsign}, ${rank.title}, score ${score} out of ${TOTAL_QUESTIONS}.`,
  );
  document.querySelector("[data-results-title]").focus();
}

async function downloadCard() {
  const blob = await new Promise((resolve) => cardCanvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the card image in this browser.");
  const link = document.createElement("a");
  link.download = `abnf-explorer-card-${currentCard.score}-of-${TOTAL_QUESTIONS}.png`;
  link.href = URL.createObjectURL(blob);
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function shareCard() {
  const url = createShareUrl(currentCard);
  const title = `${currentCard.callsign} · ${currentCard.rank.name}`;
  const text = `I scored ${currentCard.score}/${TOTAL_QUESTIONS} in Explorer Academy and earned ${currentCard.rank.name}!`;
  const blob = await new Promise((resolve) => cardCanvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create the card image in this browser.");
  const file = new File([blob], "abnf-explorer-card.png", { type: "image/png" });

  if (navigator.canShare?.({ files: [file] }) && navigator.share) {
    await navigator.share({ title, text, url, files: [file] });
    shareStatus.textContent = "Your Explorer Card is ready to share.";
    shareStatus.classList.remove("is-error");
    return;
  }
  if (navigator.share) {
    await navigator.share({ title, text, url });
    shareStatus.textContent = "Your share link is ready.";
    shareStatus.classList.remove("is-error");
    return;
  }
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    shareStatus.textContent = "Share link copied! Send it to a friend.";
    shareStatus.classList.remove("is-error");
    return;
  }
  shareStatus.textContent = "Download your card image to share it with friends.";
}

function showSharedCard() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("share") !== "1") return false;
  const scoreParam = Number(params.get("score"));
  if (!Number.isInteger(scoreParam) || scoreParam < 0 || scoreParam > TOTAL_QUESTIONS) {
    return false;
  }
  selectedCallsign = sanitizeCallsign(params.get("callsign") || "STAR EXPLORER");
  const rank = getRank(scoreParam);
  currentCard = { score: scoreParam, callsign: selectedCallsign, rank };
  welcomeSection.hidden = true;
  playSection.hidden = true;
  resultsSection.hidden = true;
  sharedSection.hidden = false;
  document.querySelector("#shared-title").textContent =
    `${rank.name} is ready for launch.`;
  drawExplorerCard(sharedCardCanvas, currentCard);
  sharedCardCanvas.setAttribute(
    "aria-label",
    `${selectedCallsign}, ${rank.title}, score ${scoreParam} out of ${TOTAL_QUESTIONS}.`,
  );
  return true;
}

async function start() {
  document.querySelector("[data-start-quiz]").addEventListener("click", () => {
    selectedCallsign = sanitizeCallsign(callsignInput.value);
    questionIndex = 0;
    score = 0;
    welcomeSection.hidden = true;
    playSection.hidden = false;
    renderQuestion();
  });

  nextButton.addEventListener("click", () => {
    questionIndex += 1;
    if (questionIndex === TOTAL_QUESTIONS) finishQuiz();
    else renderQuestion();
  });

  document.querySelector("[data-play-again]").addEventListener("click", () => {
    resultsSection.hidden = true;
    welcomeSection.hidden = false;
    callsignInput.value = selectedCallsign === "STAR EXPLORER" ? "" : selectedCallsign;
    showRecord();
    callsignInput.focus();
  });

  document.querySelector("[data-download-card]").addEventListener("click", async () => {
    try {
      await downloadCard();
      shareStatus.textContent = "Explorer Card downloaded as a PNG.";
      shareStatus.classList.remove("is-error");
    } catch (error) {
      console.error("Explorer Card download failed:", error);
      shareStatus.textContent =
        error instanceof Error ? error.message : "Could not download the card.";
      shareStatus.classList.add("is-error");
    }
  });

  document.querySelector("[data-share-card]").addEventListener("click", async () => {
    try {
      await shareCard();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("Explorer Card sharing failed:", error);
      shareStatus.textContent =
        error instanceof Error ? error.message : "Could not share the card.";
      shareStatus.classList.add("is-error");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (playSection.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
    const answerIndex = Number(event.key) - 1;
    const option = answerList.querySelectorAll(".answer-option")[answerIndex];
    if (option && !option.disabled) {
      option.click();
    } else if (event.key === "Enter" && !nextButton.hidden) {
      nextButton.click();
    }
  });

  try {
    const response = await fetch("data/quiz.json");
    if (!response.ok) throw new Error(`Could not load quiz questions (${response.status}).`);
    questions = await response.json();
    if (
      !Array.isArray(questions) ||
      questions.length !== TOTAL_QUESTIONS ||
      questions.some(
        (question) =>
          !Array.isArray(question.answers) ||
          question.answers.length !== 4 ||
          !Number.isInteger(question.correctIndex) ||
          question.correctIndex < 0 ||
          question.correctIndex > 3 ||
          !question.source?.startsWith("https://"),
      )
    ) {
      throw new Error("The Explorer Academy quiz data is incomplete.");
    }

    if (!showSharedCard()) showRecord();
  } catch (error) {
    console.error("Explorer Academy could not be initialized:", error);
    welcomeSection.querySelector("h2").textContent = "Mission control is offline";
    welcomeSection.querySelector(
      ":scope > p:not(.eyebrow, .callsign-hint, .quiz-record)",
    ).textContent =
      error instanceof Error ? error.message : "Please reload to try again.";
    document.querySelector("[data-start-quiz]").disabled = true;
  }
}

start();