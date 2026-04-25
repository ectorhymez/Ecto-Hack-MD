const fs = require("fs");
const path = require("path");

module.exports = (sock) => {
    const commands = new Map();

    // Load all command files
    const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "handler.js");

    for (const file of files) {
        const command = require(path.join(__dirname, file));
        commands.set(command.name, command);
    }

    // Listen for messages
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const body = text.toLowerCase().trim();
        const args = body.split(" ");
        const cmd = args[0];

        if (commands.has(cmd)) {
            commands.get(cmd).run(sock, msg, from, args);
        }
    });
};
