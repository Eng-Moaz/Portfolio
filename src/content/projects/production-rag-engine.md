---
caseStudy: true
draft: false
sample: false
title: Production RAG Engine
repository: https://github.com/Eng-Moaz/rag-search-engine
summary: A movie search engine that builds keyword, semantic, hybrid, reranked, multimodal, and retrieval-augmented search from the underlying pieces.
language: Python · Information Retrieval · RAG
order: 4
note: "search first, generation second"
facts:
  - Implements a stemmed inverted index, TF-IDF utilities, and BM25 ranking from Python data structures.
  - Combines BM25 with chunk-level MiniLM semantic search through weighted fusion and Reciprocal Rank Fusion.
  - Adds query enhancement, three reranking approaches, golden-set retrieval evaluation, cited RAG answers, and image-based search.
evidenceStatus: documented
media: []
---

## The problem

This project asks a practical search question: given a movie catalogue and a natural-language request, how do I retrieve useful results before asking a language model to answer?

That order matters. Retrieval-augmented generation is only as useful as the documents placed in the prompt. If the search layer misses the right movie or ranks a weak match first, fluent generation cannot repair the missing evidence. The repository therefore grows from keyword retrieval into semantic and hybrid search before adding generation.

The project began through Boot.dev and became a detailed way for me to work through the parts of search instead of treating RAG as one library call. Revision [`0028b2d`][revision] is a command-line learning system over a movie dataset. It is not presented here as a deployed production service.

## Starting with keyword search

The first layer is a hand-built inverted index. Movie titles and descriptions are lowercased, stripped of punctuation, split into tokens, filtered with a stopword file, and stemmed with NLTK's Porter stemmer. The index maps each processed term to the document IDs that contain it. It also stores per-document term counts and document lengths. [Text processing][keyword] · [Inverted index][index]

Those structures support term frequency, inverse document frequency, TF-IDF inspection, and BM25. The BM25 implementation applies the usual document-frequency term and length normalization with `k1=1.5` and `b=0.75`.

```python
def bm25(self, doc_id, term) -> float:
    return self.get_bm25_tf(doc_id, term) * self.get_bm25_idf(term)
```

The index and its supporting maps are serialized under `cache/` so the CLI does not need to rebuild them for every search. That made the mechanics concrete for me: keyword retrieval is not simply matching strings. It tracks which documents contain a term, how often the term appears, how common it is across the collection, and how document length affects the score.

## Adding semantic search

Keyword search works well when the query and document share useful words. Semantic search provides another signal when they express similar ideas with different vocabulary.

The semantic layer uses `all-MiniLM-L6-v2` from Sentence Transformers. It concatenates each movie's title and description, produces a 384-dimensional embedding, and caches the embedding matrix as a NumPy file. Query embeddings are compared with document embeddings using an explicit cosine-similarity function. [Semantic search][semantic]

The project also experiments with description chunks. It splits descriptions on sentence boundaries, groups up to four sentences with an overlap of one, embeds the chunks, and retains metadata that maps each chunk back to its movie. At search time, the best scoring chunk becomes that movie's semantic score. This gives a long description more than one chance to match a focused question.

## Combining keyword and semantic retrieval

The hybrid layer supports two fusion methods. Weighted search normalizes the BM25 and semantic score lists independently, then combines them with an `alpha` value. Reciprocal Rank Fusion, or RRF, ignores the raw score scales and combines each document's position in the two result lists:

```python
def rrf_score(rank, k=60):
    return 1 / (k + rank)
```

For each document, the final RRF value is the keyword contribution plus the semantic contribution. A document can therefore rank well because both systems support it, while a strong result from only one system still receives credit. [Hybrid search][hybrid]

This was a useful design lesson. BM25 scores and cosine similarity are not naturally comparable. Weighted fusion first forces both into a shared 0 to 1 range. RRF takes a different route and combines ranks instead of pretending the scores mean the same thing.

## Query enhancement and reranking

The hybrid CLI can send a query to Groq for one of three transformations: spelling correction, a more searchable rewrite, or related-term expansion. These are optional preprocessing steps, and the code logs both the original query and the enhanced one. [Hybrid CLI commands][hybrid-commands]

After retrieval, the project can fetch five times the requested result count and rerank those candidates in three ways:

- an individual LLM call that assigns each movie a score from 0 to 10;
- a batch LLM call that returns movie IDs in relevance order;
- a local `cross-encoder/ms-marco-TinyBERT-L2-v2` model that scores query-document pairs.

This separates candidate retrieval from the more expensive relevance decision. BM25 and MiniLM search broadly. The reranker then spends more computation on a smaller set.

Each RRF run writes a JSON log with the query, enhancement method, reranking method, retrieved candidates, and final results. That record is valuable because it keeps the intermediate ranking visible instead of showing only the final answer.

## Building the RAG path

The generation commands use the hybrid RRF search as their retriever. The top movies are formatted as numbered documents containing titles and descriptions, then included in a prompt for `llama-3.3-70b-versatile` through the Groq client. [Augmented generation][generation]

The CLI offers four answer styles:

- `rag` asks for a comprehensive answer based on five retrieved movies;
- `summarize` synthesizes several results into a compact overview;
- `citations` asks the model to attach bracketed document numbers such as `[1]` and `[2]`;
- `question` produces a shorter conversational response.

```bash
python cli/augmented_generation_cli.py citations \
  "romantic comedy recommendations" --limit 5
```

The citation mode is especially helpful because it keeps the generated statement connected to the retrieved list shown directly above it. The citations identify documents in that prompt, not independently verified external sources.

## Evaluating retrieval

The evaluation CLI loads a golden dataset containing queries and expected movie titles. For every test case it runs RRF search and calculates precision, recall, and F1 at the requested result limit. [Evaluation code][evaluation]

```bash
python cli/evaluation_cli.py --limit 5
```

No aggregate benchmark result is committed in the inspected revision, so I am not publishing an accuracy claim. The important implementation step is that retrieval has an explicit test set and metrics separate from LLM opinion. The hybrid CLI also has an optional LLM relevance rating from 0 to 3, but that is a model-generated judgment and should not be treated as a replacement for the golden dataset.

The current F1 helper assumes both precision and recall are not simultaneously zero. A safer version would return zero when their sum is zero. The golden data and movie data are gitignored, so reproducing a run also requires those exact external files.

## Multimodal search

The project explores two image paths. One uses `clip-ViT-B-32` to embed a query image and movie text in the same vector space, then ranks movie descriptions by cosine similarity. The other sends an image and a text query to Gemini 2.5 Flash and asks it to rewrite the query around visual details before search. [Multimodal search][multimodal] · [Image query rewrite][image-rewrite]

These are search experiments, not a claim that the system understands an entire film from an image. They show two distinct choices: compare image and text embeddings directly, or use a vision-capable model to produce a stronger text query for the existing retrieval stack.

## Engineering decisions and limits

The CLI structure makes each stage easy to inspect and run separately. It also exposes useful next steps.

- Cached document embeddings are invalidated only when the document count changes. Content can change without changing the count, so a dataset hash or version should be part of the cache key.
- Pickle is convenient for a local index but should only load trusted cache files.
- The batch reranker builds a reranked list, but the current helper returns the original `results` object. That return path should be corrected before relying on batch reranking order downstream.
- API-backed enhancement, reranking, evaluation, image rewriting, and generation require environment keys and can introduce cost, latency, and nondeterminism.
- The generated answer receives movie descriptions as plain prompt text. A more defensive version should clearly delimit data and test how it handles instructions embedded in retrieved content.
- The project has CLI exercises and checked-in logs, but no automated test suite or deployed API in the inspected revision.

These are observations from the source review, not invented incidents or production measurements.

## What I learned

Building the pipeline in layers made the responsibilities much clearer. Tokenization, indexing, BM25, embeddings, chunking, fusion, reranking, evaluation, prompt construction, and generation each solve a different problem. RAG became easier to reason about once I could inspect the retrieval result before the model saw it.

The project also changed the questions I ask. Instead of starting with “Which LLM should I use?”, I can ask whether the query was represented well, whether the right candidates were found, whether fusion helped, whether reranking changed the right items, and whether the final answer stayed inside the retrieved evidence.

> **Author question before the next revision:** Which part of this progression made search click for you personally: implementing BM25, seeing semantic matches, combining ranks, or adding the generated answer?

## Sources and scope

This article describes repository revision [`0028b2d`][revision]. The Boot.dev origin and learning goal come from my own account. Source claims are pinned below. No production deployment, traffic, latency benchmark, or aggregate retrieval score is claimed.

[revision]: https://github.com/Eng-Moaz/rag-search-engine/tree/0028b2d4052c24feaedce82c3a649353ff6481bf
[keyword]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/keyword_search.py
[index]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/inverted_index.py
[semantic]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/semantic_search.py
[hybrid]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/hybrid_search.py
[hybrid-commands]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/hybrid_cli_commands.py
[generation]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/augmented_cli_commands.py
[evaluation]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/evaluation_cli_commands.py
[multimodal]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/lib/multimodal_search.py
[image-rewrite]: https://github.com/Eng-Moaz/rag-search-engine/blob/0028b2d4052c24feaedce82c3a649353ff6481bf/cli/describe_image_cli.py
