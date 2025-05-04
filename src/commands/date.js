const { Command } = require('commander');
const chalk = require('chalk').default;

module.exports = (program) => {
  const cmd = new Command('date')
    .description('时间格式化工具')
    .option('-f, --format <format>', '自定义时间格式')
    .option('-i, --input-timezone <timezone>', '输入时区（例如：UTC+8 或 Asia/Shanghai）')
    .option('-o, --output-timezone <timezone>', '输出时区（例如：UTC+8 或 Asia/Shanghai）')
    .option('-l, --list-timezones', '列出所有可用的时区')
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

        if (options.listTimezones) {
          const timezones = Intl.supportedValuesOf('timeZone');
          console.log(chalk.cyan('可用的时区列表：'));
          timezones.forEach(tz => console.log(chalk.yellow(tz)));
          return;
        }

        // 处理输入时区
        let inputTimezone = 'UTC';
        if (options.inputTimezone) {
          if (options.inputTimezone.startsWith('UTC')) {
            const offset = parseInt(options.inputTimezone.slice(3)) || 0;
            inputTimezone = `Etc/GMT${offset >= 0 ? '-' : '+'}${Math.abs(offset)}`;
          } else {
            inputTimezone = options.inputTimezone;
          }
        }

        // 处理输出时区
        let outputTimezone = 'UTC';
        if (options.outputTimezone) {
          if (options.outputTimezone.startsWith('UTC')) {
            const offset = parseInt(options.outputTimezone.slice(3)) || 0;
            outputTimezone = `Etc/GMT${offset >= 0 ? '-' : '+'}${Math.abs(offset)}`;
          } else {
            outputTimezone = options.outputTimezone;
          }
        }

        // 使用输入时区解析日期
        if (dateString) {
          // 创建一个新的Date对象，并将其解释为输入时区的时间
          const [datePart, timePart = '00:00:00'] = dateString.split(/[T ]/);  // 分割日期和时间部分
          const [year, month, day] = datePart.split('-').map(Number);
          let [hour, minute, second] = timePart.split(':').map(Number);
          
          // 处理24:00:00的情况，转换为下一天的00:00:00
          if (hour === 24 && minute === 0 && second === 0) {
            hour = 0;
            const nextDay = new Date(Date.UTC(year, month - 1, day + 1));
            date = nextDay;
          } else {
            // 创建UTC时间
            date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
          }

          if (options.inputTimezone && options.inputTimezone !== 'UTC') {
            // 获取输入时区的偏移量
            const formatter = new Intl.DateTimeFormat('en-US', {
              timeZone: inputTimezone,
              timeZoneName: 'longOffset'
            });
            
            const tzParts = formatter.formatToParts(date);
            const tzOffset = tzParts
              .find(part => part.type === 'timeZoneName')
              ?.value.match(/GMT([+-]\d{2}):?(\d{2})?/)?.[0];
            
            if (tzOffset) {
              const offsetHours = parseInt(tzOffset.slice(4, 7), 10);
              const offsetMinutes = parseInt(tzOffset.slice(-2) || '00', 10);
              const totalOffsetMinutes = offsetHours * 60 + (offsetHours >= 0 ? offsetMinutes : -offsetMinutes);
              
              // 调整时间
              date = new Date(date.getTime() - totalOffsetMinutes * 60000);
            }
          }
        }
        
        // 辅助函数：解析时区偏移量
        function getTimezoneOffset(tzName) {
          const match = tzName.match(/([+-]\d{1,2})(?::(\d{2}))?/);
          if (match) {
            const hours = parseInt(match[1], 10);
            const minutes = parseInt(match[2] || '0', 10);
            return hours * 60 + (hours >= 0 ? minutes : -minutes);
          }
          return 0;
        }

        const formatOptions = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
          timeZone: outputTimezone
        };

        const formatter = new Intl.DateTimeFormat('zh-CN', formatOptions);
        let formatted = formatter.format(date);

        if (options.format) {
          formatted = formatCustom(date, options.format, outputTimezone);
        }

        console.log(chalk.cyan(`有效时间：${formatted}`));
        console.log(chalk.yellow(`时间戳：${date.getTime()}`));
        console.log(chalk.green(`输入时区：${inputTimezone}`));
        console.log(chalk.green(`输出时区：${outputTimezone}`));

        function formatCustom(date, format, timezone) {
          const opts = { timeZone: timezone };
          const dtf = new Intl.DateTimeFormat('en', {
            timeZone: timezone,
            hour12: false,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          
          const parts = dtf.formatToParts(date);
          const values = {};
          parts.forEach(part => {
            values[part.type] = part.value;
          });

          // 确保24:00:00显示为00:00:00
          if (values.hour === '24') {
            values.hour = '00';
          }

          return format
            .replace(/YYYY/g, values.year)
            .replace(/YY/g, values.year.slice(-2))
            .replace(/MM/g, values.month)
            .replace(/DD/g, values.day)
            .replace(/HH/g, values.hour.padStart(2, '0'))
            .replace(/mm/g, values.minute.padStart(2, '0'))
            .replace(/ss/g, values.second.padStart(2, '0'));
        }
        
      } catch (err) {
        console.error(chalk.red(`错误：${err.message}`));
        process.exit(1);
      }
    });

  program.addCommand(cmd);
};