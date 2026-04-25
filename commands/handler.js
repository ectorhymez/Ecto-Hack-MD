const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (sock) => {
    const commands = new Map();

    // Load all commands
    const loadCommands = () => {
        commands.clear();

        const files = fs.readdirSync(__dirname).filter(
            f => f.endsWith(".js") && f !== "handler.js"
        );

        for (const file of files) {
            try {
                delete require.cache[require.resolve(path.join(__dirname, file))];

                const plugin = require(path.join(__dirname, file));

                if (plugin.name && plugin.run) {
                    commands.set(plugin.name, plugin);
                }

            } catch (err) {
                console.log(`❌ Load error (${file}):`, err.message);
            }
        }

        console.log(`✔ Commands loaded: ${commands.size}`);
    };

    loadCommands();

    sock.ev.on("messages.upsert", async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg.message) return;

            const from = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text;

            if (!text) return;

            const body = text.trim();

            // =========================
            // 🛡️ ANTI-LINK SYSTEM
            // =========================
            const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com)/gi;

            if (linkRegex.test(body)) {
                try {
                    await sock.sendMessage(from, {
                        text: "🚫 Link detected! Message not allowed."
                    });

                    await sock.sendMessage(from, {
                        delete: msg.key
                    });

                } catch (e) {
                    console.log("Anti-link error:", e.message);
                }

                return;
            }

            // =========================
            // PREFIX CHECK
            // =========================
            if (!body.startsWith(config.prefix)) return;

            const args = body.slice(config.prefix.length).split(" ");
            const cmd = config.prefix + args[0].toLowerCase();

            if (!commands.has(cmd)) return;

            const command = commands.get(cmd);

            // =========================
            // OWNER CHECK
            // =========================
            if (
                command.owner &&
                sender !== config.ownerNumber + "@s.whatsapp.net"
            ) {
                return sock.sendMessage(from, {
                    text: "⚠️ This command is owner-only."
                });
            }

            // =========================
            // RUN COMMAND SAFELY
            // =========================
            try {
                await command.run(sock, msg, from, args);
            } catch (err) {
                console.log("Command error:", err.message);

                await sock.sendMessage(from, {
                    text: "⚠️ Command execution failed."
                });
            }

        } catch (err) {
            console.log("Handler crash prevented:", err.message);
        }
    });

    // Auto reload commands (dev mode)
    setInterval(loadCommands, 10000);
};
