const http = require('http');
http.createServer((req,res)=>{
  if(req.url.startsWith('/qr')){
    const data = req.url.split('=')[1] || '';
    if(!data) return res.end('No QR yet, refresh logs');
    res.writeHead(302, { Location: `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${data}` });
    return res.end();
  }
  res.end('<h1>Bot is Online! Go to /qr?data=YOUR_QR_CODE to see QR</h1>');
}).listen(process.env.PORT||3000, ()=>console.log('Web server listening'));

const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const P = require('pino');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ["My-Bot", "Chrome", "1.0"]
  });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (update) => {
    const { connection, qr } = update;
    if(qr){
      console.log('QR CODE:', qr);
      console.log(`QR LINK: https://my-bot-4qr4.onrender.com/qr?data=${qr}`);
      console.log(`SCAN THIS: https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${qr}`);
    }
    if (connection === 'open') console.log("Bot Connected ✅");
    if (connection === 'close') startBot();
  });
  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const from = msg.key.remoteJid;
    if(text.toLowerCase() === 'hi' || text.toLowerCase() === 'hello'){
      await sock.sendMessage(from, { text: 'Hello! 👋 Bot Online! ✅\nType.menu' });
    } else if(text.toLowerCase() === '.ping'){
      await sock.sendMessage(from, { text: 'Pong! 🏓 Active!' });
    } else if(text.toLowerCase() === '.menu'){
      await sock.sendMessage(from, { text: '*Menu*\n.hi\n.ping\n.menu' });
    }
  });
}
startBot();
