const { Command } = require('commander');
const chalk = require('chalk').default;

module.exports = (program) => {
  const cmd = new Command('currency')
    .description('货币格式转换工具')
    .option('-l, --locale <locale>', '目标地区代码（如：en-US, zh-CN）', 'en-US')
    .option('-c, --currency <code>', '货币代码（ISO 4217，如：USD, CNY）', 'USD')
    .argument('<amount>', '输入金额（支持千位分隔符）')
    .action((amount, options) => {
      try {
        // 清理输入金额
        const cleanedAmount = cleanAmount(amount);
        
        // 创建格式化实例
        const formatter = new Intl.NumberFormat(options.locale, {
          style: 'currency',
          currency: validateCurrency(options.currency),
          currencyDisplay: 'symbol'
        });

        // 格式转换
        const result = formatter.format(cleanedAmount);

        // 彩色输出
        console.log(chalk.cyan(`原始金额：${cleanedAmount}`));
        console.log(chalk.green(`本地化格式：${result}`));
        
        // 显示汇率信息
        if (options.locale !== 'en-US') {
          const usdFormatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          });
          console.log(chalk.yellow(`美元等价：${usdFormatter.format(cleanedAmount)}`));
        }

      } catch (err) {
        console.error(chalk.red(`错误：${err.message}`));
        process.exit(1);
      }
    });

  program.addCommand(cmd);
};

// 金额清理逻辑
function cleanAmount(input) {
  // 移除千位分隔符和多余空格
  const cleaned = input.replace(/[\s,_]/g, '');
  
  // 处理不同小数格式
  const decimalSeparator = cleaned.match(/[.,]/g);
  if (decimalSeparator && decimalSeparator.length > 1) {
    throw new Error('无效的小数格式');
  }
  
  // 转换为数字
  const numberValue = Number(cleaned.replace(',', '.'));
  
  if (isNaN(numberValue)) {
    throw new Error('无效的金额格式');
  }
  return numberValue;
}

// 货币代码验证
function validateCurrency(code) {
  if (!/^[A-Z]{3}$/.test(code)) {
    throw new Error('无效的货币代码（需3位大写字母）');
  }
  return code;
}