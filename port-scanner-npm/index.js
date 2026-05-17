const dns = require("dns");
const net = require("net");
const tls = require("tls");

const DEFAULT_PORTS = [21, 22, 80, 443, 8080, 8443];
const DEFAULT_TIMEOUT = 3000;

function resolveDomain(host) {
  return dns.promises.lookup(host);
}

function scanPort(host, port, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.on("connect", () => {
      socket.destroy();
      resolve({ port, status: "OPEN" });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ port, status: "CLOSED" });
    });

    socket.on("error", () => {
      socket.destroy();
      resolve({ port, status: "CLOSED" });
    });

    socket.connect(port, host);
  });
}

function grabHttpBanner(host, port = 80, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);

    socket.on("connect", () => {
      const request =
        `GET / HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`;
      socket.write(request);
    });

    let response = "";
    socket.on("data", (data) => {
      response += data.toString();
    });

    socket.on("close", () => {
      resolve(response.slice(0, 1000));
    });

    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Timeout"));
    });

    socket.on("error", (err) => {
      reject(err.message);
    });

    socket.connect(port, host);
  });
}

function checkTls(host, port = 443, timeout = DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const socket = tls.connect(port, host, { servername: host }, () => {
      const version = socket.getProtocol();
      socket.end();
      resolve(version);
    });

    socket.setTimeout(timeout);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("Timeout"));
    });
    socket.on("error", (err) => {
      reject(err.message);
    });
  });
}

async function scanPorts(host, ports = DEFAULT_PORTS, timeout = DEFAULT_TIMEOUT) {
  const { address: ip } = await resolveDomain(host);
  const results = [];

  for (const port of ports) {
    const result = await scanPort(host, port, timeout);

    if (result.status === "OPEN") {
      if (port === 80 || port === 8080) {
        try {
          const banner = await grabHttpBanner(host, port, timeout);
          result.banner = banner;
        } catch (e) {
          result.bannerError = e;
        }
      }

      if (port === 443 || port === 8443) {
        try {
          const tlsVersion = await checkTls(host, port, timeout);
          result.tls = tlsVersion;
        } catch (e) {
          result.tlsError = e;
        }
      }

      results.push(result);
    } else {
      results.push(result);
    }
  }

  return { host, ip, results };
}

module.exports = {
  resolveDomain,
  scanPort,
  scanPorts,
  grabHttpBanner,
  checkTls,
  DEFAULT_PORTS,
  DEFAULT_TIMEOUT,
};
