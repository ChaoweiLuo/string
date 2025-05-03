const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

module.exports = (program) => {
  const cmd = new Command('aes')
    .description('AES加密/解密 (AES encryption/decryption)')
    .argument('<input>')
    .option('-m, --mode <mode>', '加密模式 (cipher mode)', 'aes-256-cbc')
    .option('-k, --key <key>', '加密密钥，未提供时自动生成 (encryption key)')
    .option('-i, --iv <iv>', '初始化向量，未提供时自动生成 (initialization vector)')
    .option('-o, --output <format>', '输出格式 (hex/base64)', 'hex')
    .option('-d, --decrypt', '解密模式 (decryption mode)')
    .action((input, options) => {
      try {
        const algorithm = options.mode.toLowerCase();
        const key = options.key || crypto.randomBytes(32).toString('hex');
        const iv = options.iv || crypto.randomBytes(16).toString('hex');
        // 参数校验
        // 统一参数校验（加密/解密都需要）
        if (iv && iv.length !== 32 && !algorithm.includes('gcm')) {
          throw new Error(`IV长度应为32位十六进制（对应16字节），当前长度：${iv.length}位`);
        }
        
        // 根据模式选择加密/解密器
        const cipher = options.decrypt 
          ? crypto.createDecipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'))
          : crypto.createCipheriv(algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));

        // 统一输入编码处理
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
        if (!options.iv) console.log(chalk.yellow(`生成IV：${iv}`));
      } catch (err) {
        console.log(chalk.red(`错误：${err.message}\n提示：请确认参数符合要求（${algorithm}需要${options.decrypt ? '解密' : '加密'}密钥和IV）`));
      }
    });

  program.addCommand(cmd);
};