module.exports = {
    name: ".admin",
    run: async (sock, msg, from) => {
        await sock.sendMessage(from, {
            text: `
👑 ADMIN SYSTEM

.kick @user - remove member
.promote @user - make admin
.demote @user - remove admin

⚠️ Bot must be admin in group
            `
        });
    }
};
