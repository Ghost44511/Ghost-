const group = async (client, msg, args, command) => {
    if (!msg.isGroup) return msg.reply("❌ Cette commande est réservée aux groupes.");
    
    // Vérification des permissions (Prince K doit être admin)
    const groupMetadata = await client.groupMetadata(msg.from);
    const participants = groupMetadata.participants;
    const botIsAdmin = participants.find(p => p.id === client.user.id.split(':')[0] + '@s.whatsapp.net')?.admin;
    
    if (!botIsAdmin) return msg.reply("⚠️ *Prince K* doit être administrateur pour exécuter ces actions.");

    const action = args[0]?.toLowerCase();
    const user = msg.mentionedJid[0] || (msg.quoted ? msg.quoted.sender : null);

    switch (action) {
        // --- GESTION DES MEMBRES ---
        case 'add':
            if (!args[1]) return msg.reply("Précisez le numéro (ex: .group add 2376...)");
            await client.groupParticipantsUpdate(msg.from, [`${args[1]}@s.whatsapp.net`], "add");
            break;

        case 'kick':
            if (!user) return msg.reply("Identifiez l'utilisateur à bannir.");
            await client.groupParticipantsUpdate(msg.from, [user], "remove");
            msg.reply("🚫 Membre expulsé par *Prince K*.");
            break;

        case 'promote':
            if (!user) return msg.reply("Identifiez l'utilisateur à promouvoir.");
            await client.groupParticipantsUpdate(msg.from, [user], "promote");
            msg.reply("👑 Nouveau admin nommé par *Prince K*.");
            break;

        case 'demote':
            if (!user) return msg.reply("Identifiez l'administrateur à destituer.");
            await client.groupParticipantsUpdate(msg.from, [user], "demote");
            msg.reply("📉 Admin destitué par *Prince K*.");
            break;

        // --- PARAMÈTRES DU GROUPE ---
        case 'open':
            await client.groupSettingUpdate(msg.from, 'not_announcement');
            msg.reply("🔓 Groupe ouvert ! Tout le monde peut écrire.");
            break;

        case 'close':
            await client.groupSettingUpdate(msg.from, 'announcement');
            msg.reply("🔒 Groupe fermé ! Seuls les admins écrivent.");
            break;

        case 'lock':
            await client.groupSettingUpdate(msg.from, 'locked');
            msg.reply("⚙️ Modification des infos du groupe réservée aux admins.");
            break;

        case 'unlock':
            await client.groupSettingUpdate(msg.from, 'unlocked');
            msg.reply("⚙️ Modification des infos ouverte à tous.");
            break;

        // --- INFOS ET LIENS ---
        case 'link':
            const code = await client.groupInviteCode(msg.from);
            msg.reply(`🔗 *Lien du groupe :* https://chat.whatsapp.com/${code}`);
            break;

        case 'revoke':
            await client.groupRevokeInvite(msg.from);
            msg.reply("🔄 Lien d'invitation réinitialisé par *Prince K*.");
            break;

        case 'desc':
            if (!args[1]) return msg.reply("Veuillez écrire la nouvelle description.");
            await client.groupUpdateDescription(msg.from, args.slice(1).join(" "));
            msg.reply("📝 Description mise à jour.");
            break;

        case 'subject':
            if (!args[1]) return msg.reply("Veuillez écrire le nouveau nom du groupe.");
            await client.groupUpdateSubject(msg.from, args.slice(1).join(" "));
            msg.reply("🏷️ Nom du groupe changé.");
            break;

        default:
            msg.reply(`
🤴 *GESTION GROUPE - PRINCE K* 🤴

*Membres:*
• .group add [numéro]
• .group kick [@mention]
• .group promote [@mention]
• .group demote [@mention]

*Paramètres:*
• .group open / close
• .group lock / unlock
• .group subject [nom]
• .group desc [texte]

*Sécurité:*
• .group link (lien d'invitation)
• .group revoke (reset lien)`);
            break;
    }
};

module.exports = group;
  
