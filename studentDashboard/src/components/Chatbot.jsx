import { useState, useEffect, useRef } from "react";
import { Send, User, Bot } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

function Chatbot() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const chatboxRef = useRef(null);

    // Function to auto-scroll to the very bottom
    const scrollToBottom = (force = false) => {
        if ((force || !isUserScrolling) && chatboxRef.current) {
            setTimeout(() => {
                chatboxRef.current.scrollTo({
                    top: chatboxRef.current.scrollHeight,
                    behavior: "smooth",
                });
            }, 100); // Delay allows UI to update before scrolling
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Detect if user scrolls manually
    const handleScroll = () => {
        if (chatboxRef.current) {
            const isAtBottom =
                chatboxRef.current.scrollHeight - chatboxRef.current.scrollTop <= chatboxRef.current.clientHeight + 50;

            if (isAtBottom) {
                setIsUserScrolling(false);
            } else {
                setIsUserScrolling(true);
            }
        }
    };

    // Function to send messages and stream response
    const sendMessage = async () => {
        if (!input.trim()) return;

        setIsUserScrolling(false); // Allow scrolling when message is sent

        const newMessage = { text: input, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInput("");
        setLoading(true);

        // Ensure we scroll down after message is added
        scrollToBottom(true);

        const botMessage = { text: "", sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botMessage]);

        try {
            console.log("Sending request to backend...");

            const response = await fetch("http://127.0.0.1:5001/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input }),
            });

            if (!response.ok) throw new Error("Network response was not ok");

            console.log("Response received. Streaming now...");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let partialMessage = "";

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                partialMessage += decoder.decode(value, { stream: true });

                console.log("Chunk received:", partialMessage);

                // Format message into readable text
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages[updatedMessages.length - 1].text = partialMessage;
                    return updatedMessages;
                });

                scrollToBottom(); // Keep scrolling as messages arrive
            }

            console.log("Finished streaming response.");

            // Remove "Generating" after full response is received
            setLoading(false);
            scrollToBottom(true); // Ensure final scroll to bottom
        } catch (error) {
            console.error("Error fetching chat response:", error);
            setLoading(false);
        }
    };

    // Handle "Enter" key press to send messages
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Header */}
                <header className="bg-gray-500 text-white text-center p-4">
                    <h1 className="text-xl font-bold">Virtual Tutor</h1>
                </header>

                {/* Chatbox - Auto-scroll with Stop on Interaction */}
                <div
                    ref={chatboxRef}
                    className="p-4 h-[500px] overflow-y-auto space-y-4"
                    onScroll={handleScroll} // Detect user scroll
                    onClick={() => setIsUserScrolling(true)} // Stop auto-scroll if user clicks
                >
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex items-start space-x-2 ${
                                msg.sender === "user" ? "justify-end" : "justify-start"
                            }`}
                        >
                            {msg.sender === "bot" && <Bot className="w-8 h-8 text-gray-500" />}
                            <div
                                className={`p-3 rounded-lg max-w-lg text-sm leading-relaxed ${
                                    msg.sender === "user"
                                        ? "bg-blue-500 text-white"
                                        : "bg-gray-200 text-gray-800"
                                }`}
                                style={{ whiteSpace: "pre-line" }} // Ensure formatting of text
                            >
                                {msg.text}
                            </div>
                            {msg.sender === "user" && <User className="w-8 h-8 text-blue-500" />}
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {loading && (
                        <div className="flex items-center space-x-2">
                            <Bot className="w-6 h-6 text-gray-500 animate-bounce" />
                            {/* <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 animate-pulse">
                                ...
                            </div> */}
                        </div>
                    )}
                </div>

                {/* Input Box - Bigger & Auto-Expanding */}
                <div className="bg-white p-4 border-t flex items-center">
                    <TextareaAutosize
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type a message..."
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                        minRows={1}
                        maxRows={5}
                    />
                    <button
                        onClick={sendMessage}
                        className="ml-3 bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chatbot;
