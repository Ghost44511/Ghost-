const bug = async (client, msg, args) => {
    const report = args.join(" ");
    if (!report) return msg.reply("✍️ Veuillez décrire le bug (ex: .bug la commande image ne marche pas)");
    
    const monNumero = '237650554606@s.whatsapp.net';
    const info = `🐞 *RAPPORT DE BUG - PRINCE K*\n\n👤 *De:* @${msg.sender.split('@')[0]}\n📝 *Message:* ${report}`;
    
    await client.sendMessage(monNumero, { text: info, mentions: [msg.sender] });
    msg.reply("✅ Merci ! Votre rapport a été envoyé à *Prince K*.");
};
module.exports = bug;
