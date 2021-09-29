// Modules //

const Discord = require('discord.js')
const ms = require('ms')
const fs = require('fs')
const chalk = require('chalk')
const db = require('quick.db')
const { keep_alive } = require("./keep_alive");

// Miscellaneous //

const {
    token,
    PREFIX
} = require('./config.json')
const client = new Discord.Client()

const colors = require('./colors.json')
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))

client.commands = new Discord.Collection()


// Bot Code //

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {

    console.log(chalk.green("[" + client.user.username + "]"), "Bot Online");
});

client.on('messageDelete', async message => {
    db.set(`msg_${message.channel.id}`, message.content)
    db.set(`author_${message.channel.id}`, message.author.id)
})

client.on('message', async message => {

    const prefixMention = new RegExp(`^<@!?${client.user.id}> `);
    const prefix = message.content.match(prefixMention) ? message.content.match(prefixMention)[0] : PREFIX;

    let mentionEmbed = new Discord.MessageEmbed()
        .setTimestamp()
        .setDescription(` بوت التعاميم `)
        .setColor(colors.blue)

        
    if (message.mentions.users.has(message.client.user.id)) message.channel.send(`<@${message.author.id}>`, mentionEmbed)

    if (!message.content.startsWith(prefix)) return;


    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    let checkingBlacklistedMembers = db.fetch(`blacklistMember_${message.author.id}`)
    if (checkingBlacklistedMembers === null) {
        checkingBlacklistedMembers === false
    }
  

    let blacklistedEmbed = new Discord.MessageEmbed()
        .setTitle("انت ممنوع من استخدام اوامر البوت")
        .setColor(colors.red)
        .setDescription("انت بقائمة البلاك ليست لمزيد من المعلومات تواصل مع <@343208565999403009> ")
        .setFooter(`${client.user.username}`, client.user.avatarURL())

    if (checkingBlacklistedMembers === true) message.channel.send(blacklistedEmbed);

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    try {
        command.execute(message, args, client);
       // console.log(chalk.greenBright('[COMMAND]'), `${message.author.tag} used the command ` + commandName)
    } catch (error) {
        console.log(error);
        message.reply('there was an error trying to execute that command! ```\n' + error + "\n```");
    }
});

client.on('message', async message => {
if (message.channel.type === "dm") {
if (message.author.id === client.user.id) return;
var embed = new Discord.MessageEmbed()
.addField(`SEND BY:`, `<@${message.author.id}>`)
 .addField(`MESSAGE:`, ` \`\`\`${message.content}\`\`\` `)
client.channels.cache.get("890822079648256061")
.send(embed)
}
});

client.login(token).catch(error => {
    console.log(chalk.red('[ERROR] ') + error)
})
