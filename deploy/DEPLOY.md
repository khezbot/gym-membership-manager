# Manual deployment to the university EC2 instance

Follows the IFQ636 activity "Cloud environment setup and application deployment". CI/CD is not used; every step is run by hand over SSH.

## 1. Instance (AWS console)
1. Sign in through the QUT AWS portal → account **OES-LT5-STUDENT** → EC2 → region **Asia Pacific (Sydney)**.
2. Launch instance: **Ubuntu Server 24.04 LTS**, **t2.micro**, new key pair (`.pem` Mac / `.ppk` Windows — keep it out of the repo).
3. Network settings → Edit → subnet **PublicSubnet1** or **PublicSubnet2**, select up to 5 of the provided security groups (AWS allows max 5 per instance).
4. Advanced details → IAM instance profile **IFQ636-EC2-Role** → Launch.
5. Note the **instance ID**, then name it, e.g. `STUDENTID-gym-membership`.
6. Security group → Edit inbound rules: **SSH 22 → My IP**, **HTTP 80 → Anywhere (0.0.0.0/0)**. Do **not** open 5001 or 3000.

## 2. Connect
```bash
chmod 400 mykey.pem
ssh -i mykey.pem ubuntu@PUBLIC_IP
```

## 3. Install software (once)
```bash
# t2.micro has 1 GB RAM: add 1 GB swap so the React build doesn't run out of memory
sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

sudo apt-get update
sudo apt-get install -y nginx curl git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2
```

## 4. Get the code and configure secrets
```bash
git clone https://github.com/khezbot/gym-membership-manager.git ~/gym && cd ~/gym
cd backend && npm ci
nano .env        # paste MONGO_URI, JWT_SECRET, PORT=5001, ADMIN_* (never commit this file)
npm run seed     # first deploy only
```
In MongoDB Atlas → Network Access, allow the instance's public IP (or 0.0.0.0/0 for the marking window).

## 5. Start the backend and frontend with pm2
```bash
pm2 start "npm run start" --name backend         # from backend/
cd ../frontend && npm ci && npm run build
pm2 serve build/ 3000 --name frontend --spa
pm2 save && pm2 startup                          # run the command pm2 prints, so apps restart on reboot
pm2 status
```

## 6. Nginx
```bash
sudo cp ~/gym/deploy/nginx-default.conf /etc/nginx/sites-available/default
sudo nginx -t && sudo service nginx restart
```

## 7. Verify
- `curl http://localhost/api/health` → `{"status":"ok"}`
- Browser: `http://PUBLIC_IP/` → log in as admin and as a member, run the join-a-plan workflow.

## Updating after a change
```bash
cd ~/gym && git pull
cd backend && npm ci && pm2 restart backend
cd ../frontend && npm ci && npm run build && pm2 restart frontend
```

## Troubleshooting
- `502 Bad Gateway` → `pm2 status` / `pm2 logs backend`.
- `MongoDB connection error` → check `MONGO_URI` and the Atlas IP allow-list.
- Page loads but login fails → check `/api/health` through Nginx; confirm the `/api/` block is in the Nginx config.
- Public IP changes if the instance is stopped and started; update the README and report.
