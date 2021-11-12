import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import styles from "../../styles/BuyCards.module.scss";
const renderTime = ({ remainingTime }) => {
  if (remainingTime === 0) {
    return <div className={styles.timer}>Too lale...</div>;
  }

  return (
    <div className={styles.timer}>
      <div className={styles.text}>Remaining</div>
      <div className={styles.value}>{remainingTime}</div>
      <div className={styles.text}>seconds</div>
    </div>
  );
};

function Counter() {
  return (
    <div>
      <div className={styles.timerWrapper}>
        <CountdownCircleTimer
          isPlaying
          duration={1000}
          colors={[["#004777", 0.33], ["#F7B801", 0.33], ["#A30000"]]}
          onComplete={() => [true, 1000]}
        >
          {renderTime}
        </CountdownCircleTimer>
      </div>
    </div>
  );
}
export default Counter;
