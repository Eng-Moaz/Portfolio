---
title: Does the extra feature earn its place?
description: A sample ablation study for inspecting the research notebook.
date: 2026-09-16
draft: true
sample: true
question: How would we compare a baseline and one additional feature without changing the evaluation split?
dataset: Synthetic demonstration values; no dataset was evaluated.
model: Baseline regressor and a candidate with one additional feature group.
methodology: Illustrative fixed validation split; MAE and RMSE in minutes, lower is better. No measured run is claimed.
command: python evaluate.py --config configs/ablation.yaml --split validation
project: nyc-taxi-trip-duration
metrics:
  - label: MAE
    baseline: 4.8
    candidate: 4.3
    unit: minutes
  - label: RMSE
    baseline: 7.2
    candidate: 6.9
    unit: minutes
---

## Observation

In this deliberately invented example, the candidate improves both error measures. That is enough to demonstrate the comparison layout, not enough to make a scientific claim. Real results would require an attached run manifest and a defensible evaluation protocol.

## Reproduction checklist

Keep the dataset version, split hash, package lockfile, source revision, feature configuration, and random seeds with the run. The sample command below describes the intended shape of a workflow; it is not executable against the linked project as documented here.

## Next question

Does the improvement persist across repeated splits, and does it justify the additional feature's operational cost?
