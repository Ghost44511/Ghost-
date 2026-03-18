const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    pino 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Tu es Prince K, un assistant intelligent au Cameroun. Réponds de manière amicale." 
});

async function startPrinceK() {
    const { state, saveCreds } = await useMultiFileAuthState('session_prince_k');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // On désactive le QR code
        logger: pino({ level: 'silent' }),
        browser: ["Chrome (Linux)", "", ""] // Important pour le code de jumelage
    });

    // --- LOGIQUE DU CODE À 8 CHIFFRES ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = "237650554605"; // Ton numéro
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("---------------------------------------");
                console.log(`VOTRE CODE DE CONNEXION : ${code}`);
                console.log("---------------------------------------");
            } catch (error) {
                console.error("Erreur lors de la génération du code:", error);
            }
        }, 3000); // Délai de 3 secondes pour laisser le socket s'initialiser
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut);
            if (shouldReconnect) startPrinceK();
        } else if (connection === 'open') {
            console.log("✅ Prince K est maintenant connecté !");
        }
    });

    // Réponse automatique avec Gemini
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const text = m.message.conversation || m.message.extendedTextMessage?.text;

        if (text) {
            try {
                const result = await model.generateContent(text);
                const response = await result.response;
                await sock.sendMessage(sender, { text: response.text() });
            } catch (err) {
                console.error("Erreur IA:", err);
            }
        }
    });
}

startPrinceK();
