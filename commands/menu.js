module.exports = {
    name: ".menu",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: `
⚡ *ECTO HACK MD MENU*

🤖 AI
.ai - Chat AI

🧰 TOOLS
.ping - Test bot
.help - Help menu

🛡️ SECURITY
.antilink - Anti-link system

🎭 MEDIA
.sticker - Sticker tool
.dl - Downloader

👑 OWNER
.owner - Owner info

━━━━━━━━━━━━━━
Powered by Ecto Hack MD
            `
        });
    }
};
