const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- CONFIGURATION ---
const BOT_CONFIG = {
    name: "Prince K",
    owner: "237650554606",
    apiKey: "AIzaSyDWQnc9lK9YD3xiUDLiLHAn_XFaOTxdObM",
    modelName: "gemini-1.5-flash" // Utilisation du 1.5 pour éviter l'erreur 404
};

// Initialisation de l'IA
const genAI = new GoogleGenerativeAI(BOT_CONFIG.apiKey);

/**
 * Fonction principale de traitement
 */
async function startBot() {
    console.log(`\n[${BOT_CONFIG.name}] Démarrage du bot...`);
    console.log(`[${BOT_CONFIG.name}] Admin: ${BOT_CONFIG.owner}`);

    try {
        const model = genAI.getGenerativeModel({ model: BOT_CONFIG.modelName });

        // Test de connexion à l'IA au démarrage
        const testPrompt = "Test de connexion. Réponds par 'OK'.";
        const result = await model.generateContent(testPrompt);
        const response = await result.response;
        
        console.log(`[${BOT_CONFIG.name}] Système IA prêt : ${response.text().trim()}`);
        
    } catch (error) {
        console.error(`\n❌ ERREUR CRITIQUE au démarrage :`);
        if (error.message.includes("404")) {
            console.error("-> Le modèle est introuvable. Mise à jour requise.");
        } else if (error.message.includes("API key")) {
            console.error("-> Ta clé API est invalide ou mal copiée.");
        } else {
            console.error(`-> Détails : ${error.message}`);
        }
        // Empêche le crash violent en laissant le processus tourner
        console.log(`[${BOT_CONFIG.name}] Le serveur reste en ligne pour diagnostic...`);
    }
}

// Lancement du bot
startBot();

// Gestionnaire pour éviter que Katabump ne marque le serveur comme "Offline"
setInterval(() => {
    // Cette boucle vide maintient le processus Node.js actif
}, 1000 * 60); 

/**
 * Note : Pour l'intégration WhatsApp (Baileys), tu devras ajouter 
 * la logique de connexion socket ici.
 */
