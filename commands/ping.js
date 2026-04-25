module.exports = {
    name: ".ping",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, { text: "Pong ✔" });
    }
};
