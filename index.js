window.onload = function () {
  // Elements
  const scrStart = document.getElementById("screen-start");
  const scrGame = document.getElementById("screen-game");
  const scrEnd = document.getElementById("screen-end");

  const btnStart = document.getElementById("btnStart");
  const btnHero = document.getElementById("btnHero");
  const btnVill = document.getElementById("btnVillain");
  const btnPlay = document.getElementById("btnPlayAgain");
  const btnHome = document.getElementById("btnBackHome");

  const nameEl = document.getElementById("name");
  const feedback = document.getElementById("feedback");

  const scoreStat = document.getElementById("scoreStat");
  const timeEl = document.getElementById("time");

  const scoreEl = document.getElementById("score");
  const answeredEl = document.getElementById("answered");
  const highEl = document.getElementById("high");

  const finalScoreEl = document.getElementById("finalScore");
  const finalAnsweredEl = document.getElementById("finalAnswered");
  const finalAccuracyEl = document.getElementById("finalAccuracy");
  const charImage = document.getElementById("charImage");

  const bgMusic = document.getElementById("bgMusic");
  const toggleMusicBtn = document.getElementById("toggleMusic");
  const resetHighBtn = document.getElementById("resetHigh");

  // Screen switching
  function show(el) {
    scrStart.classList.remove("show");
    scrGame.classList.remove("show");
    scrEnd.classList.remove("show");
    el.classList.add("show");
  }

  // Enable/disable answer buttons
  function setAnswerButtonsEnabled(enabled) {
    btnHero.disabled = !enabled;
    btnVill.disabled = !enabled;
  }

  // High score helpers
  const HIGH_KEY = "hv_high_score";
  const getHigh = () => parseInt(localStorage.getItem(HIGH_KEY) || "0", 10);
  const setHigh = (v) => localStorage.setItem(HIGH_KEY, String(v));
  highEl.textContent = String(getHigh());

  // Create quiz (15s)
  const quiz = new window.Quiz(15);

  quiz.onQuestion = (q) => {
    // Update the name
    nameEl.textContent = q.name;

    // Update the image
    if (q.img) {
      charImage.src = q.img;
      charImage.alt = q.name;
      charImage.style.display = "block";
    } else {
      charImage.src = "";
      charImage.alt = "";
      charImage.style.display = "none";
    }

    // Reset feedback and re-enable buttons
    feedback.textContent = "";
    feedback.className = "feedback";
    setAnswerButtonsEnabled(true);
  };

  quiz.onTick = (seconds) => {
    timeEl.textContent = String(seconds);
    if (seconds <= 0) {
      setAnswerButtonsEnabled(false);
    }
  };

  quiz.onStats = ({ score, answered }) => {
    scoreEl.textContent = String(score);
    answeredEl.textContent = String(answered);
    scoreStat.textContent = String(score);
  };

  quiz.onEnd = (result) => {
    setAnswerButtonsEnabled(false);

    // High score
    let high = getHigh();
    if (result.score > high) {
      setHigh(result.score);
      high = result.score;
    }
    highEl.textContent = String(high);

    // End screen details
    finalScoreEl.textContent = String(result.score);
    finalAnsweredEl.textContent = String(result.answered);
    finalAccuracyEl.textContent = `${result.accuracy}%`;

    // 🔇 Stop music at end
    bgMusic.pause();
    bgMusic.currentTime = 0;

    show(scrEnd);
  };

  // Button events
  btnStart.addEventListener("click", () => {
    show(scrGame);
    setAnswerButtonsEnabled(true);
    quiz.start();

    // 🔊 Start background music
    bgMusic.volume = 0.5; // volume between 0.0 - 1.0
    bgMusic.play().catch((err) => {
      console.log("Autoplay blocked:", err);
    });
  });

  btnHero.addEventListener("click", () => {
    const res = quiz.answer("Hero");
    if (res.locked) return;
    if (res.correct) {
      feedback.textContent = "Correct!";
      feedback.className = "feedback ok";
    } else {
      feedback.textContent = "Wrong!";
      feedback.className = "feedback no";
    }
  });

  btnVill.addEventListener("click", () => {
    const res = quiz.answer("Villain");
    if (res.locked) return;
    if (res.correct) {
      feedback.textContent = "Correct!";
      feedback.className = "feedback ok";
    } else {
      feedback.textContent = "Wrong!";
      feedback.className = "feedback no";
    }
  });

  btnPlay.addEventListener("click", () => {
    show(scrGame);
    setAnswerButtonsEnabled(true);
    quiz.start();
  });

  btnHome.addEventListener("click", () => {
    show(scrStart);
    setAnswerButtonsEnabled(false);
    scoreEl.innerText = 0;
    scoreStat.innerText = 0;
    timeEl.innerText = 15;
  });

  // Keyboard shortcuts (H / V)
  window.addEventListener("keydown", (e) => {
    if (!scrGame.classList.contains("show")) return;
    const k = e.key.toLowerCase();
    if (k === "h" || e.key === "ArrowLeft") btnHero.click();
    if (k === "v" || e.key === "ArrowRight") btnVill.click();
  });

  toggleMusicBtn.addEventListener("click", () => {
    if (bgMusic.paused) {
      bgMusic.play();
      toggleMusicBtn.textContent = "🔊 Music";
    } else {
      bgMusic.pause();
      toggleMusicBtn.textContent = "🔇 Music";
    }
  });

  resetHighBtn.addEventListener("click", () => {
    localStorage.removeItem("hv_high_score");
    highEl.textContent = "0";
    alert("High score reset!");
  });
};
