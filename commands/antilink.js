module.exports = {
    name: ".antilink",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: "🛡️ Anti-link feature is active (basic mode placeholder)."
        });
    }
};
