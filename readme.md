# @luoga/string

一个功能强大的命令行工具集，提供了多种实用的字符串处理、加密、时间和数字格式化功能。

## 功能特点

- 🔒 支持多种加密算法（RSA、EdDSA、MD5）
- 💰 货币格式转换和本地化
- 📅 灵活的日期时间格式化
- 🔢 多进制数字转换和格式化
- 🌐 支持国际化和时区处理

## 安装

```bash
npm install @luoga/string
```

## 命令说明

### 加密相关命令

#### RSA 加密/解密
```bash
# 生成密钥对
string rsa -b 2048

# 使用公钥加密
string rsa -e --public-key <公钥文件路径>

# 使用私钥解密
string rsa -d --private-key <私钥文件路径>
```

#### EdDSA 数字签名
```bash
# 生成密钥对
string eddsa -t ed25519

# 签名数据
string eddsa -s --private-key <私钥文件路径>

# 验证签名
string eddsa -v --public-key <公钥文件路径>
```

#### MD5 哈希
```bash
# 计算字符串的MD5值
string md5 "要计算的文本"
```

### 货币格式化
```bash
# 格式化为美元
string currency 1234567.89 -c USD -l en-US

# 格式化为人民币
string currency 1234567.89 -c CNY -l zh-CN
```

### 日期时间处理
```bash
# 格式化当前时间
string date

# 格式化指定时间戳
string date 1609459200000

# 自定义格式输出
string date -f "YYYY-MM-DD HH:mm:ss"

# 指定时区输出
string date -z Asia/Shanghai
```

### 数字格式化
```bash
# 进制转换
string number 255 -f hex  # 十进制转十六进制
string number 0xFF -f bin # 十六进制转二进制

# 科学计数法
string number 1234567 -f sci

# 千位分隔
string number 1234567 -f group

# 中文大写
string number 1234567 -f cn
```

## 注意事项

- 所有命令支持 `--help` 参数查看详细使用说明
- 加密操作请妥善保管密钥文件
- 时间操作默认使用系统时区
- 数字格式化支持大数处理

## 许可证

MIT