const fs = require("fs");
const path = require("path");
const config = require("../config");

module.exports = (sock) => {
    const commands = new Map();
    const pluginsPath = __dirname;

    // Load all commands safely
    const loadCommands = () => {
        commands.clear();

        const files = fs.readdirSync(pluginsPath).filter(
            f => f.endsWith(".js") && f !== "handler.js"
        );

        for (const file of files) {
            try {
                delete require.cache[require.resolve(path.join(pluginsPath, file))];

                const plugin = require(path.join(pluginsPath, file));

                if (plugin.name && plugin.run) {
                    commands.set(plugin.name, plugin);
                }

            } catch (err) {
                console.log(`❌ Failed to load ${file}:`, err.message);
            }
        }

        console.log(`✔ Loaded ${commands.size} commands`);
    };

    loadCommands();

    // Message listener
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
            const args = body.split(" ");
            const cmd = args[0].toLowerCase();

            // Check command exists
            if (!commands.has(cmd)) return;

            const command = commands.get(cmd);

            // OWNER CHECK (if required by command)
            if (command.owner && sender !== config.ownerNumber + "@s.whatsapp.net") {
                return sock.sendMessage(from, {
                    text: "⚠️ This command is for owner only."
                });
            }

            // Run command safely
            try {
                await command.run(sock, msg, from, args);
            } catch (err) {
                console.log("Command error:", err.message);

                await sock.sendMessage(from, {
                    text: "⚠️ Error executing command."
                });
            }

        } catch (err) {
            console.log("Handler crash prevented:", err.message);
        }
    });

    // Auto reload plugins every 10 seconds
    setInterval(loadCommands, 10000);
};
