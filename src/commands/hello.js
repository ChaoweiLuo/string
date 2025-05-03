const { Command } = require('commander');
const chalk = require('chalk').default;

module.exports = (program) => {
  const cmd = new Command('hello')
    .description('示例命令')
    .action(() => {
      console.log(chalk.green('Hello from @string/cli!'));
    });

  program.addCommand(cmd);
};