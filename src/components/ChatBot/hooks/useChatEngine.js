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
  const searchTree = useCallback((nodes, query) => {
    const cleanQuery = query.toLowerCase().trim();
    const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 1);
    if (tokens.length === 0) return null;

    const regexPattern = new RegExp(`(${tokens.join("|")})`, "i");
    let bestMatch = null;
    let maxScore = 0;

    function traverse(nodeList) {
      for (const node of nodeList) {
        let score = 0;
        if (node.label && node.label.toLowerCase().includes(cleanQuery)) score += 10;
        if (node.response && node.response.toLowerCase().includes(cleanQuery)) score += 5;

        if (node.keywords && Array.isArray(node.keywords)) {
          node.keywords.forEach((kw) => {
            if (regexPattern.test(kw)) score += 8;
            if (cleanQuery.includes(kw.toLowerCase())) score += 6;
          });
        }

        if (score > maxScore) {
          maxScore = score;
          bestMatch = node;
        }

        if (node.children && node.children.length > 0) {
          traverse(node.children);
        }
      }
    }

    traverse(nodes);
    return maxScore >= 6 ? bestMatch : null;
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