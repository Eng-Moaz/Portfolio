---
caseStudy: true
draft: false
sample: false
title: NYC Taxi Trip Duration
repository: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration
summary: My first practical machine-learning project, and my first attempt to move an experiment beyond notebooks into reusable Python code.
language: Python · ML
order: 2
note: "a city reduced to routes, time, and uncertainty"
facts:
  - Builds time, distance, passenger, and interaction features before regression.
  - Compares linear baselines, Random Forest, XGBoost, LightGBM, and CatBoost.
  - Includes a CLI training pipeline and checked-in result files, with an important target-leakage limitation documented in the case study.
evidenceStatus: documented
media: []
---

## The problem

The task is to predict how long a New York City taxi trip will take from historical trip records. Each row provides information available around pickup time, including coordinates, pickup timestamp, passenger count, and vendor metadata. The training data provides the observed duration. It is a regression problem, but it is also a useful exercise in deciding what the raw columns mean and how to turn them into stable model inputs.

This was my introduction to practical machine learning. Just as importantly, it was my first attempt to move beyond a notebook-only workflow. The repository at revision [`8d87bc8`][revision] retains notebooks for exploration, but it also separates preprocessing and modeling into Python modules and exposes the training pipeline through command-line arguments.

## Understanding and preparing the data

The preprocessing module parses the pickup timestamp into hour, weekday, month, weekend, peak-hour, and time-of-day features. It computes great-circle distance from the pickup and drop-off coordinates with the Haversine formula, encodes categorical fields, removes selected outliers, and creates interaction terms such as distance by hour. The target is transformed with `log1p`, so the model learns `log(1 + trip_duration)` rather than raw seconds. [Preprocessing source][preprocessing]

```python
df["trip_duration_transformed"] = np.log1p(df["trip_duration"])
df.drop(
    columns=["pickup_datetime", "trip_duration", "id"],
    inplace=True,
    errors="ignore",
)
```

The log transformation compresses the long right tail common in duration data. It also changes how metrics must be read: MAE and RMSE calculated on this target are errors in log space, not seconds. To report an intuitive duration error, predictions and targets would first need to be transformed back with `expm1`, then evaluated on the original scale.

## Training and comparing models

The modeling pipeline evaluates Linear Regression, Ridge, Lasso, and a default Random Forest as baselines on sample splits. It then compares XGBoost, LightGBM, and CatBoost candidates. Model selection takes the highest validation R², refits that model on the combined training and validation data, serializes it with Joblib, and evaluates the held-out test split. [Modeling source][modeling]

```bash
python -m src.modeling \
  --train data/raw/split/train.csv \
  --val data/raw/split/val.csv \
  --train_sample data/raw/split_sample/train.csv \
  --val_sample data/raw/split_sample/val.csv \
  --test data/raw/split/test.csv
```

The repository contains result JSON showing CatBoost selected from the candidate comparison and a test R² of about 0.999. Those values are real checked-in artifacts, but they are **not reliable evidence of predictive performance** because the current feature pipeline leaks the target. [Candidate results][candidate-results] · [Test results][test-results]

## A critical evaluation finding: target leakage

`add_haversine_and_speed` calculates speed like this:

```python
df["speed_km_h"] = (
    df["haversine_distance"] / (df["trip_duration"] / 3600)
)
```

`trip_duration` is the value the model is supposed to predict. The function then keeps `speed_km_h` and several speed-derived interactions after dropping the original duration column. This gives the model information derived directly from the answer. It explains why the tree models can achieve extremely high checked-in validation and test scores, and it means those scores should not be compared with honest duration-prediction results.

There is a second reproducibility concern: `preprocess` computes percentile thresholds independently for each split, and any future scaling or learned encoding should be fitted on training data only and then applied unchanged to validation and test data. A stronger next version would package feature construction in a fitted scikit-learn pipeline, remove every target-derived feature, preserve the preprocessing object beside the model, and rerun all comparisons.

This finding does not erase the value of the project. It is part of learning practical ML: a model can produce excellent numbers for the wrong reason, and inspecting the data path matters as much as selecting an algorithm.

## Moving beyond notebooks

The most important transition for me was organizational. The notebooks remain useful for exploration, but `src/preprocessing.py` gives feature logic named functions and `src/modeling.py` gives training a repeatable entry point. Results are written into baseline, candidate, and final directories instead of surviving only as notebook cells. [Repository structure][repository]

That structure creates useful seams:

- preprocessing can be reviewed separately from model choice;
- the same CLI can point at different data split files;
- metrics are serialized as JSON;
- the selected estimator is saved as an artifact;
- errors such as target leakage become visible in ordinary source review.

The project is not yet a fully reproducible package. The raw data and split-generation process are not included, and preprocessing is not serialized with the model. Even so, it marks the point where I started treating ML code as software rather than only an experiment in a notebook.

## Challenges and engineering decisions

The repository reflects several real modeling decisions: using geospatial distance instead of raw coordinates alone, making time periodicity and peak hours explicit, log-transforming a skewed target, keeping simple linear baselines, and comparing them with tree ensembles. It also shows why evaluation design deserves its own section rather than a score table with no context.

For the next iteration I would:

1. remove `speed_km_h` and every feature derived from duration;
2. recreate and version the train/validation/test split procedure;
3. fit preprocessing only on training data;
4. report MAE and RMSE in seconds after inverse-transforming predictions;
5. compare against a simple median-duration baseline;
6. save the entire preprocessing-and-model pipeline together.

These are proposed corrections, not results from a rerun.

## What I learned

This project introduced me to the full shape of an ML problem: understanding columns, preparing data, choosing a target transformation, building baselines, comparing candidate models, and holding out a final test set. It also taught me something I now consider more important than the headline metric: a score is only meaningful when I can explain exactly what information reached the model and on what scale the error was measured.

Moving preprocessing and training into source files was the beginning of thinking about repeatability, interfaces, and artifacts. The current leakage issue gives that lesson a concrete edge. Conventional project structure makes a workflow easier to run, and it also makes assumptions easier to inspect and improve.

> **Author question before the next revision:** What made you decide this was the project to move out of notebooks, and which refactor first made the workflow feel like “software” to you?

## Sources and scope

This article describes revision [`8d87bc8`][revision]. The learning context comes from my own account. The metrics are repository artifacts and are deliberately not presented as valid benchmark results because of the documented leakage. No new model was trained for this article.

[revision]: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration/tree/8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309
[repository]: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration/tree/8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309
[preprocessing]: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration/blob/8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309/src/preprocessing.py
[modeling]: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration/blob/8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309/src/modeling.py
[candidate-results]: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration/blob/8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309/results/candidates/candidate_results.json
[test-results]: https://github.com/Eng-Moaz/NYC-Taxi-Trip-Duration/blob/8d87bc8c479dcb8cec075f3a5f7f8eaf158b2309/results/final/testing_results.json
