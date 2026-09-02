# Complete End-to-End Deployment Guide: Azure VM to Huawei Cloud CCE

This guide walks you through containerizing the Personal Infrastructure Dashboard on an **Ubuntu Azure VM**, pushing the multi-service images to **Docker Hub**, and deploying the entire microservices stack onto **Huawei Cloud Cloud Container Engine (CCE)**.

---

## Architecture Overview

```
[ Local / Git Repo ]
        │
        ▼ (git pull / scp)
┌─────────────────────────────────────────┐
│       Azure VM (Ubuntu 22.04 LTS)       │
│  - Docker Engine                        │
│  - Builds 5 Microservice Images         │
└───────────────────┬─────────────────────┘
                    │
                    ▼ (docker push)
┌─────────────────────────────────────────┐
│        Docker Hub (Public Repo)         │
│  - <username>/infra-history-service     │
│  - <username>/infra-alert-service       │
│  - <username>/infra-notifier            │
│  - <username>/infra-collector-service   │
│  - <username>/infra-frontend            │
└───────────────────┬─────────────────────┘
                    │
                    ▼ (docker pull via CCE Nodes)
┌─────────────────────────────────────────────────────────┐
│              Huawei Cloud CCE (Kubernetes)              │
│  Namespace: infra-dashboard                             │
│  ├─ Postgres (DB)                                       │
│  ├─ history-service (Port 4000)                         │
│  ├─ alert-service   (Port 5000)                         │
│  ├─ notifier        (Port 5050)                         │
│  ├─ collector-service                                   │
│  └─ frontend        (Port 80) ──> LoadBalancer (EIP)    │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

1. **Azure Account** with an active Ubuntu 22.04 LTS Virtual Machine (with Public IP and SSH access).
2. **Docker Hub Account** ([hub.docker.com](https://hub.docker.com)) to host the public container images.
3. **Huawei Cloud Account** with permissions to create a **CCE Cluster**, **VPC**, and **Elastic IP (EIP)**.

---

## Step 1: Set Up the Azure VM (Ubuntu)

### 1.1 SSH into your Azure VM
From your local terminal:
```bash
ssh azureuser@<AZURE_VM_PUBLIC_IP>
```

### 1.2 Update system packages and install Docker & Git
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io git curl
```

### 1.3 Configure Docker permissions (run without `sudo`)
```bash
sudo usermod -aG docker $USER
newgrp docker
```
Verify Docker installation:
```bash
docker --version
```

### 1.4 Log in to Docker Hub
```bash
docker login -u <YOUR_DOCKERHUB_USERNAME>
```
*(Enter your Docker Hub password or Personal Access Token when prompted)*.

---

## Step 2: Clone Code & Build Docker Images on Azure VM

### 2.1 Clone or transfer the codebase
```bash
git clone <YOUR_GIT_REPOSITORY_URL> infra-dashboard
cd infra-dashboard
```

### 2.2 Verify directory structure
Make sure the following directories and files are present:
```
infra-dashboard/
├── build-and-push.sh
├── cce-k8s/
│   └── all-in-one.yaml
└── services/
    ├── alert-service/
    ├── collector-service/
    ├── frontend/
    ├── history-service/
    └── notifier/
```

### 2.3 Build and push all images to Docker Hub
Make the build script executable and run it with your Docker Hub username:
```bash
chmod +x build-and-push.sh
./build-and-push.sh markvalerio4992
```

*(This automatically builds and pushes the 5 container images: `infra-history-service`, `infra-alert-service`, `infra-notifier`, `infra-collector-service`, and `infra-frontend`).*

---

## Step 3: Set Up Huawei Cloud CCE Cluster

### 3.1 Create a VPC and Subnet
1. Open the **Huawei Cloud Management Console**.
2. Go to **Virtual Private Cloud (VPC)** → **Create VPC**.
3. Name: `vpc-dashboard` (CIDR: `192.168.0.0/16`), Subnet: `subnet-dashboard` (`192.168.1.0/24`).

### 3.2 Create the CCE Cluster
1. Navigate to **Cloud Container Engine (CCE)** → **Create Cluster**.
2. Select **Standard Cluster** (or Turbo).
3. **Cluster Name**: `cce-infra-cluster`.
4. **Network**: Select `vpc-dashboard` and `subnet-dashboard`.
5. **Node Specification**: 
   - OS: EulerOS or Ubuntu.
   - Flavors: `c7.large.2` or `s6.large.2` (2 vCPUs, 4GB RAM).
   - Capacity: 1 or 2 nodes.
6. **EIP / Internet Access**: 
   - **Crucial**: Ensure the worker nodes have an Elastic IP (EIP) or a NAT Gateway attached to their subnet so they can pull images from Docker Hub.
7. Click **Next** → **Submit** and wait ~5 minutes for the cluster to become `Running`.

---

## Step 4: Configure `kubectl` to Manage CCE

### 4.1 Download `kubeconfig.json`
1. In the Huawei Cloud Console, go to **CCE** → **Clusters** → Click `cce-infra-cluster`.
2. In the **Cluster Information** panel, click **Kubectl** under Connection Information.
3. Download the `kubeconfig.json` credential file.

### 4.2 Set up `kubectl` on your machine or Azure VM
If running from your Azure VM:
```bash
# 1. Install kubectl
sudo apt install -y apt-transport-https ca-certificates curl
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | sudo tee /etc/apt/sources.list.d/kubernetes.list
sudo apt update && sudo apt install -y kubectl

# 2. Configure kubeconfig
mkdir -p ~/.kube
# Copy the contents of kubeconfig.json into ~/.kube/config
nano ~/.kube/config

# 3. Test connection
kubectl get nodes
```

---

## Step 5: Deploy to Huawei Cloud CCE

### 5.1 Update image references with your Docker Hub username
In the `infra-dashboard` directory on your machine/VM, replace `<YOUR_DOCKERHUB_USERNAME>` in `cce-k8s/all-in-one.yaml`:

```bash
sed -i 's/<YOUR_DOCKERHUB_USERNAME>/<YOUR_ACTUAL_DOCKERHUB_USER>/g' cce-k8s/all-in-one.yaml
```

### 5.2 (Optional) Update Database & Encryption Secrets
Open `cce-k8s/all-in-one.yaml` and modify the `dashboard-secrets` section if you wish to set a custom AES encryption key or external PostgreSQL instance:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dashboard-secrets
  namespace: infra-dashboard
type: Opaque
stringData:
  DATABASE_URL: "postgresql://postgres:postgrespassword@postgres-service:5432/infradb?schema=public"
  ENCRYPTION_KEY: "your_64_character_hex_encryption_key"
```

### 5.3 Apply the Kubernetes manifests to CCE
```bash
kubectl apply -f cce-k8s/all-in-one.yaml
```

---

## Step 6: Verification & Accessing the Dashboard

### 6.1 Check Pod Status
```bash
kubectl get pods -n infra-dashboard
```
Output should show all pods in `Running` status:
```
NAME                                 READY   STATUS    RESTARTS   AGE
alert-service-596dfd6756-x7g2k       1/1     Running   0          45s
collector-service-75b5b48bc4-9mpxk   1/1     Running   0          45s
frontend-65487779d7-8q8r9            1/1     Running   0          45s
history-service-67bc9cb4f8-p2lkf     1/1     Running   0          45s
notifier-57bfb7b648-z4vjl            1/1     Running   0          45s
postgres-648b8cf589-k9vsd            1/1     Running   0          45s
```

### 6.2 Get the Public LoadBalancer IP
```bash
kubectl get svc frontend-service -n infra-dashboard
```
Look for the `EXTERNAL-IP` column:
```
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP     PORT(S)        AGE
frontend-service   LoadBalancer   10.247.18.230   119.8.x.x       80:31234/TCP   1m
```

### 6.3 Open the Dashboard
Open your browser and navigate to:
```
http://<EXTERNAL-IP>
```

You can now:
1. Click **☁️ Manage Cloud Accounts** in the top right.
2. Enter your AK/SK credentials for AWS, Huawei Cloud, or Azure.
3. The dashboard will automatically encrypt secrets with AES-256 and begin polling real cloud metrics!

---

## Useful Operational Commands

### View Logs of a Service
```bash
# History Service logs
kubectl logs -n infra-dashboard -l app=history-service -f

# Collector Service logs
kubectl logs -n infra-dashboard -l app=collector-service -f

# Alert Service logs
kubectl logs -n infra-dashboard -l app=alert-service -f
```

### Restart a Service (Rolling restart after image update)
```bash
kubectl rollout restart deployment/collector-service -n infra-dashboard
kubectl rollout restart deployment/frontend -n infra-dashboard
```

### Teardown / Cleanup
```bash
kubectl delete -f cce-k8s/all-in-one.yaml
```
