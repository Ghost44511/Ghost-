const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

// --- CONFIGURATION ---
const OWNER_NAME = "Prince K";
const OWNER_NUMBER = "237650554606";
const PREFIX = "!"; // Ton préfixe (ex: !menu)

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["PrinceK-Bot", "MacOS", "3.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot connecté avec succès !');
        }
    });

    // --- GESTION DES MESSAGES ET COMMANDES ---
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const content = type === 'conversation' ? msg.message.conversation : 
                        type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';
        
        const body = content.toLowerCase();
        const isCmd = body.startsWith(PREFIX);
        const command = isCmd ? body.slice(PREFIX.length).trim().split(' ')[0] : null;

        // 1. GÉNÉRATION DU CODE DE COUPLAGE (Ton erreur corrigée)
        if (body.includes("code") || body.includes("couplage")) {
            const code8 = Math.floor(1
                                     
