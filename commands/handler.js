const fs = require("fs");
const path = require("path");

module.exports = (sock) => {
    const commands = new Map();

    // Load commands safely
    const files = fs.readdirSync(__dirname).filter(f => f.endsWith(".js") && f !== "handler.js");

    for (const file of files) {
        try {
            const command = require(path.join(__dirname, file));
            if (command.name && command.run) {
                commands.set(command.name, command);
            }
        } catch (e) {
            console.log(`Failed to load command ${file}:`, e.message);
        }
    }

    // Message listener
    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
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
                try {
                    await commands.get(cmd).run(sock, msg, from, args);
                } catch (err) {
                    console.log("Command error:", err.message);
                    await sock.sendMessage(from, {
                        text: "⚠️ Command error occurred."
                    });
                }
            }

        } catch (err) {
            console.log("Handler error:", err.message);
        }
    });
};
