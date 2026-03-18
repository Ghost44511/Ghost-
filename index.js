const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pino = require('pino');

// --- CONFIGURATION DE LA CLÉ API ---
// Option 1 : Mets ta clé entre les guillemets ci-dessous si Katabump ne prend pas la variable
// Option 2 : Laisse tel quel si tu as bien configuré GEMINI_KEY dans ton interface Katabump
const API_KEY = process.env.GEMINI_KEY || "AIzaSyCjtJ8t7OxGTDH_0CgSLbvIJbsD5AyQCyg";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "Tu es Prince K, un assistant IA puissant et amical basé au Cameroun. Tu aides les utilisateurs sur WhatsApp avec précision." 
});

async function startPrinceK() {
    // Gestion de la session (sauvegarde la connexion)
    const { state, saveCreds } = await useMultiFileAuthState('session_prince_k');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // On utilise le code à 8 chiffres
        logger: pino({ level: 'silent' }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- LOGIQUE DU CODE DE JUMELAGE (PAIRING CODE) ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = "237650554606"; 
        console.log("🔄 Initialisation du jumelage pour Prince K...");
        
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("\n" + "=".repeat(40));
                console.log(`👉 TON CODE WHATSAPP : ${code}`);
                console.log("=".repeat(40) + "\n");
            } catch (error) {
                console.error("Erreur lors de la demande du code :", error);
            }
        }, 10000); // On attend 10 secondes pour laisser le serveur se stabiliser
    }

    sock.ev.on('creds.update', saveCreds);

    // --- GESTION DES CONNEXIONS ET ERREURS ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`Connexion fermée (Raison: ${reason}). Reconnexion...`);
            
            if (reason !== DisconnectReason.loggedOut) {
                startPrinceK();
            } else {
                console.log("❌ Session expirée. Supprime le dossier 'session_prince_k' et relance.");
            }
        } else if (connection === 'open') {
            console.log("✅ Prince K est EN LIGNE sur le 237650554605 !");
        }
    });

    // --- INTERACTION AVEC GEMINI ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || m.key.fromMe) return;

        const sender = m.key.remoteJid;
        const textMessage = m.message.conversation || m.message.extendedTextMessage?.text;

        if (textMessage) {
            console.log(`📩 Nouveau message de ${sender}`);
            
            try {
                // Envoi à l'IA Gemini
                const result = await model.generateContent(textMessage);
                const response = await result.response;
                const textResponse = response.text();

                // Envoi de la réponse sur WhatsApp
                await sock.sendMessage(sender, { text: textResponse });
            } catch (err) {
                console.error("Erreur Gemini :", err.message);
                if (err.message.includes("API_KEY_INVALID")) {
                    console.log("⚠️ ALERTE : Ta clé API Gemini est incorrecte !");
                }
            }
        }
    });
}

// Lancement du bot
startPrinceK().catch(err => console.error("Erreur fatale au démarrage :", err));
