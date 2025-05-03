#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk').default;

program
  .name('string')
  .description(chalk.blue('CLI工具库'))
  .version('1.0.0');

const fs = require('fs');
const path = require('path');

// 动态加载commands目录下的所有命令模块
fs.readdirSync(path.join(__dirname, 'commands'))
  .forEach(file => {
    if (file.endsWith('.js')) {
      require(`./commands/${file}`)(program);
    }
  });

program.parse(process.argv);