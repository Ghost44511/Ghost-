const fs = require('fs');

const config = {
    // --- IDENTITÉ DU BOT ---
    botName: "PRINCE K SUPRÊME",
    ownerName: "Prince K",
    ownerNumber: "237650554606@s.whatsapp.net", // Ton numéro principal
    prefix: ".", // Préfixe par défaut
    
    // --- PARAMÈTRES DE CONNEXION ---
    browser: ["Prince K Bot", "Chrome", "1.0.0"], // Apparaît dans les appareils connectés
    sessionDir: "./session", // Dossier de stockage de la connexion
    pairingCode: true, // Active le système de code à 8 chiffres

    // --- MODÉRATION ET SÉCURITÉ ---
    options: {
        autoRead: true,        // Marquer les messages comme vus automatiquement
        autoStatusView: true,  // Regarder les statuts de tes contacts en mode fantôme
        alwaysOnline: true,    // Afficher le bot comme "En ligne" 24h/24
        antiCall: true,        // Rejeter les appels pour éviter les crashs
        antiDelete: true,      // Te renvoyer les messages supprimés par les autres
        antiViewOnce: true,    // Sauvegarder automatiquement les photos à vue unique
        publicMode: true       // true = tout le monde l'utilise, false = seul toi
    },

    // --- RÉGLAGES DE GROUPE ---
    group: {
        welcome: "Bienvenue @user dans la Crew ! 🤴",
        goodbye: "Adieu @user, un membre en moins. 📉",
        antil
      
