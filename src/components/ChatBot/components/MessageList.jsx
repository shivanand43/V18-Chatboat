import  { memo, useEffect, useRef } from "react";
import styles from "../ChatBot.module.css";

const MessageList = memo(function MessageList({ messages, isTyping, typingStatus }) {
    
  const scrollRef = useRef(null);

  // Auto scroll to bottom on every message or typing state change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, typingStatus]);

  return (
    <div className={styles.messageArea}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`${styles.messageRow} ${
            msg.sender === "bot" ? styles.botRow : styles.userRow
          }`}
        >
          <div
            className={`${styles.messageBubble} ${
              msg.sender === "bot" ? styles.botBubble : styles.userBubble
            }`}
          >
            {msg.text}
          </div>
        </div>
      ))}

      {/* Typing Bubble */}
      {Boolean(isTyping) && (
        <div className={`${styles.messageRow} ${styles.botRow}`}>
          <div className={`${styles.messageBubble} ${styles.botBubble} ${styles.typingBubble}`}>
            <div className={styles.dotWave}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
            {typingStatus && (
              <span className={styles.typingStatusText}>{typingStatus}</span>
            )}
          </div>
        </div>
      )}

      <div ref={scrollRef} style={{ height: "1px" }} />
    </div>
  );
});

export default MessageList;