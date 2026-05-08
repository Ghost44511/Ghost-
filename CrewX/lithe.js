const lithe = async (client, msg, args) => {
    const text = args.join(" ");
    if (!text) return msg.reply("🖊️ Écrivez un texte après .lithe");
    
    const stylise = text.split('').map(char => char + '᷀').join(''); // Effet de style simple
    msg.reply(`🤴 *PRINCE K STYLE* :\n\n${stylise}`);
};
module.exports = lithe;
