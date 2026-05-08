const uptime = async (client, msg) => {
    const seconds = Math.floor(process.uptime());
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    await client.sendMessage(msg.from, { 
        text: `*Prince K en ligne depuis:* ${h}h ${m}m ${s}s` 
    });
};
module.exports = uptime;
