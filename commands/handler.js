const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (sock) => {
    const commands = new Map();

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
                console.log(`❌ Error loading ${file}:`, err.message);
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

            // MUST start with prefix
            if (!body.startsWith(config.prefix)) return;

            const args = body.slice(config.prefix.length).split(" ");
            const cmd = config.prefix + args[0].toLowerCase();

            if (!commands.has(cmd)) return;

            const command = commands.get(cmd);

            // OWNER ONLY CHECK
            if (
                command.owner &&
                sender !== config.ownerNumber + "@s.whatsapp.net"
            ) {
                return sock.sendMessage(from, {
                    text: "⚠️ Owner only command."
                });
            }

            await command.run(sock, msg, from, args);

        } catch (err) {
            console.log("Handler error:", err.message);
        }
    });

    setInterval(loadCommands, 10000);
};
