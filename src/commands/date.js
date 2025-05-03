const { Command } = require('commander');
const chalk = require('chalk').default;

module.exports = (program) => {
  const cmd = new Command('date')
    .description('时间格式化工具')
    .option('-f, --format <format>', '自定义时间格式')

    .option('-z, --timezone <timezone>', '设置时区（例如：Asia/Shanghai）')
    .argument('[dateString]', '日期字符串（支持ISO格式/本地时间）')
    .action((dateString, options) => {
      try {
        let date = new Date();

        if (dateString) {
          const dt = /^\d+$/
          if (dt.test(dateString)) {
            dateString = +dateString;
          }
          date = new Date(dateString);
          // 增强日期格式校验
          if (isNaN(date)) {
            throw new Error(`无法解析日期格式: ${dateString}`);
          }
        }

        const formatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: options.timezone || undefined
        };

        const formatter = new Intl.DateTimeFormat('zh-CN', formatOptions);
        let formatted = formatter.format(date);

        if (options.format) {
          formatted = formatCustom(date, options.format, options.timezone);
        }

        console.log(chalk.cyan(`有效时间：${formatted}`));
        console.log(chalk.yellow(`时间戳：${date.getTime()}`));

        function formatCustom(date, format, timezone) {
          const opts = { timeZone: timezone };
          return format.replace(/YYYY/g, new Intl.DateTimeFormat('en', { year: 'numeric', ...opts }).format(date))
            .replace(/YY/g, new Intl.DateTimeFormat('en', { year: '2-digit',...opts }).format(date))
            .replace(/MM/g, new Intl.DateTimeFormat('en', { month: '2-digit', ...opts }).format(date))
            .replace(/DD/g, new Intl.DateTimeFormat('en', { day: '2-digit', ...opts }).format(date))
            .replace(/HH/g, new Intl.DateTimeFormat('en', { hour: '2-digit', hour12: false, ...opts }).format(date))
            .replace(/mm/g, new Intl.DateTimeFormat('en', { minute: '2-digit', ...opts }).format(date))
            .replace(/ss/g, new Intl.DateTimeFormat('en', { second: '2-digit', ...opts }).format(date));
        }
        
      } catch (err) {
        console.error(chalk.red(`错误：${err.message}`));
        process.exit(1);
      }
    });

  program.addCommand(cmd);
};