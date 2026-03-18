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

// --- CONFIGURATION PRINCE K ---
const ownerNumber = "237650554606";
const botName = "PRINCE-K-PRIVATE";

async function startPrinceKBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const client = makeWASocket({
        version,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false, // Désactivé pour utiliser le code à 8 chiffres
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        browser: ["Ubuntu", "Chrome", "20.0.04"],
    });

    // --- GÉNÉRATION DU CODE À 8 CHIFFRES ---
    if (!client.authState.creds.registered) {
        setTimeout(async () => {
            let code = await client.requestPairingCode(ownerNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n\n🤴 SALUT PRINCE K !`);
            console.log(`👉 TON CODE DE CONNEXION : ${code}\n\n`);
        }, 3000);
    }

    client.ev.on('creds.update', saveCreds);

    // --- GESTION DES MESSAGES ---
    client.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;
            
            const from = m.key.remoteJid;
            const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
            const isOwner = from.includes(ownerNumber);

            // MODE PRIVÉ : Seul Prince K peut utiliser le bot
            if (!isOwner) return;

            if (body.startsWith('.')) {
                const command = body.slice(1).trim().split(/ +/).shift().toLowerCase();

                switch (command) {
                    case 'menu':
                        await client.sendMessage(from, { 
                            text: `*BIENVENUE PRINCE K*\n\nLe bot est actif.\n\n*Commandes :*\n.ping\n.runtime\n.owner` 
                        });
                        break;
                    
                    case 'ping':
                        await client.sendMessage(from, { text: '🏓 Pong ! Bot opérationnel.' });
                        break;

                    case 'runtime':
                        const uptime = process.uptime();
                        const h = Math.floor(uptime / 3600);
                        const m = Math.floor((uptime % 3600) / 60);
                        await client.sendMessage(from, { text: `Actif depuis : ${h}h ${m}m` });
                        break;

                    case 'owner':
                        await client.sendMessage(from, { text: `Le propriétaire est Prince K : ${ownerNumber}` });
                        break;
                }
            }
        } catch (err) {
            console.log("Erreur de message : ", err);
        }
    });

    // --- GESTION DE LA CONNEXION ---
    client.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("Connexion perdue... Relance en cours.");
                startPrinceKBot();
            } else {
                console.log("Session terminée. Supprime le dossier session et relance.");
            }
        } else if (connection === 'open') {
            console.log('✅ CONNEXION RÉUSSIE ! Prince-K-Bot est en ligne.');
        }
    });
}

// Lancement du bot
startPrinceKBot();
                          
