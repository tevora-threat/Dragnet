import sys
from shutil import copyfile
import os
import time
import pwd
import grp

uid = pwd.getpwnam("asterisk").pw_uid
gid = grp.getgrnam("asterisk").gr_gid

ts = int(time.time())

attackerNum=sys.argv[1]

targetNum=sys.argv[2]
callerIdName=sys.argv[3]
callerIdNum=sys.argv[4]

print("Calling {}".format(targetNum))

attackID=sys.argv[5]
logUrl=sys.argv[6]
context=sys.argv[7]

#if we were going to use x-lite as attack phone, would use line1 below instead.
#line1="channel: SIP/{}@demo-alice".format(attackerNum)

line1="channel: SIP/{}@voipms".format(attackerNum)
line2="MaxRetries: 0"
line3="RetryTime: 60"
line4="WaitTime: 60"
line5="Context: {}".format(context)
line6="Extension: s"
line7="Callerid: 'DRAGNET' <7777777777>"
line8="Setvar: callNum={}".format(targetNum)
line9="Setvar: callerIdNum={}".format(callerIdNum)
line10="Setvar: callerIdName={}".format(callerIdName)
line11="Setvar: recName={}".format(attackID)
line12="Setvar: callLog={}?attackID={}&status=callingTarget&ts={}".format(logUrl,attackID,ts)
line13="Setvar: endLog={}?attackID={}&status=callEnded&ts={}".format(logUrl,attackID,ts)
line14="Setvar: ts={}".format(ts)
line15=""
lines = [line1, line2, line3, line4,line5, line6,line7, line8, line9, line10, line11, line12,line13,line14,line15]
print(lines)
with open('/root/asterisk/filename.call', 'w+') as f: #TODO
    f.writelines("%s\n" % l for l in lines)


copyfile('/root/asterisk/filename.call', '/root/asterisk/ex1.call') #TODO
path = '/root/asterisk/ex1.call'
os.chown(path, uid, gid)
os.rename('/root/asterisk/ex1.call','/var/spool/asterisk/outgoing/ex1.call') #TODO
os.remove('/root/asterisk/filename.call')