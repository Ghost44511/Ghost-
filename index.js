const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidDecode
} = require("@whiskeysockets/baileys");
const { Boom } = require("@hapi/boom");
const pino = require("pino");
const fs = require('fs');

// --- CONFIGURATION DU BOT ---
const owner = "237650554606"; // Ton numéro sans le +
const botName = "Prince K Bot";
const prefix = ".";

async function startPrinceK() {
    const { state, saveCreds } = await useMultiFileAuthState('session_prince_k');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false, // Pas de QR Code, on utilise le Pairing Code
        logger: pino({ level: "fatal" }),
        browser: ["Chrome (Linux)", "Prince K", "1.0.0"],
    });

    // --- SYSTÈME DE CODE À 8 CHIFFRES ---
    if (!sock.authState.creds.registered) {
        console.log(`\n[\x1b[34m ${botName} \x1b[0m] Tentative de connexion pour : ${owner}`);
        setTimeout(async () => {
            let code = await sock.requestPairingCode(owner);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            console.log(`\n⭐ TON CODE DE COUPLAGE : \x1b[32m\x1b[1m${code
                                                                     
