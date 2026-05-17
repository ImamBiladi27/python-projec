# 🔍 Port Scanner & Recon Tool

Simple Python-based port scanner untuk keperluan reconnaisance dasar.  
Melakukan scan pada port-port umum serta mengambil informasi HTTP banner dan TLS version.

## 📋 Fitur

- Resolusi domain ke IP (`socket.gethostbyname`)
- Scan port umum: `21`, `22`, `80`, `443`, `8080`, `8443`
- **HTTP Banner Grabbing** — menampilkan response header pada port `80` / `8080`
- **TLS Detection** — mendeteksi versi TLS pada port `443` / `8443`
- **Auto Report** — menyimpan hasil scan ke file `.txt`

## 🚀 Cara Penggunaan

```bash
python test2.py
```

Kemudian masukkan domain atau IP target:

```
Masukkan domain atau IP: example.com
```

### Contoh Output

```
============================================================
Target     : example.com
Resolved IP: 93.184.216.34
Waktu      : 2026-05-17 10:30:00
============================================================

[+] Mengecek port 21...
❌ Port 21 CLOSED

[+] Mengecek port 80...
✅ Port 80 OPEN

--- RESPONSE HEADER ---
HTTP/1.1 200 OK
Content-Type: text/html
...

[+] Mengecek port 443...
✅ Port 443 OPEN
🔐 TLS Version: TLSv1.3
```

## 📁 Output Report

Hasil scan otomatis disimpan ke file `report_{target}.txt`:

```
============================================================
Recon Report
============================================================
Target     : example.com
IP         : 93.184.216.34
Waktu      : 2026-05-17 10:30:00

Port : 80
Status : OPEN
Banner:
HTTP/1.1 200 OK
...
------------------------------------------------------------
```

## ⚙️ Konfigurasi

Semua konfigurasi ada di bagian atas file `test2.py`:

| Variabel   | Default                                    | Deskripsi            |
| ---------- | ------------------------------------------ | -------------------- |
| `ports`    | `[21, 22, 80, 443, 8080, 8443]`           | Port yang discan     |
| `timeout`  | `3`                                        | Timeout per port (s) |

## 🧰 Dependencies

- **Python 3.x** (standard library only)
- Module: `socket`, `ssl`, `datetime`

Tidak perlu install package tambahan.

## 📄 Lisensi

MIT
