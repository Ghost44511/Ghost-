const crew = async (client, msg, args) => {
    const monNumero = '237650554606@s.whatsapp.net';
    const action = args[0]?.toLowerCase();
    const groupMetadata = msg.isGroup ? await client.groupMetadata(msg.from) : null;

    if (!action) {
        return msg.reply(`
🤴 *COMMANDES ELITE - PRINCE K CREW* 🤴

• *.crew list* : Affiche les membres de l'élite.
• *.crew promoteall* : (Admin) Tout le monde devient admin.
• *.crew demoteall* : (Admin) Retire tous les admins (sauf toi).
• *.crew stats* : Statistiques d'activité du groupe.
• *.crew setname [nom]* : Change le nom de la crew.
• *.crew warn @mention* : Donne un avertissement.
• *.crew resetwarn* : Réinitialise les avertissements.`);
    }

    try {
        switch (action) {
            // --- LISTE DES MEMBRES ---
            case 'list':
                if (!msg.isGroup) return msg.reply("❌ Uniquement en groupe.");
                let list = `👥 *MEMBRES DE LA CREW PRINCE K*\n\n`;
                groupMetadata.participants.forEach((p, i) => {
                    list += `${i + 1}. @${p.id.split('@')[0]} ${p.admin ? '👑' : ''}\n`;
                });
                await client.sendMessage(msg.from, { text: list, mentions: groupMetadata.participants.map(p => p.id) });
                break;

            // --- PROMOTE TOUT LE MONDE ---
            case 'promoteall':
                if (msg.sender !== monNumero) return msg.reply("⚠️ Seul le Prince K peut faire ça.");
                const members = groupMetadata.participants.map(p => p.id);
                await client.groupParticipantsUpdate(msg.from, members, "promote");
                msg.reply("👑 *Prince K* a nommé tout le monde administrateur !");
                break;

            // --- DEMOTE TOUT LE MONDE ---
            case 'demoteall':
                if (msg.sender !== monNumero) return msg.reply("⚠️ Seul le Prince K peut faire ça.");
                const admins = groupMetadata.participants.filter(p => p.admin && p.id !== monNumero).map(p => p.id);
                await client.groupParticipantsUpdate(msg.from, admins, "demote");
                msg.reply("📉 *Prince K* a retiré les privilèges de tout le monde.");
                break;

            // --- STATISTIQUES DU GROUPE ---
            case 'stats':
                const owner = groupMetadata.owner || "Inconnu";
                msg.reply(`
📊 *CREW STATS*
📍 *Nom :* ${groupMetadata.subject}
👥 *Membres :* ${groupMetadata.participants.length}
👑 *Créateur :* @${owner.split('@')[0]}
🕒 *Créé le :* ${new Date(groupMetadata.creation * 1000).toLocaleDateString('fr-FR')}`, 
                { mentions: [owner] });
                break;

            // --- SYSTÈME D'AVERTISSEMENT (WARN) ---
            case 'warn':
                const target = msg.mentionedJid[0] || (msg.quoted ? msg.quoted.sender : null);
                if (!target) return msg.reply("❌ Mentionnez quelqu'un à avertir.");
                // Note: Ici tu pourrais lier une base de données, mais on fait simple :
                msg.reply(`⚠️ @${target.split('@')[0]}, vous avez reçu un avertissement de la part de *Prince K*. (1/3)`, { mentions: [target] });
                break;

            // --- CHANGEMENT DE NOM ---
            case 'setname':
                const newName = args.slice(1).join(" ");
                if (!newName) return msg.reply("✍️ Donnez un nouveau nom.");
                await client.groupUpdateSubject(msg.from, `🤴 ${newName}`);
                msg.reply("✅ Nom de la crew mis à jour.");
                break;

            default:
                msg.reply("❓ Option inconnue dans le module Crew.");
        }
    } catch (error) {
        console.error("Erreur Crew Prince K:", error);
        msg.reply("❌ Échec de la commande Crew.");
    }
};

module.exports = crew;
