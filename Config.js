const fs = require('fs');

// --- CONFIGURATION PRINCIPALE ---
global.owner = ['237650554606']; // Ton numéro de propriétaire
global.ownername = 'Prince K';   // Ton nom de créateur
global.botname = 'PRINCE-K-BOT'; // Le nom de ton bot

// --- PARAMÈTRES DE FONCTIONNEMENT ---
global.prefix = ['.', '!', '/']; // Les préfixes que le bot va reconnaître
global.public = true;            // IMPORTANT : 'true' pour que le bot réponde à tout le monde
global.autoRead = true;          // Le bot marque les messages comme "lus"
global.autobio = false;          // Met à jour ta bio WhatsApp automatiquement
global.statusview = true;        // Le bot regarde les statuts de tes contacts

// --- PERSONNALISATION DES MESSAGES ---
global.mess = {
    success: '✅ Opération réussie !',
    admin: '❌ Cette commande est réservée aux admins du groupe.',
    botAdmin: '❌ Le bot doit être admin pour faire cela.',
    owner: '❌ Désolé, seul Prince K peut utiliser cette commande.',
    group: '❌ Cette commande ne fonctionne que dans les groupes.',
    private: '❌ Cette commande est réservée aux messages privés.',
    wait: '⏳ Traitement en cours...',
    error: '❌ Une erreur est survenue !',
};

// --- IMAGES ET LIENS (Optionnel) ---
global.thumb = fs.readFileSync('./media/thumb.jpg'); // Assure-toi d'avoir une image à cet endroit
global.waGroup = 'https://chat.whatsapp.com/votre-lien'; // Ton lien de groupe si tu en as un

// --- SYSTÈME DE SESSION ---
// Le nom du dossier qui sera créé sur Katabump
global.sessionName = 'session'; 

// Ne pas toucher à cette partie, elle permet de mettre à jour le fichier en temps réel
let file = require.resolve(__filename)
fs.watchFile(file, () => {
	fs.unwatchFile(file)
	console.log(`Mise à jour de : ${__filename}`)
	delete require.cache[file]
	require(file)
})
