const menu = async (client, msg) => {
    // Ton numéro pour l'affichage
    const monNumero = '237650554606';
    const nomBot = 'PRINCE K BOT';
    
    // Calcul de l'heure et de la date au Cameroun
    const date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const temps = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    const texteMenu = `
🤴 *—–––– 『 ${nomBot} 』 ––––—* 🤴

👋 *Salut !* Je suis le bot personnel de Prince K.
📅 *Date :* ${date}
⏰ *Heure :* ${temps}
📱 *Admin :* +${monNumero}

✨ *Préfixe actuel :* [ . ]

👑 *——–– 『 ADMINISTRATION 』 ––——*
│ ├ .group (open/close)
│ ├ .group (lock/unlock)
│ ├ .group (promote/demote)
│ ├ .group kick [@mention]
│ ├ .group add [numéro]
│ ├ .tag (mentionner tout le monde)
│ ├ .pp set (changer mon visage)
╰──────────────────────────

🛡️ *——–– 『 SÉCURITÉ & IB 』 ––——*
│ ├ .viewonce (discret vers mon IB)
│ ├ .save (sauvegarder vers mon IB)
│ ├ .pp get (voler une photo de profil)
╰──────────────────────────

🎨 *——–– 『 MULTIMÉDIA 』 ––——*
│ ├ .img search [sujet]
│ ├ .img gen [texte IA]
│ ├ .img sticker (créer un sticker)
│ ├ .url tiny [lien court]
│ ├ .url qr [créer un QR code]
│ ├ .url dl [téléchargement média]
╰──────────────────────────

📊 *——–– 『 SYSTÈME 』 ––——*
│ ├ .ping (vitesse du bot)
│ ├ .uptime (temps en ligne)
│ ├ .menu (afficher cette liste)
╰──────────────────────────

🤴 *PRINCE K - Puissance et Discrétion* 🤴
_© 2026 - Développé au Cameroun_
`;

    try {
        // Envoi du menu avec une image (optionnel) ou juste en texte
        // Si tu as une image préférée, remplace l'URL ci-dessous
        const imageMenu = "https://telegra.ph/file/votre-image-prince-k.jpg"; 

        await client.sendMessage(msg.from, { 
            image: { url: imageMenu }, 
            caption: texteMenu 
        });

    } catch (e) {
        // Si l'image échoue, on envoie juste le texte
        await client.sendMessage(msg.from, { text: texteMenu });
    }
};

module.exports = menu;
