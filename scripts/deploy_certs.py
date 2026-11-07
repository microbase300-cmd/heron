#!/usr/bin/env python3
"""
Deploy web/dist and dashboard/dist to VPS (68.168.211.36)
Strictly preserving /var/www/heron/backend/data/db.json
"""

import os
import tarfile
import paramiko
import json

HOST = "68.168.211.36"
USER = "root"
PASS = "bSYsY*7W"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
tar_path = os.path.join(BASE_DIR, "deploy_cert.tar.gz")

print("1. Creating local tar archive of web/dist and dashboard/dist...")
with tarfile.open(tar_path, "w:gz") as tar:
    tar.add(os.path.join(BASE_DIR, "web", "dist"), arcname="web_dist")
    tar.add(os.path.join(BASE_DIR, "dashboard", "dist"), arcname="dashboard_dist")
print(f"Archive created: {tar_path} ({os.path.getsize(tar_path):,} bytes)")

print("2. Connecting to VPS...")
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(HOST, username=USER, password=PASS)

# Check db before deployment
_, out, _ = ssh.exec_command("cat /var/www/heron/backend/data/db.json")
db_pre = json.loads(out.read().decode("utf-8"))
pre_users = len(db_pre["users"])
pre_txs = len(db_pre.get("transactions", []))
print(f"Pre-deploy check: {pre_users} users, {pre_txs} transactions.")

print("3. Uploading archive via SFTP...")
sftp = ssh.open_sftp()
sftp.put(tar_path, "/tmp/deploy_cert.tar.gz")
sftp.close()
print("Upload complete.")

print("4. Extracting builds and updating git on VPS...")
cmd = """
cd /tmp && tar -xzf /tmp/deploy_cert.tar.gz
rm -rf /var/www/heron/web/dist/*
cp -r /tmp/web_dist/* /var/www/heron/web/dist/
rm -rf /var/www/heron/dashboard/dist/*
cp -r /tmp/dashboard_dist/* /var/www/heron/dashboard/dist/
rm -rf /tmp/web_dist /tmp/dashboard_dist /tmp/deploy_cert.tar.gz

cd /var/www/heron
git stash
git pull origin heron-assets

systemctl reload nginx
"""
stdin, stdout, stderr = ssh.exec_command(cmd)
print(stdout.read().decode("utf-8", errors="ignore"))

print("5. Post-deploy verification...")
_, out, _ = ssh.exec_command("cat /var/www/heron/backend/data/db.json")
db_post = json.loads(out.read().decode("utf-8"))
post_users = len(db_post["users"])
post_txs = len(db_post.get("transactions", []))
print(f"Post-deploy check: {post_users} users, {post_txs} transactions.")
assert post_users == pre_users, f"CRITICAL ERROR: User count mismatch: {pre_users} vs {post_users}"

print("6. Verifying live HTTP responses...")
_, out, _ = ssh.exec_command("""
curl -s -o /dev/null -w "%{http_code}" https://heronassetstrusteess.com/certificate.html
echo " - certificate.html"
curl -s -o /dev/null -w "%{http_code}" https://heronassetstrusteess.com/heron_certificate_of_incorporation.png
echo " - certificate.png"
curl -s -o /dev/null -w "%{http_code}" https://heronassetstrusteess.com/heron_certificate_of_incorporation.pdf
echo " - certificate.pdf"
curl -s -o /dev/null -w "%{http_code}" https://app.heronassetstrusteess.com/heron_certificate_of_incorporation.png
echo " - dashboard certificate.png"
""")
print(out.read().decode("utf-8", errors="ignore"))

ssh.close()

if os.path.exists(tar_path):
    os.remove(tar_path)
print("Deployment completed successfully!")
