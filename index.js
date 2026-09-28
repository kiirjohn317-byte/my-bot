const http = require('http');
http.createServer((req,res)=>res.end('Bot is Online!')).listen(process.env.PORT||3000, ()=>console.log('Web server listening'));

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["My-Bot", "Chrome", "1.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if(qr){
      console.log('QR CODE: ', qr);
    }
    if (connection === 'open') {
      console.log("Bot Connected ✅");
    }
    if (connection === 'close') {
      startBot();
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const from = msg.key.remoteJid;

    if(text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello'){
      await sock.sendMessage(from, { text: 'Hello! 👋 Bot Online! ✅\nType.menu' });
    }
    else if(text.toLowerCase() === '.ping'){
      await sock.sendMessage(from, { text: 'Pong! 🏓 Active!' });
    }
    else if(text.toLowerCase() === '.menu'){
      await sock.sendMessage(from, { text: '*Menu*\n.hi\n.ping\n.menu' });
    }
    else {
      await sock.sendMessage(from, { text: `You: ${text}\nReceived ✅` });
    }
  });
}
startBot();
