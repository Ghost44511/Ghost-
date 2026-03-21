const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const readline = require('readline');

// Configuration pour lire le code dans le terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
        },
        printQRInTerminal: false, // On désactive le QR pour utiliser le code
        logger: pino({ level: 'fatal' }),
        browser: ['Ubuntu', 'Chrome', '20.0.04'],
    });

    // --- LOGIQUE DU CODE À 8 CHIFFRES (PAIRING CODE) ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = "237650554606"; // Ton numéro configuré
        setTimeout(async () => {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join('-') || code;
            console.log(`\n\n--- TA SESSION PRINCE K ---`);
            console.log(`TON CODE DE JUMELAGE EST : ${code}`);
            console.log(`----------------------------\n\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const body = (type === 'conversation') ? msg.message.conversation : 
                     (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';

        const prefix = ".";
        const botName = "Prince K Bot";

        if (body.startsWith(prefix)) {
            const command = body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase();

            switch (command) {
                case 'menu':
                    const menu = `
🌟 *${botName}* 🌟
👤 *Dev:* Prince K
📞 *Num:* 237650554606

*COMMANDES DISPONIBLES :*
> ${prefix}ping - État du bot
> ${prefix}owner - Infos Prince K
> ${prefix}runtime - Temps d'activité
> ${prefix}sticker - Image en autocollant
> ${prefix}kick - Supprimer un membre (Admin)
> ${prefix}hidetag - Taguer tout le groupe
`;
                    await sock.sendMessage(from, { text: menu });
                    break;

                case 'ping':
                    await sock.sendMessage(from, { text: 'Bot en ligne ! ✅' });
                    break;

                case 'owner':
                    await sock.sendMessage(from, { text: "Le propriétaire est Prince K (237650554606)" });
                    break;

                default:
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
            console.log('✅ Prince K Bot est connecté !');
        }
    });
}

// Correction de l'erreur de la ligne 50 (Parenthèse fermée)
const code8 = Math.floor(Math.random() * 1000000);
console.log("Système initialisé avec succès.");

startBot();
