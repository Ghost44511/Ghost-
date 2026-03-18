const fs = require('fs');

// --- CONFIGURATION PERSONNELLE (PRINCE K) ---
global.owner = ['237650554606']; // Ton numéro unique
global.ownername = 'Prince K';   // Nom du créateur
global.botname = 'PRINCE-K-PRIVATE'; 

// --- PARAMÈTRES DE SÉCURITÉ ET MODE PRIVÉ ---
global.public = false;           // IMPORTANT : 'false' = Mode Privé activé
global.self = true;              // Le bot ne répond qu'à toi
global.autoRead = false;         // Ne marque pas forcément tout comme lu pour rester discret
global.autobio = false;          
global.statusview = false;       // Désactivé pour économiser les ressources sur Katabump

// --- PRÉFIXES DES COMMANDES ---
global.prefix = ['.', '!', '/']; // Exemple : .menu, !ping

// --- MESSAGES DE RÉPONSE ---
global.mess = {
    success: '✅ Fait, Prince K.',
    admin: '❌ Commande réservée aux administrateurs.',
    botAdmin: '❌ Le bot doit être admin.',
    owner: '⚠️ Accès refusé : Seul Prince K peut commander ce bot.',
    group: '❌ Cette commande est désactivée dans les groupes.',
    private: '❌ Utilise cette commande en message privé.',
    wait: '⏳ Analyse en cours...',
    error: '❌ Erreur technique rencontrée.',
};

// --- GESTION DE LA SESSION ---
global.sessionName = 'session'; 

// Système de mise à jour automatique du fichier
let file = require.resolve(__filename)
fs.watchFile(file, () => {
    fs.unwatchFile(file)
    console.log(`Mise à jour du fichier de config : ${__filename}`)
    delete require.cache[file]
    require(file)
})
