module.exports = {
    name: ".help",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: `
🤖 Ecto Hack MD Commands

.ping
.help
.menu
.info
            `
        });
    }
};
