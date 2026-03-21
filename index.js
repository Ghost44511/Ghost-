const { GoogleGenerativeAI } = require("@google/generative-ai");

// Configuration du Bot Prince K
const config = {
    botName: "Prince K",
    ownerNumber: "237650554606", // Ton numéro au format international
    apiKey: "AIzaSyDWQnc9lK9YD3xiUDLiLHAn_XFaOTxdObM"
};

const genAI = new GoogleGenerativeAI(config.apiKey);

/**
 * Fonction de génération de réponse par IA
 * @param {string} prompt - La question reçue par le bot
 */
async function getPrinceKAIResponse(prompt) {
    console.log(`[${config.botName}] Analyse de la question demandée...`);
    
    try {
        // Utilisation de gemini-1.5-flash (le modèle le plus récent pour éviter l'erreur 404)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log(`[${config.botName}] Réponse générée pour l'utilisateur.`);
        return text;

    } catch (error) {
        if (error.message.includes("404")) {
            console.error("❌ ERREUR : Le modèle 'gemini-1.5-flash' n'est pas reconnu. Vérifie que ton SDK est à jour.");
        } else {
            console.error(`❌ Erreur [${config.botName}] :`, error.message);
        }
        return "Désolé, une erreur technique m'empêche de répondre pour le moment.";
    }
}

// Exemple d'exportation pour ton système Baileys/WhatsApp
module.exports = { config, getPrinceKAIResponse };
