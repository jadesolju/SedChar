#!/usr/bin/env node
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dir = path.resolve(__dirname, '..');

async function askQuestion(query) {
  const rl = readline.close ? readline : readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve =>
    rl.question(query, ans => {
      if (typeof readline.createInterface === 'function' && rl.close) {
        rl.close();
      }
      resolve(ans.trim());
    })
  );
}

function getAuthConfig(token, explicitPassword, explicitUsername) {
  const username = explicitUsername || token || 'x-access-token';
  const password = explicitPassword || token || '';
  return { username, password };
}

async function resolveCredentials(options = {}) {
  const env = options.env || process.env;
  const argv = options.argv || process.argv;
  const prompt = options.prompt || askQuestion;

  let token = env.GITHUB_TOKEN || env.GH_TOKEN || (argv && argv[2]);
  let password = env.GIT_PASSWORD || env.GITHUB_PASSWORD;
  let username = env.GIT_USERNAME || env.GITHUB_USER || env.GITHUB_ACTOR;

  if (!token && !password && typeof prompt === 'function') {
    console.log('💡 คุณสามารถสร้าง GitHub Token (Personal Access Token - Classic หรือ Fine-grained) ได้ที่:');
    console.log('   https://github.com/settings/tokens (ติ๊กเลือกสิทธิ์ "repo")\n');
    token = await prompt('🔑 กรุณากรอก GitHub Personal Access Token (PAT): ');
  }

  if (!token && !password) {
    return null;
  }

  return getAuthConfig(token, password, username);
}

async function main() {
  console.log('\n🚀 === SedChar.AI GitHub Push Utility ===\n');

  const auth = await resolveCredentials();

  if (!auth || (!auth.username && !auth.password)) {
    console.error('❌ ไม่พบ Token หรือ Password ยกเลิกการ Push');
    process.exit(1);
  }

  console.log('\n⏳ กำลัง Push ไปยัง https://github.com/jadesolju/SedChar.git (branch: main)...');

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: 'main',
      force: true,
      onAuth: () => ({
        username: auth.username,
        password: auth.password,
      }),
      onProgress: evt => {
        if (evt.total) {
          process.stdout.write(`\r📤 อัปโหลด: ${evt.phase} (${evt.loaded}/${evt.total})`);
        } else {
          process.stdout.write(`\r📤 อัปโหลด: ${evt.phase} (${evt.loaded})`);
        }
      },
    });

    console.log('\n\n✅ Push ขึ้น GitHub สำเร็จเรียบร้อยแล้ว!');
    console.log('🔗 ตรวจสอบ repository ได้ที่: https://github.com/jadesolju/SedChar\n');
  } catch (err) {
    console.error('\n\n❌ เกิดข้อผิดพลาดในการ Push:', err.message || err);
    console.log('\n💡 ข้อแนะนำ: ตรวจสอบว่า Token มีสิทธิ์เข้าถึง repository "jadesolju/SedChar" และยังไม่หมดอายุ');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getAuthConfig,
  resolveCredentials,
  askQuestion,
};
