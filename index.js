const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    jidDecode
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const readline = require("readline");
const MessageHandler = require('./MessageHandler');

// Configuration du lecteur de ligne pour le code de couplage
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

// Dossier de session
const sessionPath = "./session";

async function startPrinceK() {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false, // On désactive le QR car on veut le CODE
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- SYSTÈME DE CODE À 8 CHIFFRES ---
    if (!client.authState.creds.registered) {
        console.clear();
        console.log("🤴 *CONNEXION PRINCE K BOT* 🤴");
        const phoneNumber = await question("📞 Entrez votre numéro (ex: 237650554606) : ");
        const code = await client.requestPairingCode(phoneNumber.trim());
        console.log(`\n🔑 VOTRE CODE DE COUPLAGE : ${code}\n`);
        console.log("Ouvrez WhatsApp > Appareils connectés > Connecter un appareil > Se connecter avec le numéro de téléphone.");
    }

    // Gestion de la connexion
    client.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log("❌ Session déconnectée. Supprimez le dossier session et relancez.");
            } else {
                startPrinceK(); // Relance automatique en cas de bug réseau
            }
        } else if (connection === "open") {
            console.log("✅ PRINCE K BOT EST EN LIGNE !");
            client.sendMessage('237650554606@s.whatsapp.net', { text: "🤴 *Prince K Bot est prêt !*" });
        }
    });

    client.ev.on("creds.update", saveCreds);

    // --- RÉCEPTION DES MESSAGES ---
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            
            // Appel du cerveau central que nous avons créé
            await MessageHandler(client, m);
            
        } catch (err) {
            console.error("Erreur dans index.js:", err);
        }
    });

    // Fonction utilitaire pour décoder les JID (IDs WhatsApp)
    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };
}

startPrinceK();
