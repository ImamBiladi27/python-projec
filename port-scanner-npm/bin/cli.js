#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { scanPorts, DEFAULT_PORTS, DEFAULT_TIMEOUT } = require("../index.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

function formatTime(date) {
  return date.toISOString().replace("T", " ").slice(0, 19);
}

async function main() {
  const target = (await askQuestion("Masukkan domain atau IP: ")).trim();

  if (!target) {
    console.log("Target tidak boleh kosong.");
    rl.close();
    return;
  }

  const startTime = new Date();

  try {
    const result = await scanPorts(target, DEFAULT_PORTS, DEFAULT_TIMEOUT);

    console.log("=".repeat(60));
    console.log(`Target     : ${result.host}`);
    console.log(`Resolved IP: ${result.ip}`);
    console.log(`Waktu      : ${formatTime(startTime)}`);
    console.log("=".repeat(60));

    for (const item of result.results) {
      console.log(`\n[+] Mengecek port ${item.port}...`);

      if (item.status === "OPEN") {
        console.log(`✅ Port ${item.port} OPEN`);

        if (item.banner) {
          console.log("\n--- RESPONSE HEADER ---");
          console.log(item.banner.slice(0, 1000));
        }
        if (item.bannerError) {
          console.log(`⚠️ Gagal ambil HTTP banner: ${item.bannerError}`);
        }
        if (item.tls) {
          console.log(`🔐 TLS Version: ${item.tls}`);
        }
        if (item.tlsError) {
          console.log(`⚠️ HTTPS check gagal: ${item.tlsError}`);
        }
      } else {
        console.log(`❌ Port ${item.port} CLOSED`);
      }
    }

    // Save report
    const safeName = result.host.replace(/\./g, "_");
    const reportName = `report_${safeName}.txt`;
    const lines = [];

    lines.push("=".repeat(60));
    lines.push("Recon Report");
    lines.push("=".repeat(60));
    lines.push(`Target     : ${result.host}`);
    lines.push(`IP         : ${result.ip}`);
    lines.push(`Waktu      : ${formatTime(startTime)}`);
    lines.push("");

    for (const item of result.results) {
      if (item.status !== "OPEN") continue;
      lines.push(`Port   : ${item.port}`);
      lines.push(`Status : ${item.status}`);
      if (item.tls) lines.push(`TLS    : ${item.tls}`);
      if (item.banner) lines.push(`Banner :\n${item.banner}`);
      lines.push("-".repeat(60));
    }

    fs.writeFileSync(reportName, lines.join("\n"), "utf-8");
    console.log("\n" + "=".repeat(60));
    console.log(`✅ Report disimpan: ${reportName}`);
    console.log("=".repeat(60));

  } catch (err) {
    console.log("❌ Error:", err.message);
  }

  rl.close();
}

main();
