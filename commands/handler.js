const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (sock) => {
    const commands = new Map();

    const isGroup = (jid) => jid.endsWith("@g.us");

    // =========================
    // LOAD COMMANDS
    // =========================
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

    // =========================
    // MESSAGE LISTENER
    // =========================
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
                        text: "🚫 Link detected and removed."
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

            const mentioned =
                msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

            // =========================
            // 👑 OWNER CHECK (for plugin-based owner commands)
            // =========================
            const command = commands.get(cmd);

            if (!command) return;

            if (
                command.owner &&
                sender !== config.ownerNumber + "@s.whatsapp.net"
            ) {
                return sock.sendMessage(from, {
                    text: "⚠️ Owner only command."
                });
            }

            // =========================
            // 👥 ADMIN COMMANDS (built-in)
            // =========================

            // KICK
            if (cmd === config.prefix + "kick") {
                if (!isGroup(from)) return;

                try {
                    if (!mentioned[0]) {
                        return sock.sendMessage(from, {
                            text: "❌ Mention a user to kick."
                        });
                    }

                    await sock.groupParticipantsUpdate(from, [mentioned[0]], "remove");

                    await sock.sendMessage(from, {
                        text: "👢 User kicked."
                    });

                } catch (e) {
                    console.log("Kick error:", e.message);
                }
                return;
            }

            // PROMOTE
            if (cmd === config.prefix + "promote") {
                if (!isGroup(from)) return;

                try {
                    if (!mentioned[0]) {
                        return sock.sendMessage(from, {
                            text: "❌ Mention a user to promote."
                        });
                    }

                    await sock.groupParticipantsUpdate(from, [mentioned[0]], "promote");

                    await sock.sendMessage(from, {
                        text: "⬆️ User promoted to admin."
                    });

                } catch (e) {
                    console.log("Promote error:", e.message);
                }
                return;
            }

            // DEMOTE
            if (cmd === config.prefix + "demote") {
                if (!isGroup(from)) return;

                try {
                    if (!mentioned[0]) {
                        return sock.sendMessage(from, {
                            text: "❌ Mention a user to demote."
                        });
                    }

                    await sock.groupParticipantsUpdate(from, [mentioned[0]], "demote");

                    await sock.sendMessage(from, {
                        text: "⬇️ User demoted."
                    });

                } catch (e) {
                    console.log("Demote error:", e.message);
                }
                return;
            }

            // =========================
            // RUN PLUGIN COMMANDS
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

    // Auto reload system
    setInterval(loadCommands, 10000);
};
