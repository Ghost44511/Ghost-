const { downloadContentFromMessage } = require('@whiskeysockets/baileys'); // Si tu utilises Baileys
const axios = require('axios');

const imageCmd = async (client, msg, args, command) => {
    const action = args[0]?.toLowerCase();
    const query = args.slice(1).join(" ");

    switch (action) {
        // --- RECHERCHE D'IMAGES (Pinterest / Google) ---
        case 'search':
        case 'find':
            if (!query) return msg.reply("🤴 *Prince K:* Que dois-je chercher ? (ex: .img search lion)");
            msg.reply("🔍 Recherche en cours...");
            try {
                // Note: Remplace par ton API de recherche préférée
                const response = await axios.get(`https://api.screenshotmachine.com/api_url_ici?q=${query}`);
                const imageUrl = response.data.url; 
                await client.sendMessage(msg.from, { image: { url: imageUrl }, caption: `Résultat pour : ${query}\nBy *Prince K*` });
            } catch (e) {
                msg.reply("❌ Erreur lors de la recherche.");
            }
            break;

        // --- GÉNÉRATION D'IMAGE PAR IA (DALL-E / Stable Diffusion) ---
        case 'gen':
        case 'ai':
            if (!query) return msg.reply("🤴 *Prince K:* Décris l'image à générer.");
            msg.reply("🎨 L'IA de *Prince K* dessine pour vous...");
            try {
                const aiUrl = `https://api.piscart.com/generate?prompt=${encodeURIComponent(query)}`; // Exemple d'API
                await client.sendMessage(msg.from, { image: { url: aiUrl }, caption: `✨ Image générée pour : ${query}` });
            } catch (e) {
                msg.reply("❌ L'IA est saturée, réessayez plus tard.");
            }
            break;

        // --- CONVERSION IMAGE EN STICKER ---
        case 'sticker':
        case 's':
            const quoted = msg.quoted ? msg.quoted : msg;
            if (quoted.mtype === 'imageMessage') {
                msg.reply("⏳ Conversion en sticker par *Prince K*...");
                const stream = await downloadContentFromMessage(quoted, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                await client.sendMessage(msg.from, { sticker: buffer, packname: "Prince K Pack", author: "Prince K Bot" });
            } else {
                msg.reply("📸 Répondez à une image avec .img sticker");
            }
            break;

        // --- SUPPRIMER LE FOND (Remove BG) ---
        case 'rbg':
            if (msg.quoted && msg.quoted.mtype === 'imageMessage') {
                msg.reply("✂️ Suppression de l'arrière-plan...");
                // Logique pour appeler une API comme Remove.bg
            } else {
                msg.reply("📸 Répondez à une image pour enlever le fond.");
            }
            break;

        // --- MENU PAR DÉFAUT ---
        default:
            msg.reply(`
🤴 *COMMANDES IMAGE - PRINCE K* 🤴

• *.img search [sujet]* : Cherche une image sur le web.
• *.img gen [texte]* : Génère une image par IA.
• *.img sticker* : Transforme une image en sticker.
• *.img rbg* : Retire l'arrière-plan d'une image.
• *.img meme [texte]* : Crée un mème (nécessite plugin).

_Utilisez une option valide pour continuer._`);
            break;
    }
};

module.exports = imageCmd;
