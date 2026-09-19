---
draft: false
sample: false
title: Deep Activity Recognition
repository: https://github.com/Eng-Moaz/Deep-Activity-Recognition
summary: A PyTorch implementation of a hierarchical deep temporal model for group activity recognition on the Volleyball Dataset.
language: Python · PyTorch
order: 1
note: "time, people, context — modeled together"
facts:
  - Implements a progression from image classification to a two-stage hierarchical temporal model.
  - Uses ResNet-50 features, player-level modeling, team pooling, and temporal LSTMs.
  - The repository documents reproducibility seeds, TensorBoard logs, and run metadata.
media:
  - src: /images/projects/deep-activity-recognition/architecture.webp
    alt: Repository architecture diagram showing player features and temporal LSTMs across three volleyball frames
    caption: Architecture diagram from the project repository; original source attribution is retained in the repository.
    kind: diagram
    featured: true
    width: 1200
    height: 551
  - src: /images/projects/deep-activity-recognition/confusion-matrix.webp
    alt: Confusion matrix saved under the baseline b1 checkpoint in the repository
    caption: Repository artifact · baseline b1 confusion matrix. See source for evaluation context.
    kind: diagram
    width: 1000
    height: 800
evidenceStatus: documented
---


## About these artifacts

The architecture image is reproduced from [architecture.png](https://github.com/Eng-Moaz/Deep-Activity-Recognition/blob/master/architecture.png). The saved matrix comes from [checkpoints/b1/confusion_matrix.png](https://github.com/Eng-Moaz/Deep-Activity-Recognition/blob/master/checkpoints/b1/confusion_matrix.png). These are repository artifacts, not new benchmark claims. Refer to the source repository for original attribution, dataset details, and evaluation context.
