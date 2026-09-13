import  { useState, useEffect, useCallback, useRef, memo } from "react";
import { useChatEngine } from "/V18-chatbot/src/components/ChatBot/hooks/useChatEngine";
import { useDraggable } from "/V18-chatbot/src/components/ChatBot/hooks/useDraggable";
import styles from "./ChatBot.module.css";

// 1. Message List
// 1. Message List inside ChatBot.jsx
const MessageList = function MessageList({ messages, isTyping, typingStatus }) {
  const scrollRef = useRef(null);

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

      {/* 👈 Typing & Thinking Indicator */}
      {isTyping && (
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

      <div ref={scrollRef} style={{ height: "4px", minHeight: "4px" }} />
    </div>
  );
};

// 2. Action Chips
const ActionChips = memo(function ActionChips({
  lang,
  activeNodes,
  navHistory,
  onSelectLanguage,
  onSelectNode,
  onBack,
  onReset
}) {
  if (!lang) {
    return (
      <div className={styles.chipWrapper}>
        <button
          type="button"
          className={styles.actionChip}
          onClick={() => onSelectLanguage("en")}
        >
          🇬🇧 English
        </button>
        <button
          type="button"
          className={styles.actionChip}
          onClick={() => onSelectLanguage("kn")}
        >
          🇮🇳 ಕನ್ನಡ (Kannada)
        </button>
      </div>
    );
  }

  return (
    <div className={styles.chipWrapper}>
      {activeNodes && activeNodes.map((node) => (
        <button
          key={node.id}
          type="button"
          className={styles.actionChip}
          onClick={() => onSelectNode(node)}
        >
          {node.label}
        </button>
      ))}

      {navHistory && navHistory.length > 0 && (
        <button
          type="button"
          className={`${styles.actionChip} ${styles.navControlChip}`}
          onClick={onBack}
        >
          ⬅️ {lang === "kn" ? "ಹಿಂದೆ" : "Back"}
        </button>
      )}

      {activeNodes && activeNodes.length === 0 && (
        <button
          type="button"
          className={`${styles.actionChip} ${styles.navControlChip}`}
          onClick={onReset}
        >
          🔄 {lang === "kn" ? "ಮುಖ್ಯ ಮೆನು" : "Main Menu"}
        </button>
      )}
    </div>
  );
});

// 3. Chat Input
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

// Main Orchestrator
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { position, handleMouseDown } = useDraggable({ enabled: isOpen });

  const {
    lang,
    messages,
    activeNodes,
    navHistory,
    isTyping,
    typingStatus,
    handleSelectLanguage,
    handleSelectNode,
    handleBackNavigation,
    handleResetToRoot,
    handleSendQuery
  } = useChatEngine();

  // 5-second auto popup
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <aside className={styles.botContainer} aria-label="Virtual Assistant">
      {/* Floating Toggle Button */}
     {/* Floating Toggle Button */}
<button
  type="button"
  className={`${styles.launcherBtn} ${isOpen ? styles.launcherActive : ""}`}
  onClick={toggleOpen}
  aria-label={isOpen ? "Close Assistant" : "Open Assistant"}
>
  {isOpen ? (
    <span className={styles.closeSymbol}>✕</span>
  ) : (
    <img
      src="/bot-icon.gif"
      alt="Virtual Assistant"
      className={styles.animatedBotIcon}
    />
  )}
</button>

      {/* Chat Window */}
      {isOpen && (
        <section
          className={styles.chatWindow}
          style={{
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`
          }}
        >
          <header className={styles.chatHeader} onMouseDown={handleMouseDown}>
            <div className={styles.headerInfo}>
                <img 
      src="/v18-logo.jpeg" 
      alt="V.18 Logo" 
      className={styles.headerLogo} 
    />
              <span className={styles.statusDot} />
              <div>
                <h2 className={styles.headerTitle}>V.18 Assistant</h2>
                <p className={styles.headerSub}>Drag to reposition</p>
              </div>
            </div>
            <button
              type="button"
              className={styles.minimizeBtn}
              onClick={toggleOpen}
              aria-label="Minimize Chat"
            >
              —
            </button>
          </header>

          <MessageList messages={messages}
           isTyping={isTyping} 
  typingStatus={typingStatus} />

          <ActionChips
            lang={lang}
            activeNodes={activeNodes}
            navHistory={navHistory}
            onSelectLanguage={handleSelectLanguage}
            onSelectNode={handleSelectNode}
            onBack={handleBackNavigation}
            onReset={handleResetToRoot}
          />

          <ChatInput lang={lang} onSend={handleSendQuery} />
        </section>
      )}
    </aside>
  );
}