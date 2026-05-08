const messageStyle = async (client, msg, args) => {
    const text = args.slice(1).join(" ");
    const style = args[0];

    if (!text) return msg.reply("Usage: .messageStyle [mono/bold/italic] [texte]");

    let result = text;
    if (style === 'mono') result = '```' + text + '```';
    if (style === 'bold') result = '*' + text + '*';
    if (style === 'italic') result = '_' + text + '_';

    msg.reply(result);
};
module.exports = messageStyle;
