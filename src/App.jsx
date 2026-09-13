import ChatBot from "./components/ChatBot/ChatBot";

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", padding: "40px" }}>
      <h1>V.18 Premium Tuition</h1>
      <p>Tech-Enabled Learning System</p>
      
      <ChatBot />
    </div>
  );
}