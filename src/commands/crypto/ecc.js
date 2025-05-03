const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

const ECC_CURVES = {
  'secp256k1': 'secp256k1',
  'prime256v1': 'prime256v1',
  'secp384r1': 'secp384r1'
};

module.exports = (program) => {
  const cmd = new Command('ecc')
    .description('ECC椭圆曲线加密/签名操作')
    .option('-c, --curve <type>', `可用曲线类型：${Object.keys(ECC_CURVES).join(', ')}`, 'secp256k1')
    .option('-s, --sign', '签名模式')
    .option('-v, --verify', '验证模式')
    .option('--public-key <path>', '公钥文件路径（PEM格式）')
    .option('--private-key <path>', '私钥文件路径（PEM格式）')
    .action(async (options) => {
      try {
        if (!options.sign && !options.verify) {
          // 密钥生成
          if (!ECC_CURVES[options.curve]) {
            throw new Error(`不支持的曲线类型：${options.curve}`);
          }

          const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
            namedCurve: options.curve,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
          });

          console.log(chalk.green('生成的ECC密钥对：'));
          console.log(chalk.yellow('公钥：') + publicKey);
          console.log(chalk.yellow('私钥：') + privateKey);
          return;
        }

        const data = await new Promise((resolve) => {
          process.stdin.on('data', (chunk) => resolve(chunk.toString()));
        });

        if (options.sign) {
          const sign = crypto.createSign('SHA256');
          sign.update(data);
          const signature = sign.sign({
            key: options.privateKey,
            dsaEncoding: 'ieee-p1363'
          }).toString('base64');
          console.log(chalk.blue('签名结果：'));
          console.log(signature);
        }

        if (options.verify) {
          const [message, signature] = data.split('|');
          const verify = crypto.createVerify('SHA256');
          verify.update(message);
          const isValid = verify.verify({
            key: options.publicKey,
            dsaEncoding: 'ieee-p1363'
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