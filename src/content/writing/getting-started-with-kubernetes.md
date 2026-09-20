---
title: "Getting Started with Kubernetes: My First Steps with K8s"
description: "Pods, Deployments, desired state, ConfigMaps, and Services, connected through one small example."
date: 2026-09-20
draft: false
sample: false
tags: [kubernetes, containers, learning-notes]
---

Kubernetes started to make sense to me when I stopped treating it as a long list of commands. The commands are useful, but the idea underneath them is more important: I describe the state I want, and a set of controllers keeps working to make the cluster match it.

This article grew from my own Obsidian notes while learning Kubernetes. I have kept their progression, replaced the original course application with a small Nginx example, and tightened a few informal explanations against the current Kubernetes documentation.

## Why Kubernetes?

A container image gives us a repeatable package for an application. Kubernetes deals with the next set of questions: Where should the container run? What happens if it exits? How do I run several copies? How do other workloads find those copies when individual Pod addresses change?

Kubernetes is an open-source system for deploying, scaling, and managing containerized applications. Instead of manually starting each container, we create API objects such as Deployments, ConfigMaps, and Services that describe what the cluster should maintain.

## Containers, Pods, and Deployments

A **Pod** is Kubernetes’ smallest deployable unit. A Pod can contain one or more containers that share networking and storage resources. In the simple examples here, one Pod wraps one application container, but “Pod” and “container” are not interchangeable concepts.

A **Deployment** manages a set of Pods for a stateless application. More precisely, the Deployment manages a ReplicaSet, and the ReplicaSet maintains the requested number of Pod replicas. That extra layer is what makes replacement and rolling updates possible.

```text
Deployment → ReplicaSet → Pods → containers
```

## Understanding desired state

Desired state is the thread connecting most of the workflow. If a Deployment declares three replicas, the controllers continually compare that declaration with the cluster’s current state. If only two matching Pods exist, the ReplicaSet creates another. If the Deployment’s Pod template changes, the Deployment coordinates a new ReplicaSet and, by default, rolls from the old Pods to the new ones.

This is reconciliation, not a one-time script. I am not asking Kubernetes to “start three containers and forget about them.” I am recording that three replicas should exist.

## Creating a Deployment

This example starts an Nginx web server in a Deployment named `demo-web`:

```bash
kubectl create deployment demo-web \
  --image=nginx:1.27-alpine
```

The command creates a Deployment object. The Deployment creates a ReplicaSet, and the ReplicaSet creates the first Pod. I can inspect each level:

```bash
kubectl get deployments
kubectl get replicasets
kubectl get pods
```

`kubectl get pods` does **not** show Deployments, even though my original notes placed it under “showing deployments.” It shows the Pods that currently exist. For more detail about one object:

```bash
kubectl describe deployment demo-web
kubectl describe pod POD_NAME
```

## Inspecting Pods

Pod names created by a Deployment contain generated suffixes, so I normally list them before choosing one:

```bash
kubectl get pods
kubectl get pods -o wide
```

The wide view includes the Pod IP and the node running it. Each Pod receives an IP on the cluster network. That IP is useful for understanding what exists, but it is not a stable application address: a replacement Pod usually receives a different name and IP.

Logs and container details are often the next useful checks:

```bash
kubectl logs POD_NAME
kubectl get pod POD_NAME -o yaml
```

## Port forwarding for local access

During development, `kubectl port-forward` creates a temporary connection from a local port to a Pod port:

```bash
kubectl port-forward pod/POD_NAME 8080:80
```

The left `8080` is the port on my machine; the right `80` is the port reached in the Pod. While the command is running, I can open `http://localhost:8080`.

This is a debugging and development tunnel. It does not publish the application for other users, and it stops when the command stops. `kubectl port-forward` can also target a Deployment or Service, but it remains a local forwarding session rather than production exposure.

## Editing a Deployment

For a quick interactive change, Kubernetes can open the live object in an editor:

```bash
kubectl edit deployment demo-web
```

The replica count is at `.spec.replicas`, using singular `spec`, not `specs`:

```yaml
spec:
  replicas: 3
```

Saving the edit updates the object in the cluster. The controller then creates or removes Pods until the ReplicaSet has three available replicas.

Interactive editing is useful for learning and emergency inspection, but a checked-in manifest is easier to review and reproduce.

## Applying a YAML manifest

The declarative version records the Deployment in a file:

<p class="filename">web-deployment.yaml</p>

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: demo-web
  template:
    metadata:
      labels:
        app: demo-web
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          ports:
            - containerPort: 80
```

```bash
kubectl apply -f web-deployment.yaml
kubectl rollout status deployment/demo-web
```

The selector and Pod-template labels must agree. They connect the ReplicaSet to the Pods it owns. `kubectl apply` creates the object if it is absent or updates it to match the file if it already exists.

For a real release I would also avoid a floating `latest` tag and use a specific image tag or digest. That makes the desired state say exactly which artifact should run.

## Pod replacement is not a container restart

My first notes said that Pods “renew themselves automatically.” The more accurate explanation depends on what failed.

If the process inside a container exits and the Pod’s restart policy allows it, the **kubelet can restart the container inside the same Pod**. The Pod keeps its identity, although its container restart count increases.

If I delete a Pod owned by a Deployment:

```bash
kubectl delete pod POD_NAME
kubectl get pods --watch
```

the deleted Pod does not come back. Instead, the ReplicaSet notices that the number of matching Pods is below the desired count and creates a **replacement Pod** with a new identity. A Pod is considered relatively disposable; the controller is what restores the declared replica count.

## ConfigMaps and environment variables

A ConfigMap stores non-confidential configuration separately from a container image. It can be consumed as environment variables, command-line arguments, or mounted files. It is not encrypted and should not contain passwords or API keys; sensitive values belong in a Secret and still need careful access control.

Here is a small configuration object for the course application:

<p class="filename">web-config.yaml</p>

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: demo-web-config
data:
  APP_ENV: "development"
  LOG_LEVEL: "info"
```

```bash
kubectl apply -f web-config.yaml
```

The Pod template can import every valid key under `.spec.template.spec.containers[].envFrom`:

```yaml
spec:
  template:
    spec:
      containers:
        - name: web
          image: nginx:1.27-alpine
          envFrom:
            - configMapRef:
                name: demo-web-config
```

Or it can select a single key with `env[].valueFrom.configMapKeyRef`:

```yaml
env:
  - name: APP_ENV
    valueFrom:
      configMapKeyRef:
        name: demo-web-config
        key: APP_ENV
```

ConfigMap values injected as environment variables are read when the container starts. Updating the ConfigMap does not automatically rewrite the environment of an already running container, so the workload needs a new rollout to consume the new values.

## Services and stable networking

Pod IPs change as Pods are replaced. A **Service** selects a set of Pods and gives clients a stable virtual IP and DNS name. For a normal Service with a selector, Kubernetes tracks matching ready Pods through EndpointSlices and directs traffic to them.

<p class="filename">web-service.yaml</p>

```yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: demo-web
  ports:
    - name: http
      port: 80
      targetPort: 80
```

Because no type is specified, this is a `ClusterIP` Service. Port 80 is the Service port, and traffic is sent to port 80 on matching Pods.

```bash
kubectl apply -f web-service.yaml
kubectl get services
kubectl get service web-service -o yaml
kubectl get endpointslices -l kubernetes.io/service-name=web-service
```

`ClusterIP` is reachable inside the cluster by default. It gives internal clients a stable address such as `web-service` in the same namespace, but it does **not** make the application public on the internet. External access needs another deliberate mechanism, such as a Gateway, Ingress with a controller, or a Service type appropriate to the environment.

## Putting the concepts together

The pieces now form one path:

1. A Deployment records the desired Pod template and replica count.
2. Its ReplicaSet keeps that many matching Pods alive.
3. Each Pod runs the application container and receives an internal IP.
4. A ConfigMap supplies non-secret configuration without rebuilding the image.
5. A Service selects the Pods and provides stable in-cluster networking while Pod names and IPs change.
6. `kubectl port-forward` gives me temporary local access while learning or debugging.

Once I saw this as a set of controllers and stable interfaces around replaceable Pods, the commands stopped feeling isolated.

## What I would learn next

This first path leaves several important topics for later: readiness and liveness probes, CPU and memory requests, rollouts and rollbacks, namespaces, Secrets, persistent storage, and the different ways to route external traffic. I would also replace the floating image tag, add probes, and inspect a rollout while changing the Pod template.

## Further reading

- [Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Pods](https://kubernetes.io/docs/concepts/workloads/pods/)
- [Pod lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/)
- [Port forwarding](https://kubernetes.io/docs/tasks/access-application-cluster/port-forward-access-application-cluster/)
- [ConfigMaps](https://kubernetes.io/docs/concepts/configuration/configmap/)
- [Services](https://kubernetes.io/docs/concepts/services-networking/service/)

