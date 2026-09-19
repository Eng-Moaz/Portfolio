---
title: "A seed is not an experiment"
description: "Keeping the data, environment, and evaluation attached to the result."
date: 2026-09-17
draft: true
sample: true
tags: [engineering, sample]
---

## Start with the question

Before choosing a model, write down what the experiment will tell you. “Does this feature help?” needs an evaluation split, a baseline, and a decision rule. Without them, a better score can mean almost anything.

This is sample editorial content for reviewing the notebook design, not a published article or a report of Moaz's work.

## Freeze the inputs

Record dataset versions and the exact split manifest. A random seed only explains the random choices made by a particular implementation in a particular environment. It does not name the data that was read.

```python
from pathlib import Path
import hashlib

def fingerprint(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

print(fingerprint(Path("splits/validation.csv")))
```

## Keep a run manifest

A run directory should carry enough information to explain the result when the original terminal is long gone.

| Artifact | Question it answers |
| --- | --- |
| Configuration | What was requested? |
| Split hashes | Which examples were evaluated? |
| Environment lock | Which software was used? |
| Source revision | Which implementation ran? |

> Reproducibility is an explanation that survives the person who remembers the experiment.

## Compare like with like

Keep the evaluation protocol fixed while changing one meaningful variable. If both the preprocessing and the validation split change, a difference in score cannot isolate the effect of a new model.

<div class="callout">Keep the held-out test set outside the model-selection loop. Repeatedly choosing configurations using test scores makes the test set part of training decisions.</div>

## Leave a trail

```bash
python train.py --config configs/baseline.yaml --seed 42
python evaluate.py --run runs/baseline --split validation
```

These commands illustrate a workflow; they are not claims about a particular repository's CLI. A real entry should link to the exact configuration, source revision, and data instructions required to run it.

## What remains uncertain

A single seeded run does not characterize variation across seeds or hardware. Document that limit. If variation could change the conclusion, run a suitable repeated evaluation and report its distribution rather than selecting the best run.
