const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

module.exports = (program) => {
  const cmd = new Command('chacha20')
    .description('ChaCha20加密/解密 (ChaCha20 encryption/decryption)')
    .argument('<input>')
    .option('-k, --key <key>', '32字节密钥（16进制），未提供时自动生成 (32-byte key)')
    .option('-n, --nonce <nonce>', '12字节随机数，未提供时自动生成 (12-byte nonce)')
    .option('-o, --output <format>', '输出格式 [hex/base64]', 'hex')
    .option('-d, --decrypt', '解密模式 (decryption mode)')
    .action((input, options) => {
      try {
        const key = options.key || crypto.randomBytes(32).toString('hex');
        const nonce = options.nonce || crypto.randomBytes(12).toString('hex');

        const cipher = crypto.createCipheriv('chacha20',
          Buffer.from(key, 'hex'),
          Buffer.from(nonce, 'hex'),
          { authTagLength: 16 }
        );

        let result = cipher.update(input, 'utf8', options.output);
        result += cipher.final(options.output);

        console.log(chalk.blue(options.decrypt ? '解密结果：' : '加密结果：'));
        console.log(chalk.green(result));
        
        if (!options.key) console.log(chalk.yellow(`生成密钥：${key}`));
        if (!options.nonce) console.log(chalk.yellow(`生成Nonce：${nonce}`));
      } catch (err) {
        console.log(chalk.red(`错误：${err.message}`));
      }
    });

  program.addCommand(cmd);
};