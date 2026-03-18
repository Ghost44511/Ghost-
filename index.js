const fs = require('fs');

// Lire la base de données
let db = JSON.parse(fs.readFileSync('./db.json'));

// Exemple : Envoyer le message de bienvenue stocké dans db.json
console.log(db.settings.welcome_message);const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');

async function startBot() {
    // On utilise un dossier de session propre
    const { state, saveCreds } = await useMultiFileAuthState('auth_session');

    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true // Force l'affichage ici
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // Si un QR code est généré, on l'affiche manuellement en PETIT
        if (qr) {
            console.log("--- SCANNE LE QR CODE CI-DESSOUS ---");
            qrcode.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            console.log("Connexion perdue, reconnexion...");
            startBot();
        } else if (connection === 'open') {
            console.log("✅ BOT PRINCE K CONNECTÉ !");
        }
    });
}

startBot();
