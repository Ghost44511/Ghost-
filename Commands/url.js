const axios = require('axios');

const urlCmd = async (client, msg, args) => {
    const action = args[0]?.toLowerCase();
    const link = args[1];
    const monNumero = '237650554606@s.whatsapp.net';

    if (!action) {
        return msg.reply(`
🤴 *PRINCE K - URL TOOLS* 🤴

• *.url tiny [lien]* : Raccourcit une URL longue.
• *.url download [lien]* : Télécharge une vidéo (YT/TT/IG).
• *.url qr [lien]* : Génère un QR Code pour ce lien.`);
    }

    try {
        switch (action) {
            // --- RACCOURCIR UN LIEN ---
            case 'tiny':
            case 'short':
                if (!link) return msg.reply("❌ *Prince K:* Fournissez un lien à raccourcir.");
                msg.reply("⏳ Traitement par Prince K...");
                const short = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(link)}`);
                await client.sendMessage(msg.from, { 
                    text: `🤴 *LIEN RACCOURCI*\n\n🔗 *Original:* ${link}\n✨ *Court:* ${short.data}` 
                });
                break;

            // --- TÉLÉCHARGER DEPUIS UN LIEN ---
            case 'download':
            case 'dl':
                if (!link) return msg.reply("❌ *Prince K:* Fournissez un lien (YouTube, TikTok, Instagram).");
                msg.reply("⏳ *Prince K* récupère le média, veuillez patienter...");
                
                // Utilisation d'une API de téléchargement universelle (Exemple via l'API Lokesh ou similaire)
                const dlRes = await axios.get(`https://api.piscart.com/download?url=${encodeURIComponent(link)}`); // Remplace par ton API fonctionnelle
                const mediaUrl = dlRes.data.url;

                await client.sendMessage(msg.from, { 
                    video: { url: mediaUrl }, 
                    caption: `✅ Média récupéré avec succès par *Prince K*` 
                });
                break;

            // --- GÉNÉRER UN QR CODE ---
            case 'qr':
                if (!link) return msg.reply("❌ *Prince K:* Fournissez un texte ou un lien pour le QR Code.");
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`;
                await client.sendMessage(msg.from, { 
                    image: { url: qrUrl }, 
                    caption: `🖼️ *QR CODE BY PRINCE K*\n🔗 Destination: ${link}` 
                });
                break;

            default:
                msg.reply("❓ Action inconnue. Tapez *.url* pour voir les options.");
        }
    } catch (error) {
        console.error("Erreur URL Prince K:", error);
        msg.reply("❌ *Prince K:* Une erreur est survenue lors du traitement du lien.");
    }
};

module.exports = urlCmd;
