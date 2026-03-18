const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pino = require('pino');

// --- CONFIGURATION ---
// Assure-toi d'avoir ajouté GEMINI_KEY dans les variables d'environnement de ton hébergeur
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Tu es Prince K, un assistant intelligent et polyvalent au Cameroun. Réponds de façon amicale et aide l'utilisateur au mieux." 
});

async function startPrinceK() {
    // Crée un dossier 'session_prince_k' pour sauvegarder la connexion
    const { state, saveCreds } = await useMultiFileAuthState('session_prince_k');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // On désactive le QR car on veut le code à 8 chiffres
        logger: pino({ level: 'silent' }), // Correction de l'erreur précédente
        browser: ["Ubuntu", "Chrome", "20.0.04"] // Nécessaire pour le code de jumelage
    });

    // --- GÉNÉRATION DU CODE À 8 CHIFFRES ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = "237650554605"; 
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("\n" + "=".repeat(30));
                console.log(`VOTRE CODE DE CONNEXION : ${code}`);
                console.log("=".repeat(30) + "\n");
                console.log("Instructions : Ouvrez WhatsApp > Appareils connectés > Lier un appareil > Lier avec le numéro de téléphone.");
            } catch (error) {
                console.error("Erreur génération code pairing:", error);
            }
        }, 5000); // On attend 5 secondes pour être sûr que la connexion est prête
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = (new Boom(lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut);
            if (shouldReconnect) {
                console.log("Reconnexion en cours...");
                startPrinceK();
            }
        } else if (connection === 'open') {
            console.log("✅ Prince K est connecté et opérationnel !");
        }
    });

    // --- RÉPONSE AUTOMATIQUE AVEC GEMINI ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const textMessage = m.message.conversation || m.message.extendedTextMessage?.text;

        if (textMessage) {
            console.log(`Message de ${sender} : ${textMessage}`);
            try {
                const result = await model.generateContent(textMessage);
                const response = await result.response;
                const aiReply = response.text();

                await sock.sendMessage(sender, { text: aiReply });
            } catch (err) {
                console.error("Erreur Gemini IA:", err);
            }
        }
    });
}

// Lancement du bot
startPrinceK();
          
