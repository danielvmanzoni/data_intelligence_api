#!/bin/bash

# Script para deploy da API de Tickets no Kubernetes

set -e

echo "🚀 Iniciando deploy da API de Tickets no Kubernetes..."

# Verificar se kubectl está instalado
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl não está instalado. Instale kubectl primeiro."
    exit 1
fi

# Verificar se docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instale Docker primeiro."
    exit 1
fi

# Construir a imagem Docker
echo "📦 Construindo imagem Docker..."
docker build -t tickets-api:latest .

# Se usando um registry, envie a imagem
# docker tag tickets-api:latest your-registry/tickets-api:latest
# docker push your-registry/tickets-api:latest

# Aplicar configurações do Kubernetes
echo "📋 Aplicando namespace..."
kubectl apply -f k8s/namespace.yaml

echo "📋 Aplicando ConfigMaps..."
kubectl apply -f k8s/configmap.yaml

echo "🔐 Aplicando Secrets..."
kubectl apply -f k8s/secrets.yaml

echo "🗄️ Aplicando PostgreSQL..."
kubectl apply -f k8s/postgres-deployment.yaml

echo "⚡ Aplicando API..."
kubectl apply -f k8s/api-deployment.yaml

# Aguardar os pods ficarem prontos
echo "⏳ Aguardando pods ficarem prontos..."
kubectl wait --for=condition=ready pod -l app=postgres -n tickets-system --timeout=300s
kubectl wait --for=condition=ready pod -l app=tickets-api -n tickets-system --timeout=300s

# Mostrar status
echo "📊 Status dos deployments:"
kubectl get deployments -n tickets-system

echo "📊 Status dos pods:"
kubectl get pods -n tickets-system

echo "📊 Status dos services:"
kubectl get services -n tickets-system

# Fazer port-forward para acesso local (opcional)
echo ""
echo "✅ Deploy concluído!"
echo ""
echo "Para acessar a API localmente, execute:"
echo "kubectl port-forward -n tickets-system service/tickets-api-service 3010:3010"
echo ""
echo "Então acesse: http://localhost:3010/docs" 