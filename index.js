const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');

async function startPrinceKBot() {
    // 1. Gestion de la session
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: false, // On désactive le QR code
        logger: pino({ level: 'silent' }),
        // Le nom du navigateur est OBLIGATOIRE pour le code à 8 chiffres
        browser: ["Ubuntu", "Chrome", "20.0.04"], 
    });

    // 2. DEMANDE DU CODE À 8 CHIFFRES (Pairing Code)
    if (!sock.authState.creds.registered) {
        const phoneNumber = "237650554606"; // Ton numéro configuré
        
        console.log("------------------------------------------");
        console.log("👑 [PRINCE K] GÉNÉRATION DU CODE EN COURS...");
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("👉 TON CODE DE CONNEXION EST : " + code);
                console.log("------------------------------------------");
            } catch (error) {
                console.error("Erreur lors de la demande du code :", error);
            }
        }, 5000); // Délai de 5 secondes pour laisser le bot s'initialiser
    }

    sock.ev.on('creds.update', saveCreds);

    // 3. Gestion de la connexion
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log('❌ Connexion fermée. Raison :', reason);
            if (reason !== DisconnectReason.loggedOut) {
                startPrinceKBot(); // Reconnexion automatique
            }
        } else if (connection === 'open') {
            console.log('✅ [PRINCE K BOT] EST MAINTENANT CONNECTÉ !');
        }
    });

    // 4. Exemple de commande simple
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text || "";

        if (text.toLowerCase() === '!ping') {
            await sock.sendMessage(sender, { text: 'Prince K Bot est actif ! 👑' });
        }
    });
}

// Lancement
startPrinceKBot();
                        
