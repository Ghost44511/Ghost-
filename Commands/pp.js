const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const pp = async (client, msg, args) => {
    // Ton numéro mis à jour
    const monNumero = '237650554606@s.whatsapp.net';
    const action = args[0]?.toLowerCase();

    try {
        // --- CAS 1 : RÉCUPÉRER LA PHOTO DE QUELQU'UN (.pp get) ---
        if (action === 'get') {
            // Cible : la personne mentionnée, ou celle à qui on répond, ou le groupe actuel
            const target = msg.mentionedJid[0] || (msg.quoted ? msg.quoted.sender : msg.from);
            
            try {
                // Récupération de l'URL de la photo en haute résolution ('image')
                const ppUrl = await client.profilePictureUrl(target, 'image');
                
                await client.sendMessage(monNumero, { 
                    image: { url: ppUrl }, 
                    caption: `📸 *PRINCE K - STALK PROFILE*\n\n👤 *Cible :* @${target.split('@')[0]}\n📍 *Action :* Photo récupérée avec succès.`,
                    mentions: [target]
                });
                
                return msg.reply("✅ Photo envoyée discrètement dans votre IB.");
            } catch (e) {
                return msg.reply("❌ Impossible de récupérer la photo. (L'utilisateur n'a pas de photo ou son profil est trop privé).");
            }
        }

        // --- CAS 2 : CHANGER LA PHOTO DU BOT (.pp set) ---
        if (action === 'set') {
            // Sécurité : Seul toi (l'admin) peux changer la photo du bot
            if (msg.sender !== monNumero) {
                return msg.reply("⚠️ Seul mon maître *Prince K* peut modifier mon visage.");
            }

            const quoted = msg.quoted ? msg.quoted : msg;
            if (quoted.mtype !== 'imageMessage') {
                return msg.reply("📸 Répondez à une image avec la commande *.pp set* pour changer ma photo de profil.");
            }

            msg.reply("⏳ *Prince K* met à jour son profil...");
            
            // Téléchargement de l'image
            const stream = await downloadContentFromMessage(quoted, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Application de la nouvelle photo au compte du bot
            await client.updateProfilePicture(client.user.id, buffer);
            return msg.reply("✅ Ma photo de profil a été mise à jour avec succès !");
        }

        // --- MENU D'AIDE SI AUCUNE OPTION ---
        msg.reply(`
🤴 *COMMANDES PROFIL - PRINCE K* 🤴

• *.pp get [@mention]* : Vole la photo de profil et l'envoie au +237650554606.
• *.pp set* : Change ma photo de profil (Répondez à une image).`);

    } catch (error) {
        console.error("Erreur PP.js Prince K:", error);
        msg.reply("❌ Une erreur technique est survenue.");
    }
};

module.exports = pp;
