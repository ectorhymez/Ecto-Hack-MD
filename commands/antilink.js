module.exports = {
    name: ".antilink",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: "🛡️ Anti-link system is now ACTIVE in this chat."
        });
    }
};
