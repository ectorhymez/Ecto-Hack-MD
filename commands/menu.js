module.exports = {
    name: ".menu",
    run: async (sock, msg, from, args) => {
        const menuText = `
⚡ *ECTO HACK MD MENU*

🤖 AI FEATURES
.ai - Chat with AI

🧰 BASIC COMMANDS
.ping - Test bot
.help - Command list

👑 OWNER
(shown only if you are owner in future updates)

━━━━━━━━━━━━━━
Powered by Ecto Hack MD
        `;

        await sock.sendMessage(from, {
            text: menuText
        });
    }
};
