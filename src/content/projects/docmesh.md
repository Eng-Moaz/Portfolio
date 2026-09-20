---
caseStudy: true
draft: false
sample: false
status: in-progress
title: DocMesh
repository: https://github.com/Eng-Moaz/docmesh
summary: An ongoing project to turn technical documentation and scattered resources into searchable knowledge, starting with questions about a single web page.
language: Go · Python · FastAPI
order: 5
note: "figuring out what is worth bringing into context"
facts:
  - A small browser interface sends a question and URL through a Go backend to a Python service.
  - The current scraper fetches one page with HTTPX and extracts text with Scrapling.
  - Multi-page crawling, chunking, indexing and knowledge workspaces remain future work.
evidenceStatus: partial
media: []
---

## Starting with the source

DocMesh is a project I’m still building. The goal is to help developers turn technical documentation and other scattered resources into knowledge they can search and ask questions about, without losing the connection to the original source.

The larger idea is a workspace that can bring documentation, repositories and other materials together. The current implementation is much smaller: enter one URL and a question, retrieve that page’s text, and pass it to a language model. That gives me a concrete starting point for understanding how the browser, backend, content acquisition and AI service fit together. [Project vision][vision] · [Current request handler][ai]

## What exists today

At the revision described here, the browser interface, Go request handler, single-page scraper and model call are present in the code. There is no persistent document store or retrieval index yet. It is an early prototype on the way toward the retrieval-augmented system described in the vision, not a finished knowledge platform.

| Area | Current state |
| --- | --- |
| Question and URL input | Implemented in the browser interface |
| Go-to-Python request forwarding | Implemented with JSON over HTTP |
| Page acquisition | One HTTP fetch and text extraction per question |
| Answer generation | Extracted text passed to a Groq-hosted model |
| Source reporting | Submitted URL returned; no passage-level attribution |
| Crawl decisions, chunking and indexing | Not implemented in the reviewed source |
| Reusable workspaces, incremental updates and collaboration | Vision and future work |

These are source-code observations, not deployment or benchmark results. The prototype’s services use local addresses; there is no public demo linked here. [Frontend][frontend] · [Go handler][go-handler] · [Python service][ai]

## Following a question through the services

The frontend is plain HTML, CSS and JavaScript. It reads the question and URL fields and sends them as JSON to `POST http://localhost:8080/chat`. The Go service uses Gin to expose that route and handle cross-origin requests from the separate frontend. [Browser request][frontend] · [Go entry point][go-main] · [Middleware][middleware]

The Go handler binds the request, forwards it to `http://localhost:8000/chat`, decodes the Python response, and returns an answer and a list of sources. At this stage its responsibility is an HTTP boundary between the browser and Python. User accounts, workspace management and persistence are roles described in the vision, not responsibilities implemented in the current backend.

Although the handler returns HTTP `202 Accepted`, it waits for the downstream response before doing so. There is no background ingestion job or queue behind that status code. This matters when thinking about how a longer crawling task should eventually fit into the application. [Go request handler][go-handler]

The Python service exposes its own FastAPI `/chat` route. Its request model contains two strings, `question` and `url`. The central flow is deliberately small:

```python
context = scrape(req.url)
response = respond(req.question, context)
```

After generation, it returns the answer and the submitted URL. The separation keeps the model integration in Python while Go handles the browser-facing request. It also creates a real service contract to manage: response shape, errors, timeouts and configuration have to make sense on both sides. [Python handler][ai]

## The scraping pipeline, as it is now

A documentation URL currently enters through the same form as the question. Python passes it directly to `scrape()`. A blank URL produces an empty context; otherwise the scraper fetches a single page, raises on an unsuccessful HTTP response, parses the returned HTML and extracts text:

```python
response = httpx.get(url, timeout=30)
response.raise_for_status()

doc = Selector(response.text)
context = doc.get_all_text()
```

The last two lines above represent the parser and extraction steps in [`scraper.py`][scraper]. There is no link-discovery loop, browser rendering step or spider deployment in this implementation. It does not execute a documentation site’s JavaScript to build the page. If the useful content arrives only after client-side rendering, this fetch alone cannot recover it.

There is also no article-specific selector or explicit content-cleaning stage. Extracting available text is enough to connect the services, but navigation, repeated menus and other boilerplate may remain alongside the documentation. A more deliberate pipeline needs to decide which content is worth keeping, preserve its headings and code, and normalize it without throwing away meaning. Those are open engineering tasks, not extraction problems I’m claiming to have solved. [Current scraper][scraper]

The extracted text goes directly into `respond()`. That function creates a `ChatGroq` client for `llama-3.3-70b-versatile` and places the question and context into one human message. There is no chunk selection, embedding lookup or context budget in between. The prompt also allows a normal answer when the question is unrelated to the supplied source, so returning a URL does not mean every answer is grounded in that page. [Model integration][generation]

## The part I am working through

The scraping pipeline has been the difficult part for me: deciding which links are relevant, how to direct the spiders, and when to continue or stop. Fetching a page is only one part of acquiring useful documentation. Following every link can quickly move away from the material I actually wanted.

My proposed approach is to bring a judge LLM and an evaluator LLM into the pipeline to assess relevance, with chunking and restructuring of the documentation page as part of that process. This is the direction I’ve arrived at while working through the problem. Those stages are **not yet implemented in the reviewed repository**.

The next design question is how to make their decisions bounded and inspectable. Model-based judgments could help with pages that do not share one predictable layout, but introduce cost, latency and inconsistent decisions. A useful implementation would still need explicit crawl limits and a way to review which pages were accepted or rejected. This is a trade-off to evaluate, rather than a measured improvement.

## Boundaries that still need work

**Failures and timeouts.** The scraper has a 30-second HTTP timeout and calls `raise_for_status()`. It does not catch those errors or retry. The Go handler uses `http.Post` without an explicitly configured client timeout, and does not inspect the upstream status before decoding the response. The frontend also assumes a successful response with a `sources` array. A consistent error contract across those boundaries is unfinished work. [Scraper][scraper] · [Go handler][go-handler] · [Browser response handling][frontend]

**Repeated ingestion.** Each question calls the scraper again, even for the same URL. There is no URL normalization, content hash, cache or persistent ingestion record. The vision’s reusable knowledge packages would require storing source identity and content versions, then deciding when a document genuinely needs to be processed again. [Chat handler][ai] · [Vision][vision]

**Chunking, retrieval and attribution.** Passing page text into a prompt connects acquisition to generation, but it is not an indexed retrieval pipeline. Chunk boundaries, an embedding/index layer and selection of relevant passages still need to be built. Keeping URLs and section information with those chunks would support more useful citations than the current echo of the input URL.

**A local prototype’s trust boundaries.** User-supplied URLs currently reach the server-side fetch without an explicit destination policy, and the browser inserts the response with `innerHTML`. Before exposing the prototype more broadly, URL restrictions and safe output rendering would need attention. These are visible implementation limits, not evidence of a production deployment. [Scraper][scraper] · [Frontend][frontend]

## What I am learning, and what comes next

DocMesh has helped me understand the different responsibilities inside a system that connects backend services with AI functionality. A model call does not take care of acquiring useful content, deciding which material belongs together, or preserving where an answer came from. Building even the current small path makes those boundaries easier to see.

My immediate direction is the judge/evaluator approach to relevance and page restructuring. I still need to turn that idea into a bounded pipeline, test its decisions on real documentation pages, and work out how it connects to chunking and indexing. The broader workspace and collaboration ideas remain longer-term goals in the vision document, rather than completed features.

There are no retrieval-accuracy, latency or deployment results to report here. For now, the useful story is the implementation in progress and the questions it is helping me make more precise.

## Source notes

This article follows repository revision [`0c9206e`][revision]. The scraping challenge and proposed judge/evaluator approach come from my own account. Implementation descriptions are linked to the checked-in source. The services were reviewed for this case study; no paid model calls, end-to-end ingestion test or benchmark run was performed.

[vision]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/docs/00-vision.md
[frontend]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/frontend/script.js
[go-main]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/backend/main.go
[go-handler]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/backend/rag_handlers.go
[middleware]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/backend/middlewares.go
[ai]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/ai-service/main.py
[scraper]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/ai-service/scraper/scraper.py
[generation]: https://github.com/Eng-Moaz/docmesh/blob/0c9206e3fa65e63ca9647c9928053012d5a102b8/ai-service/utils.py
[revision]: https://github.com/Eng-Moaz/docmesh/tree/0c9206e3fa65e63ca9647c9928053012d5a102b8
