#!/usr/bin/env node
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const dir = path.resolve(__dirname, '..');

function getAuthConfig(token, password) {
  return {
    username: token,
    password: password !== undefined ? password : token,
  };
}

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve =>
    rl.question(query, ans => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log('\n🚀 === SedChar.AI GitHub Push Utility ===\n');

  let token = process.argv[2] || process.env.GITHUB_TOKEN;
  if (!token) {
    console.log('💡 คุณสามารถสร้าง GitHub Token (Personal Access Token - Classic หรือ Fine-grained) ได้ที่:');
    console.log('   https://github.com/settings/tokens (ติ๊กเลือกสิทธิ์ "repo")\n');
    token = await askQuestion('🔑 กรุณากรอก GitHub Personal Access Token (PAT): ');
  }

  if (!token) {
    console.error('❌ ไม่พบ Token ยกเลิกการ Push');
    process.exit(1);
  }

  const targetBranch = process.argv[3] || 'preview';
  console.log(`\n⏳ กำลัง Push ไปยัง https://github.com/jadesolju/SedChar.git (branch: ${targetBranch})...`);

  try {
    const pushResult = await git.push({
      fs,
      http,
      dir,
      remote: 'origin',
      ref: targetBranch,
      force: true,
      onAuth: () => getAuthConfig(token),
      onProgress: evt => {
        if (evt.total) {
          process.stdout.write(`\r📤 อัปโหลด: ${evt.phase} (${evt.loaded}/${evt.total})`);
        } else {
          process.stdout.write(`\r📤 อัปโหลด: ${evt.phase} (${evt.loaded})`);
        }
      },
    });

    console.log('\n\n✅ Push ขึ้น GitHub สำเร็จเรียบร้อยแล้ว!');
    console.log(`🔗 ตรวจสอบ repository ได้ที่: https://github.com/jadesolju/SedChar/tree/${targetBranch}\n`);
  } catch (err) {
    console.error('\n\n❌ เกิดข้อผิดพลาดในการ Push:', err.message || err);
    console.log('\n💡 ข้อแนะนำ: ตรวจสอบว่า Token มีสิทธิ์เข้าถึง repository "jadesolju/SedChar" และยังไม่หมดอายุ');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getAuthConfig };
