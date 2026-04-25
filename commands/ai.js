const axios = require("axios");

module.exports = {
    name: ".ai",
    run: async (sock, msg, from, args) => {
        const prompt = args.slice(1).join(" ");

        if (!prompt) {
            return sock.sendMessage(from, {
                text: "❌ Usage: .ai your question here"
            });
        }

        try {
            await sock.sendMessage(from, {
                text: "🤖 Thinking..."
            });

            // Simple free AI endpoint (you can replace later)
            const res = await axios.get(
                `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(prompt)}&botname=Ecto+AI`
            );

            const reply = res.data.message || "No response from AI.";

            await sock.sendMessage(from, {
                text: `🤖 AI:\n\n${reply}`
            });

        } catch (err) {
            console.log("AI error:", err.message);

            await sock.sendMessage(from, {
                text: "⚠️ AI service error."
            });
        }
    }
};
