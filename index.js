const { 
    makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Prince K Bot', 'MacOS', '3.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const body = (type === 'conversation') ? msg.message.conversation : 
                     (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';

        // Configuration de Prince K
        const botName = "Prince K Bot";
        const ownerNumber = "237650554606@s.whatsapp.net";
        const prefix = ".";

        if (body.startsWith(prefix)) {
            const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

            switch (command) {
                case 'menu':
                case 'help':
                    const menu = `
🌟 *${botName}* 🌟
👤 *Propriétaire:* Prince K
📞 *Contact:* 237650554606

*COMMANDES DISPONIBLES :*

✨ *Général*
> ${prefix}ping - Tester la vitesse
> ${prefix}owner - Infos du créateur
> ${prefix}menu - Afficher cette liste

🛠️ *Outils*
> ${prefix}runtime - Temps d'activité
> ${prefix}sticker - Transformer image en sticker
> ${prefix}ai [question] - Poser une question à l'IA

👥 *Groupe*
> ${prefix}kick @user - Bannir un membre
> ${prefix}add [numéro] - Ajouter un membre
> ${prefix}group [open/close] - Gérer le groupe

📥 *Téléchargement*
> ${prefix}play [titre] - Musique YouTube
> ${prefix}video [titre] - Vidéo YouTube
`;
                    await sock.sendMessage(from, { text: menu });
                    break;

                case 'ping':
                    await sock.sendMessage(from, { text: 'Pong! 🏓 Bot actif.' });
                    break;

                case 'owner':
                    await sock.sendMessage(from, { text: "Le développeur est Prince K. Contact: 237650554606" });
                    break;

                case 'runtime':
                    const uptime = process.uptime();
                    await sock.sendMessage(from, { text: `En ligne depuis : ${Math.floor(uptime / 60)} minutes` });
                    break;

                default:
                    // Optionnel : Message si la commande n'existe pas
                    break;
            }
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Prince K Bot est connecté avec succès !');
        }
    });
}

// Correction de l'erreur de la ligne 50 (Math.floor)
const code8 = Math.floor(Math.random() * 1000000); 
console.log("Code d'initialisation : " + code8);

startBot();
