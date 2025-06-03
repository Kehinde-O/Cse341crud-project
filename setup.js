const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Welcome to the Messaging API Setup!');
console.log('This script will help you create your .env file\n');

const questions = [
  {
    name: 'PORT',
    message: 'Enter the port number (default: 8080):',
    default: '8080'
  },
  {
    name: 'MONGODB_URI',
    message: 'Enter your MongoDB URI (e.g., mongodb+srv://username:password@cluster.mongodb.net/database):',
    required: true
  },
  {
    name: 'NODE_ENV',
    message: 'Enter the environment (development, production):',
    default: 'development'
  }
];

const answers = {};

const askQuestion = (index) => {
  if (index >= questions.length) {
    createEnvFile();
    return;
  }

  const question = questions[index];
  rl.question(`${question.message} `, (answer) => {
    if (!answer && question.required) {
      console.log(`This field is required.`);
      askQuestion(index);
    } else {
      answers[question.name] = answer || question.default || '';
      askQuestion(index + 1);
    }
  });
};

const createEnvFile = () => {
  let envContent = '';
  
  for (const [key, value] of Object.entries(answers)) {
    envContent += `${key}=${value}\n`;
  }
  
  const envPath = path.join(__dirname, '.env');
  
  fs.writeFile(envPath, envContent, (err) => {
    if (err) {
      console.error('Error creating .env file:', err);
    } else {
      console.log('\n.env file created successfully!');
      console.log('You can now start the server with: npm start');
    }
    rl.close();
  });
};

askQuestion(0); 