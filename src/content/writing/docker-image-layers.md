---
title: "Understanding Docker image layers"
description: "A filesystem with a memory: what changes, what stays, and why order matters."
date: 2026-09-18
draft: true
sample: true
tags: [engineering, sample]
---

## An image is a sequence of decisions

A container image is easier to reason about when we stop imagining it as a tiny virtual machine. Its filesystem is assembled from layers. Each layer records changes relative to what came before; the running container adds its own writable layer on top.

This sample essay is a reading-layout demonstration. The examples are deliberately small, and do not describe a production deployment by Moaz.

## Put stable work first

When a build step changes, later steps may need to run again. Copying dependency declarations before application code gives the dependency installation step a chance to reuse its cache when only the application changes.

<p class="filename">Dockerfile</p>

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src/
CMD ["python", "-m", "src.main"]
```

The order communicates intent: choose a runtime, resolve dependencies, then add the frequently changing source. For a reproducible build, pin dependencies and record the base image digest too.

> A cache is an optimization. It should never be the only record of how an artifact was built.

## Look at what changed

The following commands inspect image history and disk usage. Read the output alongside the Dockerfile; one line of build instructions does not always mean one new filesystem layer.

```bash
docker image history notebook-demo:local
docker system df
```

<div class="table-scroll">

| Change | Likely effect | What to check |
| --- | --- | --- |
| Edit application code | Rebuild source step | Dependency layer reused |
| Change requirements | Reinstall dependencies | Locked versions |
| Change base image | Re-evaluate downstream steps | Runtime compatibility |

</div>

## Deleting is not erasing

Deleting a file in a later layer hides it from the final filesystem view. It does not remove the bytes from an earlier layer. This matters for image size, and it is one reason credentials should never be copied into build layers.

<div class="callout"><strong>A useful boundary.</strong> Build secrets belong in dedicated build-secret mechanisms, not in committed files or image environment variables.</div>

<figure><img src="/images/projects/chirpy/study.svg" alt="Illustrative terminal sketch showing a request passing through authentication to a handler" width="1200" height="800" loading="lazy"/><figcaption>Original notebook illustration, used here to inspect article images and captions. Not a Docker output or project screenshot.</figcaption></figure>

## A smaller final artifact

A multi-stage build separates the environment needed to compile something from the environment needed to run it. That separation is more useful than treating small image size as an end in itself. The final image should contain what the program actually needs, with a clear update path.

### A question to keep nearby

If the cache disappeared tomorrow, could someone rebuild the same artifact from the repository and its recorded inputs? That is a better finishing question than “did it build on my laptop?”

## Further reading

See the [Docker build cache documentation](https://docs.docker.com/build/cache/) and [multi-stage build guide](https://docs.docker.com/build/building/multi-stage/).
