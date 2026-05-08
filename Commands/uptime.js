const uptime = async (client, msg) => {
    // Calcul de la durée de fonctionnement en secondes
    const totalSeconds = process.uptime();
    
    // Conversion mathématique
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // Formatage du texte
    const uptimeString = `
🤴 *STATUT SYSTÈME - PRINCE K* 🤴

⏱️ *Temps d'activité :*
• ${days} Jour(s)
• ${hours} Heure(s)
• ${minutes} Minute(s)
• ${seconds} Seconde(s)

🚀 *État :* Opérationnel
📍 *Serveur :* Stable
`.trim();

    try {
        await client.sendMessage(msg.from, { 
            text: uptimeString,
            contextInfo: {
                externalAdReply: {
                    title: "PRINCE K BOT UPTIME",
                    body: "Le bot est actuellement en ligne",
                    thumbnailUrl: "https://telegra.ph/file/votre-image-uptime.jpg", // Optionnel
                    sourceUrl: "https://wa.me/237650554606",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        });
    } catch (error) {
        console.error("Erreur Uptime Prince K:", error);
        msg.reply(`🤴 *Prince K:* En ligne depuis ${minutes}m et ${seconds}s.`);
    }
};

module.exports = uptime;
