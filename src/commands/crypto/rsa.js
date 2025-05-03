const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

const RSA_KEY_TYPES = {
  PRIVATE: 'private',
  PUBLIC: 'public'
};

module.exports = (program) => {
  const cmd = new Command('rsa')
    .description('RSA加密/解密操作')
    .option('-b, --bits <number>', '密钥长度（默认：2048）', '2048')
    .option('-e, --encrypt', '加密模式')
    .option('-d, --decrypt', '解密模式')
    .option('--public-key <path>', '公钥文件路径（PEM格式）')
    .option('--private-key <path>', '私钥文件路径（PEM格式）')
    .action(async (options) => {
      try {
        // 密钥生成逻辑
        if (!options.encrypt && !options.decrypt) {
          const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: parseInt(options.bits),
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });
          console.log(chalk.green('生成的RSA密钥对：'));
          console.log(chalk.yellow('公钥：') + publicKey);
          console.log(chalk.yellow('私钥：') + privateKey);
          return;
        }

        // 加密/解密逻辑
        if (options.encrypt) {
          const data = await new Promise((resolve) => {
            process.stdin.on('data', (chunk) => resolve(chunk.toString()));
          });
          const encrypted = crypto.publicEncrypt({
            key: options.publicKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
          }, Buffer.from(data));
          console.log('encrypted:', encrypted.toString('base64'));
          process.stdin.destroy();
        }

        if (options.decrypt) {
          const data = await new Promise((resolve) => {
            process.stdin.on('data', (chunk) => resolve(chunk.toString()));
          });
          const decrypted = crypto.privateDecrypt({
            key: options.privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
          }, Buffer.from(data, 'base64'));
          console.log(decrypted.toString());
          process.stdin.destroy();
        }
      } catch (error) {
        console.error(chalk.red(`错误：${error.message}`));
        process.exit(1);
      }
    });

  program.addCommand(cmd);
};