const axios = require('axios');

const curix = async (client, msg) => {
    try {
        const res = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const xaf = res.data.rates.XAF;
        msg.reply(`💰 *ÉCONOMIE - PRINCE K*\n\n1 USD = ${xaf} FCFA\n\n_Restez informé de la valeur du Franc CFA._`);
    } catch (e) {
        msg.reply("❌ Erreur lors de la récupération des données.");
    }
};
module.exports = curix;
