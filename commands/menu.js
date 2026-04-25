module.exports = {
    name: ".menu",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: `
⚡ MAIN MENU

.ping
.help
.menu
            `
        });
    }
};
