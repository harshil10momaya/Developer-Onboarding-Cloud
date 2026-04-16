# AWS Deployment Guide: Developer Onboarding Cloud

This guide provides step-by-step instructions to deploy the entire stack to **AWS EKS** (Kubernetes) with **RDS** (PostgreSQL) and a professional monitoring stack (**Prometheus & Grafana**).

## 📋 Prerequisites

- **AWS CLI** installed and configured: `aws configure`
- **eksctl** (AWS EKS CLI): `brew install eksctl` (macOS) or download for Windows.
- **Docker** installed.
- **Helm** (K8s Package Manager): `brew install helm`

---

## 1. Containerize & Push (ECR)

AWS ECR is used to store your Docker images.

1.  **Create Repositories**:
    ```bash
    aws ecr create-repository --repository-name onboarding/backend
    aws ecr create-repository --repository-name onboarding/frontend
    ```
2.  **Login to ECR**:
    ```bash
    aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
    ```
3.  **Build and Push Backend**:
    ```bash
    docker build -t onboarding/backend:latest ./backend
    docker tag onboarding/backend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/onboarding/backend:latest
    docker push your-account-id.dkr.ecr.your-region.amazonaws.com/onboarding/backend:latest
    ```
4.  **Build and Push Frontend**:
    ```bash
    docker build -f frontend/Dockerfile -t onboarding/frontend:latest .
    docker tag onboarding/frontend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/onboarding/frontend:latest
    docker push your-account-id.dkr.ecr.your-region.amazonaws.com/onboarding/frontend:latest
    ```

---

## 2. Infrastructure Setup (EKS & RDS)

### Create EKS Cluster
Use `eksctl` to create a production-ready cluster:
```bash
eksctl create cluster \
  --name onboarding-cluster \
  --region your-region \
  --nodegroup-name standard-nodes \
  --node-type t3.medium \
  --nodes 3 \
  --with-oidc \
  --managed
```

### Create PostgreSQL (RDS)
1. Go to **AWS RDS Console** -> **Create Database**.
2. Select **PostgreSQL**.
3. Choose **Free Tier** or **Standard Create**.
4. Set Master Username to `postgres` and a strong password.
5. **IMPORTANT**: Ensure it is in the same VPC as your EKS nodes and allow the Security Group of the nodes to access port 5432.

---

## 3. Deploy to Kubernetes

1.  **Apply Namespace**:
    ```bash
    kubectl apply -f kubernetes/namespace.yaml
    ```
2.  **Configure Secrets**:
    Update `kubernetes/postgres-config.yaml` with your RDS credentials (base64 encoded):
    ```bash
    kubectl apply -f kubernetes/postgres-config.yaml
    ```
3.  **Deploy Redis & Apps**:
    Update the `image` field in `backend-deployment.yaml` and `frontend-deployment.yaml` with your ECR URIs.
    ```bash
    kubectl apply -f kubernetes/redis.yaml
    kubectl apply -f kubernetes/backend-service.yaml
    kubectl apply -f kubernetes/backend-deployment.yaml
    kubectl apply -f kubernetes/frontend-service.yaml
    kubectl apply -f kubernetes/frontend-deployment.yaml
    ```
4.  **Deploy Ingress**:
    *First install Nginx Ingress Controller:*
    ```bash
    helm upgrade --install ingress-nginx ingress-nginx \
      --repo https://kubernetes.github.io/ingress-nginx \
      --namespace ingress-nginx --create-namespace
    ```
    *Then apply manifest:*
    ```bash
    kubectl apply -f kubernetes/ingress.yaml
    ```

---

## 4. Monitoring (Prometheus & Grafana)

We use the industry-standard `kube-prometheus-stack` Helm chart.

1.  **Install stack**:
    ```bash
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install monitoring prometheus-community/kube-prometheus-stack --namespace monitoring --create-namespace
    ```
2.  **Access Grafana**:
    ```bash
    kubectl port-forward deployment/monitoring-grafana 3000:3000 -n monitoring
    ```
3.  **Add Dashboard**:
    - Login (default: `admin` / `prom-operator`).
    - Import Dashboard ID `16101` (FastAPI / Gunicorn Dashboard) or create custom panels to scrape `/metrics`.

---

## 🚀 Post-Deployment Check
Run `kubectl get pods -n onboarding-cloud` to ensure all pods are running.
Get your Load Balancer URL: `kubectl get ingress -n onboarding-cloud`.
