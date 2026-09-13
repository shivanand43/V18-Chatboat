import { useState, useCallback, useMemo } from "react";
import enData from "../data/botData.en.json";
import knData from "../data/botData.kn.json";

const generateId = () => "msg-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);

const DATA_REGISTRY = {
  en: enData,
  kn: knData
};

export function useChatEngine() {
  const [lang, setLang] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "init-1",
      sender: "bot",
      text: "Welcome to V.18 Premium Tuition! Please select your preferred language / ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆ ಮಾಡಿ:"
    }
  ]);
  const [activeNodes, setActiveNodes] = useState([]);
  const [navHistory, setNavHistory] = useState([]);
  
  // AI Realistic States
  const [isTyping, setIsTyping] = useState(false);
  const [typingStatus, setTypingStatus] = useState("");

  const currentDataset = useMemo(() => {
    return lang ? DATA_REGISTRY[lang] : null;
  }, [lang]);

  // Language Picker
  const handleSelectLanguage = useCallback((selectedLang) => {
    const data = DATA_REGISTRY[selectedLang];
    setLang(selectedLang);
    setActiveNodes(data.nodes);
    setNavHistory([]);

    setMessages((prev) => [
      ...prev,
      { id: generateId(), sender: "user", text: selectedLang === "en" ? "English" : "ಕನ್ನಡ" },
      { id: generateId(), sender: "bot", text: data.greeting }
    ]);
  }, []);

  // Tree Node Selection with slight natural delay
  const handleSelectNode = useCallback((node) => {
    setMessages((prev) => [
      ...prev,
      { id: generateId(), sender: "user", text: node.label }
    ]);

    setIsTyping(true);
    setTypingStatus(lang === "kn" ? "ಉತ್ತರಿಸಲಾಗುತ್ತಿದೆ..." : "Fetching details...");

    setTimeout(() => {
      setIsTyping(false);
      setTypingStatus("");
      setMessages((prev) => [
        ...prev,
        { id: generateId(), sender: "bot", text: node.response }
      ]);

      if (node.children && node.children.length > 0) {
        setActiveNodes((current) => {
          setNavHistory((prevHist) => [...prevHist, current]);
          return node.children;
        });
      } else {
        setActiveNodes([]);
      }
    }, 600);
  }, [lang]);

  // Navigation handlers
  const handleBackNavigation = useCallback(() => {
    if (navHistory.length === 0) {
      if (currentDataset) setActiveNodes(currentDataset.nodes);
      return;
    }
    const previousState = navHistory[navHistory.length - 1];
    setNavHistory((prev) => prev.slice(0, -1));
    setActiveNodes(previousState);
  }, [navHistory, currentDataset]);

  const handleResetToRoot = useCallback(() => {
    if (!currentDataset) return;
    setNavHistory([]);
    setActiveNodes(currentDataset.nodes);
    setMessages((prev) => [
      ...prev,
      {
        id: generateId(),
        sender: "bot",
        text: lang === "kn" ? "ಮುಖ್ಯ ಮೆನುವಿಗೆ ಹಿಂತಿರುಗಿದೆ. ಆಯ್ಕೆಮಾಡಿ:" : "Returned to main menu. Please choose a topic:"
      }
    ]);
  }, [currentDataset, lang]);

  // Keyword Search
 // Smart Multi-Factor Matcher for V.18 Tuition
const searchTree = useCallback((nodes, rawQuery) => {
  if (!rawQuery || !rawQuery.trim()) return null;

  // 1. Normalize Query (strip punctuation, lower case, clean spaces)
  const clean = rawQuery
    .toLowerCase()
    .replace(/[^\w\s\u0C80-\u0CFF]/gi, " ") // Supports English & Kannada scripts
    .trim();

  const queryTokens = clean.split(/\s+/).filter((t) => t.length > 1);
  if (queryTokens.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  function evaluateNodes(nodeList) {
    for (const node of nodeList) {
      let score = 0;

      // Rule A: Direct Exact Match on Question / Label (Highest priority)
      if (node.label && clean.includes(node.label.toLowerCase())) {
        score += 25;
      }

      // Rule B: Entity / Keyword Matches
      if (node.keywords && Array.isArray(node.keywords)) {
        node.keywords.forEach((kw) => {
          const lowerKw = kw.toLowerCase();
          
          // Exact keyword phrase match
          if (clean.includes(lowerKw)) {
            score += lowerKw.includes(" ") ? 15 : 8; // Multi-word phrases like "offline fee" get higher weight
          }
          
          // Token-level match
          queryTokens.forEach((token) => {
            if (lowerKw === token) {
              score += 4;
            }
          });
        });
      }

      // Rule C: Synonym / Intent Patterns (Regex clusters)
      if (node.patterns && Array.isArray(node.patterns)) {
        node.patterns.forEach((patternStr) => {
          try {
            const regex = new RegExp(patternStr, "i");
            if (regex.test(clean)) {
              score += 12; // Strong regex intent match
            }
          } catch (e) {
            // Safe fallback for pattern errors
          }
        });
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = node;
      }

      // Recursively evaluate deep sub-questions
      if (node.children && node.children.length > 0) {
        evaluateNodes(node.children);
      }
    }
  }

  evaluateNodes(nodes);

  // Confidence Threshold: Only return if score is solid, otherwise fallback
  return highestScore >= 10 ? bestMatch : null;
}, []);

  // Free-Text Search with Realistic Multi-Phase AI Simulation
  const handleSendQuery = useCallback((text) => {
    if (!text.trim() || isTyping) return;

    const currentLang = lang || "en";
    const data = DATA_REGISTRY[currentLang];

    // 1. Instantly post user message
    setMessages((prev) => [
      ...prev,
      { id: generateId(), sender: "user", text }
    ]);

    // 2. Start AI "Thinking" state
    setIsTyping(true);
    setTypingStatus(currentLang === "kn" ? "ಆಲೋಚಿಸಲಾಗುತ್ತಿದೆ..." : "Thinking...");

    // 3. Phase 2: "Searching V.18 Knowledge Base..."
    setTimeout(() => {
      setTypingStatus(currentLang === "kn" ? "ಮಾಹಿತಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ..." : "Searching V.18 database...");
    }, 600);

    // 4. Phase 3: "Generating Answer..."
    setTimeout(() => {
      setTypingStatus(currentLang === "kn" ? "ಉತ್ತರ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ..." : "Formulating response...");
    }, 1200);

    // 5. Final delivery
    setTimeout(() => {
      const matchedNode = searchTree(data.nodes, text);
      setIsTyping(false);
      setTypingStatus("");

      if (matchedNode) {
        setMessages((prev) => [
          ...prev,
          { id: generateId(), sender: "bot", text: matchedNode.response }
        ]);
        if (matchedNode.children && matchedNode.children.length > 0) {
          setActiveNodes(matchedNode.children);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { id: generateId(), sender: "bot", text: data.fallback }
        ]);
      }
    }, 1700);
  }, [lang, isTyping, searchTree]);

  return {
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
  };
}