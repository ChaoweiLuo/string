const { Command } = require('commander');
const chalk = require('chalk').default;

module.exports = (program) => {
  const cmd = new Command('number')
    .description('数字格式转换工具')
    .option('-f, --format <type>', '输出格式（bin/oct/dec/hex/sci/group/cn）', 'dec')
    .option('-r, --radix <base>', '输入数字的基数（2-36）')
    .argument('<input>', '输入数字（自动识别进制前缀）')
    .action((input, options) => {
      try {
        // 解析输入数字
        const number = parseNumber(input, options.radix);
        
        // 格式转换处理
        const result = formatNumber(number, options.format);
        
        // 彩色输出结果
        console.log(chalk.cyan(`原始值：${number.toString()}`));
        console.log(chalk.yellow(`转换结果：${result}`));

        // 自动显示常用进制
        if (!options.format) {
          console.log(chalk.green('\n完整进制表示：'));
          console.log(`二进制  : 0b${number.toString(2)}`);
          console.log(`八进制  : 0o${number.toString(8)}`);
          console.log(`十进制  : ${number.toString(10)}`);
          console.log(`十六进制: 0x${number.toString(16).toUpperCase()}`);
        }

      } catch (err) {
        console.error(chalk.red(`错误：${err.message}`));
        process.exit(1);
      }
    });

  program.addCommand(cmd);
};

// 数字解析逻辑
function parseNumber(input, radix) {
  // 处理科学计数法
  if (/^[+-]?(\d+(\.\d*)?|\.\d+)[eE][+-]?\d+$/.test(input)) {
    const num = Number(input);
    if (isNaN(num)) throw new Error('无效的科学计数法格式');
    return BigInt(num.toLocaleString('fullwide', { useGrouping: false }));
  }

  // 自动识别前缀
  const prefixMap = {
    '0b': 2,
    '0o': 8,
    '0x': 16
  };
  
  const prefix = input.slice(0, 2);
  if (prefix in prefixMap) {
    return BigInt(input);
  }

  // 自定义基数处理
  if (radix) {
    if (radix < 2 || radix > 36) throw new Error('基数范围：2-36');
    const parsed = parseInt(input, radix);
    if (isNaN(parsed)) throw new Error(`无效的${radix}进制数字`);
    return BigInt(parsed);
  }

  // 常规数字验证
  if (!/^[+-]?\d+$/.test(input)) throw new Error('无效数字格式');
  return BigInt(input);
}

// 格式化输出逻辑
function formatNumber(number, format) {
  switch (format.toLowerCase()) {
    case 'bin':
      return `0b${number.toString(2)}`;
    case 'oct':
      return `0o${number.toString(8)}`;
    case 'hex':
      return `0x${number.toString(16).toUpperCase()}`;
    case 'sci': {
      const [coefficient, exponent] = number.toString().split('e');
      return `${coefficient}e${exponent.replace('+', '')}`;
    }
    case 'group':
      return new Intl.NumberFormat('en-US').format(number);
    case 'cn':
      return numberToChinese(number);
    default:
      let radix = parseInt(format) || 10;
      return number.toString(radix);
  }

function numberToChinese(num) {
  const units = ['', '拾', '佰', '仟'];
  const bigUnits = ['', '万', '亿', '兆'];
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  
  let str = '';
  let needZero = false;
  
  if (num < 0n) {
    str += '负';
    num = -num;
  }

  let unitIndex = 0;
  while (num > 0n) {
    let group = Number(num % 10000n);
    num = num / 10000n;
    
    let groupStr = '';
    for (let i = 0; i < 4; i++) {
      let n = group % 10;
      if (n !== 0) {
        if (needZero) {
          groupStr = digits[0] + groupStr;
          needZero = false;
        }
        groupStr = digits[n] + units[i] + groupStr;
      } else if (groupStr !== '') {
        needZero = true;
      }
      group = Math.floor(group / 10);
    }
    
    if (groupStr.endsWith(digits[0])) {
      groupStr = groupStr.slice(0, -1);
    }
    
    if (groupStr !== '') {
      str = groupStr + bigUnits[unitIndex] + str;
      needZero = true;
    }
    
    unitIndex++;
  }
  
  return str.replace(/零+/g, '零').replace(/零$/, '') || digits[0];
}
}