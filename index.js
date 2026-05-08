const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    jidDecode
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const MessageHandler = require('./MessageHandler');

// Configuration du numéro (Évite d'utiliser readline sur un serveur distant)
const phoneNumber = "237650554606"; 

async function startPrinceK() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false, // Obligatoire pour utiliser le code de couplage
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // --- SYSTÈME DE CODE À 8 CHIFFRES POUR SERVEUR (RENDER/KOYEB) ---
    if (!client.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await client.requestPairingCode(phoneNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log("🤴 *CONNEXION PRINCE K BOT* 🤴");
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log(`🔑 TON CODE DE COUPLAGE : ${code}`);
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("Instructions : Ouvrez WhatsApp > Appareils connectés > Se connecter avec le numéro.");
            } catch (error) {
                console.log("❌ Erreur de génération du code :", error.message);
            }
        }, 5000); // On attend 5 secondes pour laisser le socket s'initialiser
    }

    // Gestion de la connexion
    client.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("🔄 Reconnexion en cours...");
                startPrinceK();
            } else {
                console.log("❌ Session expirée. Supprimez le dossier session.");
            }
        } else if (connection === "open") {
            console.log("✅ PRINCE K BOT EST EN LIGNE SUR RENDER !");
        }
    });

    client.ev.on("creds.update", saveCreds);

    // --- RÉCEPTION DES MESSAGES ---
    client.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message) return;
            
            // Décodage du JID pour identifier l'expéditeur proprement
            m.sender = client.decodeJid(m.key.participant || m.key.remoteJid);
            m.isGroup = m.key.remoteJid.endsWith('@g.us');
            
            // On envoie le message au cerveau central
            await MessageHandler(client, m);
            
        } catch (err) {
            console.error("Erreur MessageHandler:", err);
        }
    });

    // Fonction utilitaire pour décoder les IDs WhatsApp
    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };

    return client;
}

startPrinceK();
