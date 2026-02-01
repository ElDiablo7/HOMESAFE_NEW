
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('--- ENV DEBUG DIAGNOSTIC ---');
console.log('Current Directory:', process.cwd());
console.log('__dirname:', __dirname);

const envPath = path.join(__dirname, '.env');
console.log('Looking for .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('✅ .env file FOUND');
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('File content length:', envContent.length);
    console.log('First 50 chars:', envContent.substring(0, 50).replace(/\n/g, '\\n'));
    
    // Check for "txt" extension hidden
    const dirFiles = fs.readdirSync(__dirname);
    const envFiles = dirFiles.filter(f => f.startsWith('.env'));
    console.log('All .env* files in directory:', envFiles);
} else {
    console.log('❌ .env file NOT FOUND');
    const dirFiles = fs.readdirSync(__dirname);
    console.log('Files in directory:', dirFiles);
}

const result = dotenv.config({ path: envPath });

if (result.error) {
    console.log('❌ dotenv loading error:', result.error.message);
} else {
    console.log('✅ dotenv loaded successfully');
}

console.log('--- LOADED VARIABLES ---');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set (starts with ' + process.env.OPENAI_API_KEY.substring(0, 5) + '...)' : 'NOT SET');
console.log('API_KEY:', process.env.API_KEY ? 'Set' : 'NOT SET');
console.log('LLM_PROVIDER:', process.env.LLM_PROVIDER);
console.log('------------------------');
