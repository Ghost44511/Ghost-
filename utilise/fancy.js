const fancy = async (client, msg, args) => {
    const text = args.join(" ");
    if (!text) return msg.reply("✍️ Écrivez un texte pour le styliser.");
    
    // Exemple de transformation simple (Bulles)
    const bulles = text.split('').map(char => {
        const codes = { 'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ' }; // Ajoute le reste de l'alphabet
        return codes[char.toLowerCase()] || char;
    }).join('');

    msg.reply(`🤴 *STYLE PRINCE K*\n\n${bulles}`);
};
module.exports = fancy;
