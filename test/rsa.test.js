const { execSync } = require('child_process');
const fs = require('fs');
const crypto = require('crypto');

describe('RSA命令测试', () => {
  let publicKey, privateKey;

  beforeAll(() => {
    // 生成测试密钥对
    const keys = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    publicKey = keys.publicKey;
    privateKey = keys.privateKey;
    fs.writeFileSync('test_pub.pem', publicKey);
    fs.writeFileSync('test_priv.pem', privateKey);
  });

  afterAll(() => {
    fs.unlinkSync('test_pub.pem');
    fs.unlinkSync('test_priv.pem');
  });

  test('生成2048位密钥对', () => {
    const output = execSync('string rsa -b 2048').toString();
    expect(output).toMatch(/公钥：/);
    expect(output).toMatch(/私钥：/);
    expect(output).toMatch(/-----BEGIN PUBLIC KEY-----/);
    expect(output).toMatch(/-----BEGIN PRIVATE KEY-----/);
  });

  test('加密解密流程', () => {
    const plaintext = 'secret-data-123';
    
    // 加密测试
    const encrypted = execSync(`echo ${plaintext} | string rsa -e --public-key test_pub.pem`, {
      encoding: 'base64'
    });
    
    // 解密测试
    const decrypted = execSync(`echo ${encrypted} | string rsa -d --private-key test_priv.pem`)
      .toString().trim();

    expect(decrypted).toBe(plaintext);
  });

  test('输入数据超长校验', () => {
    const longData = 'a'.repeat(500);
    expect(() => {
      execSync(`echo ${longData} | string rsa -e --public-key test_pub.pem`)
    }).toThrow('错误：输入数据过长');
  });
});