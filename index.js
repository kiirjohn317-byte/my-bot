const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const P = require("pino")

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({
    auth: state,
    logger: P({ level: 'silent' }),
    printQRInTerminal: true,
    browser: ["My-Bot", "Chrome", "1.0"]
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection } = update
    if (connection === 'open') {
      console.log("Bot Connected ✅")
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0]
    if(!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
    const from = msg.key.remoteJid
    const cmd = text.toLowerCase().trim()

    if(cmd === 'hi' || cmd === 'hello') {
      await sock.sendMessage(from, { text: 'Hello! 👋 I am online!\n\nSend *menu* for commands' })
    }
    if(cmd === 'menu') {
      await sock.sendMessage(from, { text: `*MY BOT MENU 🤖*

• hi - greeting
• menu - show menu
• alive - check bot
• owner - my owner` })
    }
    if(cmd === 'alive') {
      await sock.sendMessage(from, { text: '✅ Bot is alive and working!\nOwner: 256707507522' })
    }
    if(cmd === 'owner') {
      await sock.sendMessage(from, { text: 'My owner: wa.me/256707507522' })
    }
  })
}

startBot()
