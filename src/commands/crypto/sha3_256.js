const { Command } = require('commander');
const chalk = require('chalk').default;
const crypto = require('crypto');

module.exports = (program) => {
  const cmd = new Command('sha3-256')
    .description('生成字符串的SHA3-256哈希值')
    .argument('<string>')
    .action((str) => {
      if (!str) {
        console.log(chalk.red('错误：请输入有效字符串'));
        return;
      }
      const hash = crypto.createHash('sha3-256').update(str).digest('hex');
      console.log(chalk.blue('SHA3-256 哈希值：'));
      console.log(hash);
    });

  program.addCommand(cmd);
};