require('dotenv').config();

// Configure DNS to use Google DNS for SRV record resolution (MongoDB Atlas)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║        🧬 Vitalis AI Server Running 🧬           ║
║                                                   ║
║   Environment : ${(process.env.NODE_ENV || 'development').padEnd(33)}║
║   Port        : ${String(PORT).padEnd(33)}║
║   MongoDB     : Connected                         ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
