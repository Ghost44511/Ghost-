const { proto, getContentType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const MessageHandler = async (client, m, store) => {
    try {
        if (!m.message) return;
        m.message = (getContentType(m.message) === 'viewOnceMessageV2') ? m.message.viewOnceMessageV2.message : m.message;
        
        const type = getContentType(m.message);
        const sender = m.key.participant || m.key.remoteJid;
        const from = m.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        
        // --- CONFIGURATION PRINCE K ---
        const monNumero = '237650554606@s.whatsapp.net';
        const prefix = '.'; 
        const body = (type === 'conversation') ? m.message.conversation : 
                     (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : 
                     (type === 'imageMessage') ? m.message.imageMessage.caption : 
                     (type === 'videoMessage') ? m.message.videoMessage.caption : '';

        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : '';
        const args = body.trim().split(/ +/).slice(1);
        const isMe = sender === monNumero;

        // --- GESTION DES COMMANDES ---
        if (isCmd) {
            console.log(`[PRINCE K] Commande: ${command} de ${sender}`);

            // 1. Redirection vers les fichiers du dossier /Commands
            const cmdPath = path.join(__dirname, 'Commands', `${command}.js`);
            const crewPath = path.join(__dirname, 'CrewX', `${command}.js`);

            if (fs.existsSync(cmdPath)) {
                const cmdFile = require(cmdPath);
                await cmdFile(client, m, args, command);
            } 
            // 2. Redirection vers les fichiers du dossier /CrewX
            else if (fs.existsSync(crewPath)) {
                const crewFile = require(crewPath);
                await crewFile(client, m, args, command);
            }
            
            // 3. Commandes intégrées directement (Rapides)
            switch (command) {
                case 'hi':
                case 'salut':
                    await client.sendMessage(from, { text: "Salut ! Je suis le bot de *Prince K*. Tapez .menu pour voir mes options." });
                    break;
                
                case 'eval': // Pour tester du code JS en direct (Réservé à toi)
                    if (!isMe) return;
                    try {
                        let evaled = await eval(args.join(" "));
                        await client.sendMessage(from, { text: String(evaled) });
                    } catch (err) {
                        await client.sendMessage(from, { text: String(err) });
                    }
                    break;
            }
        }

        // --- FONCTIONS AUTOMATIQUES (SANS COMMANDE) ---
        
        // Intercepter ViewOnce automatiquement (Appel du fichier créé précédemment)
        if (type === 'viewOnceMessageV2' || m.message?.viewOnceMessageV2) {
            const viewonce = require('./Commands/viewonce.js');
            await viewonce(client, m);
        }

    } catch (err) {
        console.log("Erreur MessageHandler:", err);
    }
};

module.exports = MessageHandler;
