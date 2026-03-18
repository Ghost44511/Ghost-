const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * CONFIGURATION DU BOT PRINCE K
 */
const CONFIG = {
    nom: "Prince K",
    telephone: "237650554606",
    apiKey: "AIzaSyCjtJ8t7OxGTDH_0CgSLbvIJbsD5AyQCyg", // Ta clé API Gemini
    modele: "gemini-1.5-flash" // Modèle stable et rapide
};

// Initialisation de l'API Google
const genAI = new GoogleGenerativeAI(CONFIG.apiKey);

/**
 * Fonction pour interagir avec Gemini
 */
async function lancerAssistantPrinceK(messageUtilisateur) {
    try {
        // On récupère le modèle sans forcer la version "v1beta" pour éviter l'erreur 404
        const model = genAI.getGenerativeModel({ 
            model: CONFIG.modele,
            systemInstruction: `Tu es l'assistant personnel de ${CONFIG.nom}. 
            Ton créateur est joignable au numéro ${CONFIG.telephone}. 
            Tu dois répondre poliment et te présenter comme l'IA de Prince K.`
        });

        console.log(`[${CONFIG.nom}] Analyse de la question...`);

        // Envoi du message à Gemini
        const result = await model.generateContent(messageUtilisateur);
        const response = await result.response;
        const texte = response.text();

        console.log("\n-------------------------------------------");
        console.log(`Réponse pour Prince K : \n\n${texte}`);
        console.log("-------------------------------------------\n");

    } catch (error) {
        // Gestion des erreurs spécifiques (Clé invalide, 404, etc.)
        if (error.message.includes("API key not valid")) {
            console.error("❌ ERREUR : La clé API fournie est incorrecte ou expirée.");
        } else if (error.message.includes("404")) {
            console.error("❌ ERREUR 404 : Le modèle demandé est introuvable (Vérifie la version du SDK).");
        } else {
            console.error("❌ Une erreur est survenue :", error.message);
        }
        
        // Arrête le script en cas d'erreur pour éviter de saturer ton panel Katabump
        process.exit(1);
    }
}

// --- TEST DU BOT ---
// Tu peux changer cette phrase pour tester le bot
const promptTest = "Bonjour, qui es-tu et comment contacter ton créateur ?";

console.log(`Démarrage du bot de ${CONFIG.nom}...`);
lancerAssistantPrinceK(promptTest);
