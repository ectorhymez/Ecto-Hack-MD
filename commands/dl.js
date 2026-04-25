module.exports = {
    name: ".dl",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: "📥 Downloader system coming soon (YouTube/TikTok module)."
        });
    }
};
