"""
Simple Port Scanner & Recon Tool
=================================

Melakukan scan port pada target domain/IP dan menampilkan informasi
dasar seperti HTTP response header dan TLS version.

Fitur:
    - Resolusi domain ke IP
    - Scan port umum (21, 22, 80, 443, 8080, 8443)
    - HTTP banner grab pada port 80/8080
    - TLS version detection pada port 443/8443
    - Report otomatis (.txt)

Contoh penggunaan:
    $ python test2.py
    Masukkan domain atau IP: example.com

Dependencies:
    - Standard library: socket, ssl, datetime
"""

import socket
import ssl
from datetime import datetime

# =========================
# CONFIG
# =========================
target = input("Masukkan domain atau IP: ").strip()

ports = [21, 22, 80, 443, 8080, 8443]

timeout = 3

# =========================
# RESOLVE DOMAIN
# =========================
try:
    ip = socket.gethostbyname(target)
except socket.gaierror:
    print("❌ Domain/IP tidak valid")
    exit()

print("=" * 60)
print(f"Target     : {target}")
print(f"Resolved IP: {ip}")
print(f"Waktu      : {datetime.now()}")
print("=" * 60)

results = []

# =========================
# SCAN PORT
# =========================
for port in ports:

    print(f"\n[+] Mengecek port {port}...")

    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(timeout)

    try:
        result = s.connect_ex((ip, port))

        if result == 0:

            print(f"✅ Port {port} OPEN")

            port_info = {
                "port": port,
                "status": "OPEN"
            }

            # =========================
            # HTTP BANNER
            # =========================
            if port in [80, 8080]:

                try:
                    request = (
                        f"GET / HTTP/1.1\r\n"
                        f"Host: {target}\r\n"
                        f"Connection: close\r\n\r\n"
                    )

                    s.send(request.encode())

                    response = s.recv(4096)

                    decoded = response.decode(errors="ignore")

                    print("\n--- RESPONSE HEADER ---")

                    header_lines = decoded.split("\r\n")

                    for line in header_lines[:15]:
                        print(line)

                    port_info["banner"] = decoded[:1000]

                except Exception as e:
                    print(f"⚠️ Gagal ambil HTTP banner: {e}")

            # =========================
            # HTTPS TLS INFO
            # =========================
            elif port in [443, 8443]:

                try:
                    context = ssl.create_default_context()

                    with socket.create_connection((target, port)) as sock:
                        with context.wrap_socket(
                            sock,
                            server_hostname=target
                        ) as ssock:

                            tls_version = ssock.version()

                            print(f"🔐 TLS Version: {tls_version}")

                            port_info["tls"] = tls_version

                except Exception as e:
                    print(f"⚠️ HTTPS check gagal: {e}")

            results.append(port_info)

        else:
            print(f"❌ Port {port} CLOSED")

    except Exception as e:
        print(f"⚠️ Error: {e}")

    finally:
        s.close()

# =========================
# SAVE REPORT
# =========================
report_name = f"report_{target.replace('.', '_')}.txt"

with open(report_name, "w", encoding="utf-8") as f:

    f.write("=" * 60 + "\n")
    f.write(f"Recon Report\n")
    f.write("=" * 60 + "\n")

    f.write(f"Target     : {target}\n")
    f.write(f"IP         : {ip}\n")
    f.write(f"Waktu      : {datetime.now()}\n\n")

    for item in results:

        f.write(f"Port : {item['port']}\n")
        f.write(f"Status : {item['status']}\n")

        if "tls" in item:
            f.write(f"TLS : {item['tls']}\n")

        if "banner" in item:
            f.write(f"Banner:\n{item['banner']}\n")

        f.write("-" * 60 + "\n")

print("\n" + "=" * 60)
print(f"✅ Report disimpan: {report_name}")
print("=" * 60)
