const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

module.exports = (program) => {
  const cmd = new Command('md5')
    .description('生成字符串的MD5哈希值')
    .argument('<string>')
    .action((str) => {
      if (!str) {
        console.log(chalk.red('错误：请输入有效字符串'));
        return;
      }
      const hash = crypto.createHash('md5').update(str).digest('hex');
      console.log(chalk.blue('MD5 哈希值：'));
      console.log(hash);
    });

  program.addCommand(cmd);
};