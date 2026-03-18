const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function startPrinceKBot() {
    // 1. Gestion de l'authentification (Dossier auth_session)
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    
    // 2. Récupérer la dernière version de WhatsApp Web
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false, // On gère l'affichage manuellement pour plus de fiabilité
        logger: pino({ level: 'silent' }),
        browser: ['Prince K Bot', 'MacOS', '3.0.0'],
    });

    // Sauvegarder les identifiants à chaque mise à jour
    sock.ev.on('creds.update', saveCreds);

    // 3. Gestion de la connexion et du QR Code
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log('📢 [PRINCE K] : NOUVEAU QR CODE GÉNÉRÉ !');
            console.log('👉 Scanne le code ci-dessous avec WhatsApp > Appareils connectés');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('❌ Connexion fermée. Raison :', reason);
            
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconnexion automatique...');
                startPrinceKBot();
            } else {
                console.log('🚫 Session déconnectée. Supprime le dossier auth_session et relance.');
            }
        } else if (connection === 'open') {
            console.log('✅ [PRINCE K BOT] EST MAINTENANT EN LIGNE !');
            sock.sendMessage("237650554607@s.whatsapp.net", { text: "Le bot Prince K est activé avec succès !" });
        }
    });

    // 4. Écoute des messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

        if (text.toLowerCase() === '!ping') {
            await sock.sendMessage(sender, { text: 'Pong! 🏓 Prince K Bot est opérationnel.' });
        }
    });
}

// Lancer le bot
startPrinceKBot().catch(err => console.error("Erreur critique :", err));
