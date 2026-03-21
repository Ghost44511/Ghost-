const { GoogleGenerativeAI } = require("@google/generative-ai");

const BOT_CONFIG = {
    name: "Prince K",
    owner: "237650554606",
    apiKey: "AIzaSyDWQnc9lK9YD3xiUDLiLHAn_XFaOTxdObM"
};

const genAI = new GoogleGenerativeAI(BOT_CONFIG.apiKey);

async function startBot() {
    console.log(`\n[${BOT_CONFIG.name}] Démarrage en cours...`);
    
    // Liste des noms possibles (du plus récent au plus vieux)
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
    let modelInstance = null;

    for (const modelName of modelsToTry) {
        try {
            console.log(`[${BOT_CONFIG.name}] Tentative avec : ${modelName}...`);
            const testModel = genAI.getGenerativeModel({ model: modelName });
            
            // Test réel de réponse
            const result = await testModel.generateContent("Test");
            await result.response;
            
            modelInstance = testModel;
            console.log(`✅ SUCCÈS : Modèle "${modelName}" activé !`);
            break; 
        } catch (e) {
            console.log(`❌ Échec pour ${modelName}`);
        }
    }

    if (!modelInstance) {
        console.error("\n[!] Aucun modèle n'a pu être chargé. Vérifie ta clé API.");
    }
}

startBot();

// Maintien du serveur en ligne
setInterval(() => {}, 60000);
