const fs = require("fs");
const path = require("path");

module.exports = (sock) => {
    const commands = new Map();
    const pluginsPath = __dirname;

    // Auto-load all commands
    const loadCommands = () => {
        commands.clear();

        const files = fs.readdirSync(pluginsPath).filter(f => 
            f.endsWith(".js") && f !== "handler.js"
        );

        for (const file of files) {
            try {
                delete require.cache[require.resolve(path.join(pluginsPath, file))];

                const plugin = require(path.join(pluginsPath, file));

                if (plugin.name && plugin.run) {
                    commands.set(plugin.name, plugin);
                }

            } catch (err) {
                console.log(`Plugin load error (${file}):`, err.message);
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

            const text =
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text;

            if (!text) return;

            const body = text.toLowerCase().trim();
            const args = body.split(" ");
            const cmd = args[0];

            if (!commands.has(cmd)) return;

            await commands.get(cmd).run(sock, msg, from, args);

        } catch (err) {
            console.log("Runtime error:", err.message);
        }
    });

    // Optional: auto-reload every 10 seconds (dev mode)
    setInterval(loadCommands, 10000);
};
