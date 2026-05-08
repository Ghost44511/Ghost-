const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require('fs');

// --- CONFIGURATION PRINCE K ---
const botName = "Prince K";
const ownerNumber = "237650554606"; 
const versionBot = "3.0.1";

async function startBot() {
    // Gestion de la session dans le dossier 'session_v3'
    const { state, saveCreds } = await useMultiFileAuthState('./session_v3');
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.creds, pino({ level: "silent" })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        syncFullHistory: false
    });

    // --- SYSTÈME DE PAIRING CODE V3 ---
    if (!socket.authState.creds.registered) {
        console.log(`[V${versionBot}] Initialisation du code pour : ${ownerNumber}`);
        setTimeout(async () => {
            try {
                let code = await socket.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log("\n" + "=".repeat(45));
                console.log(` 👑 BOT : ${botName.toUpperCase()} [V${versionBot}]`);
                console.log(` 🔑 CODE DE CONNEXION : ${code}`);
                console.log("=".repeat(45));
                console.log("INSTRUCTION : Saisissez ce code sur votre WhatsApp.\n");
            } catch (err) {
                console.error("Erreur de génération :", err);
            }
        }, 10000); // 10 secondes de délai pour la stabilité Render
    }

    // --- GESTION DES COMMANDES ---
    socket.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        const pushname = msg.pushName || "Ami";
        
        const body = (type === 'conversation') ? msg.message.conversation : 
                     (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : '';

        const prefix = "!";
        if (body.startsWith(prefix)) {
            const command = body.slice(prefix.length).trim().split(' ')[0].toLowerCase();

            switch (command) {
                case 'menu':
                    const menu = `*SALUT ${pushname.toUpperCase()} !*\n\n` +
                                 `*BOT :* ${botName}\n` +
                                 `*VERSION :* ${versionBot}\n\n` +
                                 `*COMMANDES :*\n` +
                                 `> !ping (Status)\n` +
                                 `> !owner (Créateur)\n` +
                                 `> !info (Détails)\n` +
                                 `> !hi (Salutation)`;
                    await socket.sendMessage(from, { text: menu });
                    break;

                case 'ping':
                    await socket.sendMessage(from, { text: `*V${versionBot}* : Système opérationnel ⚡` });
                    break;

                case 'owner':
                    await socket.sendMessage(from, { text: `Le propriétaire est *Prince K*.\nWhatsApp : https://wa.me/${ownerNumber}` });
                    break;

                case 'info':
                    await socket.sendMessage(from, { text: `Bot ${botName}\nVersion ${versionBot}\nHébergé sur Render (Node.js 20)` });
                    break;

                case 'hi':
                    await socket.sendMessage(from, { text: `Salut ${pushname} ! Comment puis-je t'aider aujourd'hui ?` });
                    break;
            }
        }
    });

    // --- GESTION DE LA RECONNEXION ---
    socket.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log(`Reconnexion v${versionBot} en cours...`);
                startBot();
            } else {
                console.log("Session terminée. Veuillez supprimer 'session_v3' et recommencer.");
            }
        } else if (connection === "open") {
            console.log(`\n✅ ${botName} v${versionBot} est en ligne !`);
        }
    });

    socket.ev.on("creds.update", saveCreds);
}

// Lancement avec protection contre les crashs
startBot().catch(err => console.error("Erreur critique :", err));
          
