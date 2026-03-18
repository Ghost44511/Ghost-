const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
const GEMINI_API_KEY = "TA_CLE_API_ICI"; // Remplace par ta clé Google AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ["Prince K Bot", "MacOS", "3.0.0"]
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log("Scannez ce QR Code avec le numéro +237650554605 :");
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connexion perdue. Reconnexion...', shouldReconnect);
            if (shouldReconnect) connectToWhatsApp();
        } else if (connection === 'open') {
            console.log('Prince K est en ligne !');
        }
    });

    // --- LOGIQUE DE RÉPONSE ---
    sock.ev.on('messages.upsert', async m => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const remoteJid = msg.key.remoteJid;
        const textMessage = msg.message.conversation || msg.message.extendedTextMessage?.text;

        if (textMessage) {
            try {
                // On envoie le texte à Gemini
                const result = await model.generateContent(textMessage);
                const response = await result.response;
                const replyText = response.text();

                // On répond sur WhatsApp
                await sock.sendMessage(remoteJid, { text: `[Prince K ✨]: ${replyText}` });
            } catch (error) {
                console.error("Erreur Gemini:", error);
                await sock.sendMessage(remoteJid, { text: "Désolé, mon cerveau de Prince a eu un petit bug... 😅" });
            }
        }
    });
}

connectToWhatsApp();
