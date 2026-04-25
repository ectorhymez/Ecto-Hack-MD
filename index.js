const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const P = require("pino");

// connect command handler
const handler = require("./commands/handler");

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");

    const sock = makeWASocket({
        logger: P({ level: "silent" }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Ecto Hack MD", "Chrome", "1.0.0"]
    });

    // save login/session
    sock.ev.on("creds.update", saveCreds);

    // handle connection state
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
            console.log("✔ Ecto Hack MD is now connected to WhatsApp");
        }
    });

    // attach command system
    handler(sock);
}

startBot();
