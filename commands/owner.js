const config = require("../config");

module.exports = {
    name: ".owner",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: `👑 Owner Number:\n${config.ownerNumber}`
        });
    }
};
