const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    downloadContentFromMessage,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const yts = require('yt-search');
const pino = require('pino');
const app = express();

// --- CONFIGURATION ---
const OWNER_NUMBER = "237650554606@s.whatsapp.net"; 
const port = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Bot Prince-K Privé avec Pairing Code Actif !'));
app.listen(port, () => console.log(`Serveur actif sur port: ${port}`));

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // Désactivé car on utilise le code de jumelage
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- LOGIQUE DU CODE DE JUMELAGE (8 CHIFFRES) ---
    if (!sock.authState.creds.registered) {
        // On attend 3 secondes pour être sûr que le bot est prêt
        setTimeout(async () => {
            let code = await sock.requestPairingCode("237650554606");
            console.log(`\n\n============= CODE DE JUMELAGE =============\n`);
            console.log(`TON CODE EST : ${code}`);
            console.log(`\nINSTRUCTIONS :`);
            console.log(`1. Ouvre WhatsApp sur ton téléphone.`);
            console.log(`2. Va dans Appareils connectés > Connecter un appareil.`);
            console.log(`3. Clique sur "Connecter avec le numéro de téléphone plutôt".`);
            console.log(`4. Saisis le code ci-dessus.`);
            console.log(`\n============================================\n\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') console.log('✅ Bot connecté ! Session active.');
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const isGroup = from.endsWith('@g.us');
        const sender = isGroup ? msg.key.participant : from;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const prefix = "!";

        // --- FONCTION FURTIVE (ENVOI PRIVÉ À TON NUMÉRO) ---
        const isViewOnce = type === 'viewOnceMessageV2' || type === 'viewOnceMessage';
        if (isViewOnce) {
            const viewOnceContent = msg.message.viewOnceMessageV2?.message || msg.message.viewOnceMessage?.message;
            const mediaType = Object.keys(viewOnceContent)[0];
            const media = viewOnceContent[mediaType];

            const stream = await downloadContentFromMessage(media, mediaType === 'imageMessage' ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

            const caption = `🕵️ *INTERCEPTION FURTIVE*\n👤 *De:* @${sender.split('@')[0]}\n📍 *Source:* ${isGroup ? 'Groupe' : 'Privé'}`;
            
            if (mediaType === 'imageMessage') {
                await sock.sendMessage(OWNER_NUMBER, { image: buffer, caption: caption, mentions: [sender] });
            } else if (mediaType === 'videoMessage') {
                await sock.sendMessage(OWNER_NUMBER, { video: buffer, caption: caption, mentions: [sender] });
            }
            return;
        }

        if (!text.startsWith(prefix)) return;
        const args = text.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        switch (command) {
            case 'menu':
                await sock.sendMessage(from, { text: "🌟 *PRINCE-K BOT*\n\n!song [titre]\n!ping" });
                break;
            case 'song':
                const search = await yts(args.join(" "));
                if (!search.videos[0]) return;
                await sock.sendMessage(from, { 
                    audio: { url: `https://api.vevioz.com/api/button/mp3/${search.videos[0].videoId}` }, 
                    mimetype: 'audio/mp4' 
                });
                break;
            case 'ping':
                await sock.sendMessage(from, { text: 'Bot en ligne ⚡' });
                break;
        }
    });
}

startBot();
