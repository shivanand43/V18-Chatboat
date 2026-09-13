import  { memo, useState, useCallback } from "react";
import styles from "../ChatBot.module.css";

const ChatInput = memo(function ChatInput({ lang, onSend }) {
  const [text, setText] = useState("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!text.trim()) return;
      onSend(text);
      setText("");
    },
    [text, onSend]
  );

  return (
    <form className={styles.inputContainer} onSubmit={handleSubmit}>
      <input
        type="text"
        className={styles.chatInput}
        placeholder={
          lang === "kn"
            ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಟೈಪ್ ಮಾಡಿ..."
            : "Type your question here..."
        }
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button
        type="submit"
        className={styles.sendButton}
        disabled={!text.trim()}
        aria-label="Send query"
      >
        <svg viewBox="0 0 24 24" className={styles.sendIcon}>
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </form>
  );
});

export default ChatInput;