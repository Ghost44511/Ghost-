const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const config = require('./config');
const fs = require('fs');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(`./${global.sessionName}`);
    const client = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Prince-K-Bot', 'Safari', '1.0.0']
    });

    client.ev.on('creds.update', saveCreds);

    client.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            const from = m.key.remoteJid;
            const type = Object.keys(m.message)[0];
            const content = JSON.stringify(m.message);
            const body = (type === 'conversation') ? m.message.conversation : (type === 'extendedTextMessage') ? m.message.extendedTextMessage.text : '';
            
            const isCmd = body.startsWith(global.prefix);
            const command = isCmd ? body.slice(1).trim().split(/ +/).shift().toLowerCase() : null;
            const args = body.trim().split(/ +/).slice(1);
            const isOwner = global.owner.includes(m.key.participant || m.key.remoteJid.split('@')[0]);

            // --- SYSTÈME DE COMMANDES ---
            if (isCmd) {
                // Sécurité : Seul Prince K peut commander
                if (!isOwner && !global.public) return;

                switch (command) {
                    case 'menu':
                    case 'help':
                        let menuText = `*👑 SALUT PRINCE K !*\n\n` +
                                       `*Commandes disponibles :*\n` +
                                       `> .ping (Vitesse du bot)\n` +
                                       `> .owner (Infos créateur)\n` +
                                       `> .runtime (Temps d'activité)\n` +
                                       `> .eval (Tester du code JS)\n` +
                                       `> .kick (Si dans un groupe)`;
                        await client.sendMessage(from, { text: menuText }, { quoted: m });
                        break;

                    case 'ping':
                        await client.sendMessage(from, { text: '🏓 Pong ! Bot actif sur Katabump.' });
                        break;

                    case 'runtime':
                        const uptime = process.uptime();
                        await client.sendMessage(from, { text: `Actif depuis : ${Math.floor(uptime / 60)} minutes.` });
                        break;

                    case 'owner':
                        await client.sendMessage(from, { 
                            text: `Le maître est Prince K.\nNuméro : ${global.owner[0]}` 
                        });
                        break;

                    default:
                        if (isOwner) await client.sendMessage(from, { text: "Commande inconnue, Prince K. Tape .menu" });
                }
            }
        } catch (err) {
            console.log("Erreur : ", err);
        }
    });

    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Prince-K-Bot est prêt sur Katabump !');
        }
    });
}

startBot();
      
