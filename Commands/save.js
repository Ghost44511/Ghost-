const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

const save = async (client, msg, args) => {
    // 1. Vérifier si l'utilisateur répond à un message
    if (!msg.quoted) {
        return msg.reply("❌ *Prince K:* Veuillez répondre au message (image, vidéo, texte) que vous souhaitez sauvegarder.");
    }

    const monNumero = '237659554606@s.whatsapp.net';
    const quoted = msg.quoted;
    const type = quoted.mtype;

    try {
        // --- CAS 1 : TEXTE ---
        if (type === 'conversation' || type === 'extendedTextMessage') {
            const textToSave = quoted.text || quoted.conversation;
            await client.sendMessage(monNumero, { 
                text: `📌 *NOTE SAUVEGARDÉE - PRINCE K*\n\n${textToSave}` 
            });
            return msg.reply("✅ Texte sauvegardé dans votre IB.");
        }

        // --- CAS 2 : MÉDIAS (Image, Vidéo, Audio, Sticker) ---
        const isMedia = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'].includes(type);

        if (isMedia) {
            msg.reply("⏳ *Prince K* transfère le média vers votre IB...");

            // Déterminer le type de stream
            let mediaType = type.replace('Message', '');
            if (type === 'audioMessage') mediaType = 'audio';
            if (type === 'documentMessage') mediaType = 'document';

            const stream = await downloadContentFromMessage(quoted, mediaType);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Préparation de l'envoi
            const options = {
                [mediaType]: buffer,
                caption: quoted.caption ? `📩 *Sauvegarde Prince K :*\n${quoted.caption}` : `📩 *Sauvegarde Prince K*`,
                mimetype: quoted.mimetype
            };

            // Si c'est un audio, on précise le PTT si nécessaire
            if (type === 'audioMessage') options.ptt = quoted.ptt;

            await client.sendMessage(monNumero, options);
            return msg.reply("✅ Média sauvegardé avec succès.");
        }

        // --- CAS 3 : CONTACTS ---
        if (type === 'contactMessage') {
            await client.sendMessage(monNumero, { forward: msg.quoted });
            return msg.reply("✅ Contact sauvegardé.");
        }

    } catch (error) {
        console.error("Erreur Save Prince K:", error);
        msg.reply("❌ Une erreur est survenue lors de la sauvegarde.");
    }
};

module.exports = save;
