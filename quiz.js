// quiz controller
(function () {
  function Quiz(totalTimeSeconds) {
    this.totalTimeSeconds = totalTimeSeconds || 30;
    this.score = 0;
    this.answered = 0;
    this.current = null;
    this.timeLeft = this.totalTimeSeconds;
    this.timerId = null;

    // pool of remaining questions
    this.pool = [];

    this.over = false;

    this.onQuestion = () => {};
    this.onTick = () => {};
    this.onStats = () => {};
    this.onEnd = () => {};
  }

  Quiz.prototype.start = function () {
    this.score = 0;
    this.answered = 0;
    this.timeLeft = this.totalTimeSeconds;
    this.over = false;

    this.onStats({ score: this.score, answered: this.answered });

    this.pool = window.QUESTIONS.slice();
    this.next();

    clearInterval(this.timerId);
    this.onTick(this.timeLeft);
    this.timerId = setInterval(() => {
      if (this.over) return;
      this.timeLeft--;
      if (this.timeLeft < 0) this.timeLeft = 0;
      this.onTick(this.timeLeft);
      if (this.timeLeft <= 0) this.finish();
    }, 1000);

    this.pool = window.QUESTIONS.slice();

    // first question
    this.next();

    // start countdown
    clearInterval(this.timerId);
    this.onTick(this.timeLeft);
    this.timerId = setInterval(() => {
      if (this.over) return;
      this.timeLeft--;
      if (this.timeLeft < 0) this.timeLeft = 0;
      this.onTick(this.timeLeft);
      if (this.timeLeft <= 0) {
        this.finish();
      }
    }, 1000);
  };

  Quiz.prototype.next = function () {
    if (this.over) return;

    // stop if pool empty
    if (this.pool.length === 0) {
      this.finish();
      return;
    }

    // pick random index, remove from pool
    const i = Math.floor(Math.random() * this.pool.length);
    this.current = this.pool.splice(i, 1)[0];

    this.onQuestion(this.current);
  };

  // returns { locked, correct, score, answered }
  Quiz.prototype.answer = function (choice) {
    if (this.over || !this.current) {
      return {
        locked: true,
        correct: false,
        score: this.score,
        answered: this.answered,
      };
    }

    const correct = choice === this.current.role;
    if (correct) this.score++;
    this.answered++;
    this.onStats({ score: this.score, answered: this.answered });

    this.next();

    return {
      locked: false,
      correct,
      score: this.score,
      answered: this.answered,
    };
  };

  Quiz.prototype.finish = function () {
    if (this.over) return;
    this.over = true;
    clearInterval(this.timerId);
    this.current = null;

    this.onEnd({
      score: this.score,
      answered: this.answered,
      accuracy: this.answered
        ? Math.round((this.score / this.answered) * 100)
        : 0,
    });
  };

  window.Quiz = Quiz;
})();
