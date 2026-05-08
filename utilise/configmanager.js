const configmanager = async (client, msg, args) => {
    const monNumero = '237650554606@s.whatsapp.net';
    if (msg.sender !== monNumero) return msg.reply("⚠️ Accès refusé.");

    const setting = args[0];
    const value = args[1];

    if (setting === 'prefix') {
        // Logique pour sauvegarder le nouveau préfixe
        msg.reply(`✅ Préfixe changé en : ${value}`);
    } else {
        msg.reply("⚙️ *CONFIG PRINCE K*\n\n• .configmanager prefix [symbole]");
    }
};
module.exports = configmanager;
