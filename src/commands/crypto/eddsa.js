const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

module.exports = (program) => {
  const cmd = new Command('eddsa')
    .description('EdDSA数字签名算法')
    .option('-t, --type <algorithm>', '算法类型（ed25519/ed448）', 'ed25519')
    .option('-s, --sign', '签名模式')
    .option('-v, --verify', '验证模式')
    .option('--public-key <path>', '公钥文件路径（PEM格式）')
    .option('--private-key <path>', '私钥文件路径（PEM格式）')
    .action(async (options) => {
      try {
        if (!options.sign && !options.verify) {
          const { publicKey, privateKey } = crypto.generateKeyPairSync(options.type, {
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });

          console.log(chalk.green('生成的EdDSA密钥对：'));
          console.log(chalk.yellow('公钥：') + publicKey);
          console.log(chalk.yellow('私钥：') + privateKey);
          return;
        }

        const data = await new Promise((resolve) => {
          process.stdin.on('data', (chunk) => resolve(chunk.toString()));
        });

        if (options.sign) {
          const sign = crypto.createSign(null);
          sign.update(data);
          const signature = sign.sign({
            key: options.privateKey,
            format: 'pem'
          }).toString('base64');
          console.log(chalk.blue('签名结果：'));
          console.log(signature);
        }

        if (options.verify) {
          const [message, signature] = data.split('|');
          const verify = crypto.createVerify(null);
          verify.update(message);
          const isValid = verify.verify({
            key: options.publicKey,
            format: 'pem'
          }, Buffer.from(signature, 'base64'));

          console.log(chalk.blue('验证结果：'));
          console.log(isValid ? chalk.green('有效签名') : chalk.red('无效签名'));
        }
      } catch (error) {
        console.error(chalk.red(`错误：${error.message}`));
        process.exit(1);
      }
    });

  program.addCommand(cmd);
};