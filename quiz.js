// Class Quiz
class Quiz {
  constructor(totalTimeSeconds = 30) {
    this.totalTimeSeconds = totalTimeSeconds;
    this.score = 0;
    this.answered = 0;
    this.current = null;
    this.timeLeft = this.totalTimeSeconds;
    this.timerId = null;
    this.pool = [];
    this.over = false;

    this.onQuestion = () => {};
    this.onTick = () => {};
    this.onStats = () => {};
    this.onEnd = () => {};
  }
  start() {
    this.score = 0;
    this.answered = 0;
    this.timeLeft = this.totalTimeSeconds;
    this.over = false;
    this.onStats({ score: this.score, answered: this.answered });

    // fresh pool (no repeats within the round)
    this.pool = window.QUESTIONS.slice();
    this.next();

    this._stopTimer();
    this.onTick(this.timeLeft); // show full time instantly
    this.timerId = setInterval(() => {
      if (this.over) return;
      this.timeLeft = Math.max(0, this.timeLeft - 1);
      this.onTick(this.timeLeft);
      if (this.timeLeft <= 0) this.finish();
    }, 1000);
  }

  next() {
    if (this.over) return;
    if (this.pool.length === 0) {
      this.finish();
      return;
    }

    // pick & remove random item (prevents repeats)
    const i = Math.floor(Math.random() * this.pool.length);
    this.current = this.pool.splice(i, 1)[0];

    this.onQuestion(this.current);
  }

  // returns { locked, correct, score, answered }
  answer(choice) {
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
  }

  finish() {
    if (this.over) return;
    this.over = true;
    this._stopTimer();
    this.current = null;

    this.onEnd({
      score: this.score,
      answered: this.answered,
      accuracy: this.answered
        ? Math.round((this.score / this.answered) * 100)
        : 0,
    });
  }

  _stopTimer() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

// expose globally for index.js
window.Quiz = Quiz;
