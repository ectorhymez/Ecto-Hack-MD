const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Ecto Hack MD", "Chrome", "1.0.0"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            console.log("Connection closed. Reconnecting:", shouldReconnect);

            if (shouldReconnect) {
                startBot();
            }
        } else if (connection === "open") {
            console.log("Ecto Hack MD is now connected to WhatsApp ✔");
        }
    });

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const from = msg.key.remoteJid;

        // Simple test command
        if (text.toLowerCase() === "ping") {
            await sock.sendMessage(from, { text: "Pong ✔" });
        }
    });
}

startBot();
