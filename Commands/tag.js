const tag = async (client, msg, args) => {
    // Vérification si c'est un groupe
    if (!msg.isGroup) return msg.reply("❌ Cette commande est réservée aux groupes.");

    try {
        // Récupération de tous les membres du groupe
        const groupMetadata = await client.groupMetadata(msg.from);
        const participants = groupMetadata.participants;
        
        // Extraction des IDs (numéros) pour la notification système
        const jids = participants.map(p => p.id);

        // Récupération du message personnalisé si présent, sinon message par défaut
        const messagePerso = args.join(" ") || "Réveillez-vous !";

        // --- LA MAGIE DU PRINCE K ---
        // On envoie le texte "Prince K", mais on attache la liste des JIDs en cache
        await client.sendMessage(msg.from, {
            text: `🤴 *${messagePerso}*\n\nBy *PRINCE K*`,
            mentions: jids // C'est ici que tout le monde est tagué silencieusement
        });

    } catch (error) {
        console.error("Erreur Tag Prince K:", error);
        msg.reply("❌ Une erreur est survenue lors du marquage.");
    }
};

module.exports = tag;
  
