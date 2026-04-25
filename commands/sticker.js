module.exports = {
    name: ".sticker",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: "🎭 Sticker feature coming soon (needs media processing module)."
        });
    }
};
