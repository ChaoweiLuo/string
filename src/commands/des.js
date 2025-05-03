const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

module.exports = (program) => {
  const cmd = new Command('des')
    .description('DES加密/解密 (DES encryption/decryption)')
    .argument('<input>')
    .option('-m, --mode <mode>', '加密模式 [cbc/ecb] (cipher mode)', 'des-cbc')
    .option('-k, --key <key>', '8字节密钥（16进制），未提供时自动生成 (8-byte key)')
    .option('-i, --iv <iv>', '初始化向量（仅CBC模式需要） (initialization vector)')
    .option('-o, --output <format>', '输出格式 [hex/base64]', 'hex')
    .option('-d, --decrypt', '解密模式 (decryption mode)')
    .action((input, options) => {
      try {
        // 参数校验
        if (key.length !== 16) {
          throw new Error('DES密钥应为16位十六进制（对应8字节）');
        }
        if (options.mode.includes('cbc') && iv && iv.length !== 16) {
          throw new Error('CBC模式IV应为16位十六进制（对应8字节）');
        }
        const key = options.key || crypto.randomBytes(8).toString('hex');
        const iv = options.mode.includes('cbc') 
          ? (options.iv || crypto.randomBytes(8).toString('hex'))
          : '';

        const cipher = options.decrypt 
          ? crypto.createDecipheriv(options.mode, Buffer.from(key, 'hex'), iv ? Buffer.from(iv, 'hex') : null)
          : crypto.createCipheriv(options.mode, Buffer.from(key, 'hex'), iv ? Buffer.from(iv, 'hex') : null);

        let result;
        if (options.decrypt) {
          const inputBuffer = Buffer.from(input, options.output);
          result = cipher.update(inputBuffer, null, 'utf8');
          result += cipher.final('utf8');
        } else {
          result = cipher.update(input, 'utf8', options.output);
          result += cipher.final(options.output);
        }

        console.log(chalk.blue(options.decrypt ? '解密结果：' : '加密结果：'));
        console.log(chalk.green(result));
        
        if (!options.key) console.log(chalk.yellow(`生成密钥：${key}`));
        if (options.mode.includes('cbc') && !options.iv) console.log(chalk.yellow(`生成IV：${iv}`));
      } catch (err) {
        console.log(chalk.red(`错误：${err.message}\n提示：${options.mode}模式需要${options.decrypt ? '解密' : '加密'}密钥${options.mode.includes('cbc') ? '和IV' : ''}`));
      }
    });

  program.addCommand(cmd);
};