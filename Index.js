const {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    Browsers
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: Browsers.macOS('Desktop'),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('--- Prince K Bot Connecté ---');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const remoteJid = m.key.remoteJid;
        const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
        const command = body.toLowerCase();

        // --- Système de Commandes ---

        // 1. Menu Principal
        if (command === '!menu') {
            const menuText = `👑 *BOT PRINCE K* 👑\n\n` +
                             `Propriétaire: +237650554606\n\n` +
                             `*Commandes disponibles :*\n` +
                             `👉 *!info* : Infos sur le bot\n` +
                             `👉 *!ping* : Tester la latence\n` +
                             `👉 *!love* : Citation romantique\n` +
                             `👉 *!foot* : Score récent\n` +
                             `👉 *!calc [calcul]* : Calculatrice STEM\n` +
                             `👉 *!translate [texte]* : Traduction FR/EN`;
            await sock.sendMessage(remoteJid, { text: menuText });
        }

        // 2. Fonction Info
        if (command === '!info') {
            await sock.sendMessage(remoteJid, { text: "Je suis le bot officiel de Prince K, conçu pour l'assistance et le divertissement." });
        }

        // 3. Fonction Ping (Vitesse)
        if (command === '!ping') {
            await sock.sendMessage(remoteJid, { text: "Pong! 🏓 Bot actif." });
        }

        // 4. Fonction Mathématique (STEM)
        if (command.startsWith('!calc ')) {
            const expr = command.replace('!calc ', '');
            try {
                const result = eval(expr); // Note: Pour la prod, utiliser une lib comme mathjs
                await sock.sendMessage(remoteJid, { text: `Résultat : ${result}` });
            } catch {
                await sock.sendMessage(remoteJid, { text: "Erreur de calcul." });
            }
        }

        // 5. Fonction Romantique
        if (command === '!love') {
            const quotes = [
                "L'amour est la seule force capable de transformer un ennemi en ami.",
                "Ton sourire est mon plus beau paysage."
            ];
            const random = quotes[Math.floor(Math.random() * quotes.length)];
            await sock.sendMessage(remoteJid, { text: `💖 ${random}` });
        }
    });
}

connectToWhatsApp();
