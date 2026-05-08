const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");

// --- CONFIGURATION ---
const botName = "Prince K";
const ownerNumber = "237650554606"; 

async function startBot() {
    // Utilisation d'un dossier './auth' pour éviter les erreurs de permissions
    const { state, saveCreds } = await useMultiFileAuthState('./auth');
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.creds, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    // --- LOGIQUE DU PAIRING CODE (8 CARACTÈRES) ---
    if (!socket.authState.creds.registered) {
        console.log("Génération du code de connexion en cours...");
        setTimeout(async () => {
            try {
                let code = await socket.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log("\n" + "=".repeat(40));
                console.log(`  🤖 BOT : ${botName.toUpperCase()}`);
                console.log(`  🔑 TON CODE DE LIAISON : ${code}`);
                console.log("=".repeat(40));
                console.log("👉 WhatsApp > Appareils liés > Lier avec le numéro.\n");
            } catch (err) {
                console.error("Erreur Pairing Code : ", err);
            }
        }, 10000); // 10 secondes pour être sûr que le serveur est prêt
    }

    // --- COMMANDES ---
    socket.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const content = type === 'conversation' ? msg.message.conversation : 
                        type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';
        
        const prefix = "!"; 
        if (content.startsWith(prefix)) {
            const command = content.slice(prefix.length).trim().split(' ')[0].toLowerCase();

            if (command === 'menu') {
                await socket.sendMessage(from, { text: `*${botName} Bot*\n\n- !ping\n- !owner\n- !info` });
            } else if (command === 'ping') {
                await socket.sendMessage(from, { text: "En ligne ! ⚡" });
            } else if (command === 'owner') {
                await socket.sendMessage(from, { text: "Propriétaire : Prince K" });
            }
        }
    });

    // --- CONNEXION UPDATE ---
    socket.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log("Reconnexion...");
                startBot();
            }
        } else if (connection === "open") {
            console.log(`✅ ${botName} est prêt !`);
        }
    });

    socket.ev.on("creds.update", saveCreds);
}

// Lancement automatique
startBot().catch(err => console.error("Erreur critique :", err));
