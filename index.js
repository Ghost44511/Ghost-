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
const ownerNumber = "237650554606"; // Ton numéro sans le +

async function startBot() {
    // Gestion de l'authentification (sauvegardée dans le dossier 'session_auth')
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const { version } = await fetchLatestBaileysVersion();

    const socket = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.creds, pino({ level: "fatal" })),
        },
        printQRInTerminal: false, // On désactive le QR code
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"], // Nécessaire pour le pairing code
    });

    // --- LOGIQUE DU PAIRING CODE (8 CARACTÈRES) ---
    if (!socket.authState.creds.registered) {
        setTimeout(async () => {
            try {
                let code = await socket.requestPairingCode(ownerNumber);
                
                // Formatage du code en deux blocs de 4 (ex: ABCD-1234)
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                
                console.log("\n" + "=".repeat(40));
                console.log(`  🤖 SYSTÈME DE CONNEXION ${botName.toUpperCase()}`);
                console.log(`  📱 NUMÉRO CIBLE : ${ownerNumber}`);
                console.log(`  🔑 TON CODE DE LIAISON : ${code}`);
                console.log("=".repeat(40));
                console.log("👉 Instructions : WhatsApp > Appareils liés > Lier un appareil > Lier avec le numéro de téléphone.\n");
            } catch (err) {
                console.error("Erreur de génération du code : ", err);
            }
        }, 5000); // Délai de 5 secondes pour laisser Render stabiliser la connexion
    }

    // --- GESTION DES MESSAGES ---
    socket.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const type = Object.keys(msg.message)[0];
        
        // Extraction du texte
        const content = type === 'conversation' ? msg.message.conversation : 
                        type === 'extendedTextMessage' ? msg.message.extendedTextMessage.text : '';
        
        const prefix = "!"; 
        const isCmd = content.startsWith(prefix);
        const command = isCmd ? content.slice(prefix.length).trim().split(' ')[0].toLowerCase() : null;

        if (isCmd) {
            console.log(`[COMMANDE] ${command} reçu de ${from}`);

            switch (command) {
                case 'menu':
                case 'help':
                    await socket.sendMessage(from, { 
                        text: `Bonjour ! Je suis *${botName}* 🤖\n\n*Voici mes commandes :*\n\n🔹 *!ping* : Tester la vitesse\n🔹 *!info* : Détails du bot\n🔹 *!owner* : Infos créateur\n🔹 *!hi* : Dire bonjour` 
                    });
                    break;

                case 'ping':
                    await socket.sendMessage(from, { text: "Vitesse de connexion : *Stable* 🏓" });
                    break;

                case 'info':
                    await socket.sendMessage(from, { 
                        text: `*Nom :* ${botName}\n*Plateforme :* Render\n*Numéro de gestion :* ${ownerNumber}` 
                    });
                    break;

                case 'owner':
                    await socket.sendMessage(from, { text: `Ce bot appartient à *Prince K*.` });
                    break;

                case 'hi':
                    await socket.sendMessage(from, { text: `Salut ! Prêt à vous servir. Tapez *!menu* pour commencer.` });
                    break;

                default:
                    await socket.sendMessage(from, { text: "Désolé, cette commande n'existe pas. Tapez *!menu*." });
                    break;
            }
        }
    });

    // --- GESTION DE LA CONNEXION ---
    socket.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log("Connexion perdue. Reconnexion en cours...", shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log(`\n✅ ${botName.toUpperCase()} EST MAINTENANT EN LIGNE !
          
