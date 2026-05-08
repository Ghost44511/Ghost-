const blankx7 = async (client, msg) => {
    // Caractère invisible spécial
    const invisible = "‎".repeat(500);
    await client.sendMessage(msg.from, { text: `🤴 *Nettoyage Prince K*\n${invisible}\n_Chat dégagé._` });
};
module.exports = blankx7;
