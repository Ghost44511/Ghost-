const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    jidDecode,
    proto
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require('fs');

// --- CONFIGURATION PERSONNALISÉE ---
const botName = "Prince K";
const ownerNumber = "237650554606"; 
const prefix = "!";

// Dossier pour stocker la connexion
const authFolder = "./auth_session";

async function startBot() {
    // 1. Initialisation de la session
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        logger: pino({ level: "silent" }), // "silent" pour éviter de polluer les logs Render
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.creds, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false
    });

    // --- SYSTÈME DE PAIRING CODE ---
    if (!socket.authState.creds.registered) {
        console.log(`\n[ SYSTEM ] Préparation du code pour ${ownerNumber}...`);
        setTimeout(async () => {
            try {
                let code = await socket.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log("\n" + "=".repeat(40));
                console.log(`🤖 BOT : ${botName.toUpperCase()}`);
                console.log(`🔑 TON CODE : ${code}`);
                console.log("=".repeat(40));
                console.log("INSTRUCTION : Tape ce code sur ton WhatsApp mobile.\n");
            } catch (err) {
                console.error("Erreur génération code :", err);
            }
        }, 8000); // Délai de 8s pour la stabilité
    }

    // --- GESTION DES MESSAGES ET COMMANDES ---
    socket.ev.on("messages.upsert", async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const from = msg.key.remoteJid;
            const type = Object.keys(msg.message)[0];
            const pushname = msg.pushName || "Utilisateur";
            
            // Lecture du texte selon le type de message
            const body = (type === 'conversation') ? msg.message.conversation : 
                         (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : 
                         (type === 'imageMessage') ? msg.message.imageMessage.caption : 
                         (type === 'videoMessage') ? msg.message.videoMessage.caption : '';

            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ')[0].toLowerCase() : null;
            const args = body.trim().split(/ +/).slice(1);

            if (isCmd) {
                console.log(`[CMD] ${command} reçu de ${pushname}`);

                switch (command) {
                    case 'menu':
                    case 'help':
                        const menuText = `🌟 *BIENVENUE SUR ${botName.toUpperCase()}* 🌟\n\n` +
                                       `👤 *Salut ${pushname}*\n\n` +
                                       `*LISTE DES COMMANDES :*\n` +
                                       `| ⚡ !ping\n` +
                                       `| ℹ️ !info\n` +
                                       `| 👑 !owner\n` +
                                       `| 🕒 !runtime\n` +
                                       `| 🛠️ !status\n\n` +
                                       `_Tapez une commande pour tester._`;
                        await socket.sendMessage(from, { text: menuText });
                        break;

                    case 'ping':
                        await socket.sendMessage(from, { text: "Calcul de la latence... *Stable* ✅" });
                        break;

                    case 'owner':
                        await socket.sendMessage(from, { text: `Le propriétaire de ce bot est *Prince K*.\nNuméro : ${ownerNumber}` });
                        break;

                    case 'info':
                        await socket.sendMessage(from, { 
                            text: `*Nom :* ${botName}\n*Version :* 2.0\n*Hébergeur :* Render\n*Bibliothèque :* Baileys` 
                        });
                        break;

                    case 'runtime':
                        const uptime = process.uptime();
                        const hours = Math.floor(uptime / 3600);
                        const minutes = Math.floor((uptime % 3600) / 60);
                        await socket.sendMessage(from, { text: `Le bot tourne depuis : *${hours}h ${minutes}m*` });
                        break;

                    case 'status':
                        await socket.sendMessage(from, { text: `Bot : *Actif*\nServeur : *Opérationnel*` });
                        break;

                    default:
                        await socket.sendMessage(from, { text: "Désolé, cette commande n'existe pas. Tapez *!menu*." });
                }
            }
        } catch (err) {
            console.error("Erreur message :", err);
        }
    });

    // --- GESTION DE LA CONNEXION ---
    socket.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            console.log(`Connexion fermée (Raison: ${reason})`);

            if (reason === DisconnectReason.loggedOut) {
                console.log("Session déconnectée. Supprime le dossier 'auth_session' pour recommencer.");
            } else {
                console.log("Reconnexion automatique...");
                startBot();
            }
        } else if (connection === "open") {
            console.log(`\n✅ ${botName.toUpperCase()} CONNECTÉ ET PRÊT !`);
            socket.sendMessage(ownerNumber + "@s.whatsapp.net", { text: `*${botName}* est maintenant opérationnel sur Render ! ✅` });
        }
    });

    // Sauvegarde des identifiants
    socket.ev.on("creds.update", saveCreds);

    // Fonction pour décoder les JID (utilitaire)
    socket.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
    };
}

// Démarrage global avec gestion d'erreur critique
startBot().catch(err => {
    console.error("ERREUR FATALE AU DÉMARRAGE :", err);
});
