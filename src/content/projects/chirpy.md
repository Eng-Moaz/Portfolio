---
caseStudy: true
draft: false
sample: false
title: Chirpy
repository: https://github.com/Eng-Moaz/chirpy
summary: A Boot.dev backend project that turns Go's standard HTTP tools, PostgreSQL, and token authentication into a complete JSON API.
language: Go · PostgreSQL
order: 3
note: "small backend, real boundaries"
facts:
  - Registers Go 1.22-style method-and-path routes on an http.ServeMux.
  - Implements Argon2id passwords, one-hour JWT access tokens, and revocable refresh tokens.
  - Uses Goose migrations and sqlc-generated Go methods over PostgreSQL queries.
evidenceStatus: documented
media: []
---

## What is Chirpy?

Chirpy is a small microblogging backend: people can create accounts, sign in, publish short “chirps,” filter or sort them, and delete their own posts. It began as a [Boot.dev](https://www.boot.dev/) guided project rather than an original product concept. Its value for me was in the implementation. It gave me a concrete reason to learn how an HTTP server receives a request, turns JSON into Go values, crosses a database boundary, and sends a useful response.

The repository at revision [`8f43a5c`][revision] is a single Go service backed by PostgreSQL. Alongside the chirp endpoints, it includes account updates, access-token refresh and revocation, a webhook that changes account state, a health endpoint, and development-only administration behavior. There is no claim here that it is a hosted production social network; it is a learning project with real backend seams to inspect.

## Building the HTTP API

The entry point creates an `http.ServeMux`, registers routes such as `POST /api/users` and `GET /api/chirps/{chirpID}`, then starts an `http.Server` on port 8080. This uses Go’s method-and-path routing instead of a third-party router. The handlers remain ordinary functions or methods with `http.ResponseWriter` and `*http.Request`. [Route registration][main]

```go
mu.HandleFunc("POST /api/chirps", apiCfg.HandlerChirps)
mu.HandleFunc("GET /api/chirps", apiCfg.HandlerAllChirps)
mu.HandleFunc("GET /api/chirps/{chirpID}", apiCfg.HandlerOneChirp)
mu.HandleFunc("DELETE /api/chirps/{chirpID}", apiCfg.HandlerDeleteChirp)
```

Creating a chirp shows the request lifecycle clearly. The handler reads a bearer token, decodes the JSON body, validates the access token, enforces the 140-character limit, applies the course’s small profanity filter, and constructs the database parameters. It returns the inserted record as JSON with status `201`. Listing chirps supports an optional `author_id` filter and descending sort. Deletion checks both authentication and ownership. [Chirp handlers][chirps]

The shared response helper calls `json.Marshal`, sets `Content-Type: application/json`, and writes the status code before the body. That kept the handlers focused, while also teaching me that response order matters: headers and status must be written before the payload. [JSON helpers][json]

## Authentication and state

Passwords are hashed with Argon2id before storage. Login retrieves a user by email, verifies the supplied password, and issues two different credentials: a signed JWT access token that lasts one hour, and a random 32-byte refresh token encoded as hexadecimal and stored in PostgreSQL. [Authentication package][auth] · [User handlers][users]

The access token carries the user UUID in its subject claim. Protected handlers take that identity from the validated token rather than trusting a `user_id` in the request payload. Refresh tokens are stateful: the database records their expiry and optional revocation time. `POST /api/refresh` rejects an expired or revoked token before issuing a new access token; `POST /api/revoke` marks the refresh token as revoked. [Refresh handlers][refresh] · [Token queries][token-queries]

This split helped me see a useful boundary. A short-lived JWT can be checked without a user lookup, while a refresh token remains under server-side control and can be revoked. The code is deliberately compact, but the responsibilities are already different.

## PostgreSQL and persistence

The database begins with Goose migrations. Successive files create `users`, add `chirps` with an `ON DELETE CASCADE` foreign key, add password hashes, create the refresh-token table, and finally add the premium-account flag. The sequence makes schema evolution visible instead of treating a database as an unexplained prerequisite. [Migrations][migrations]

SQL lives in small named query files. `sqlc` turns those statements into typed methods such as `CreateUser`, `GetAllChirps`, and `UpdateRefreshToken`, collected behind `database.Queries`. The HTTP layer therefore works with generated Go types while the actual query remains readable SQL. [Chirp queries][chirp-queries] · [User queries][user-queries]

```sql
-- name: DeleteChirpById :exec
DELETE FROM chirps
WHERE user_id = $1 AND id = $2;
```

The ownership predicate is enforced in both the handler and the delete statement. That is a useful defense boundary: even after the handler verifies ownership, the mutation still includes the authenticated user ID.

## Webhooks and another trust boundary

The `POST /api/polka/webhooks` handler expects an API key, accepts an event payload, ignores unrelated event types, and marks a user as premium for `user.upgraded`. This is a course simulation of an external payment event, not evidence of a live billing integration. It was another chance to work with request authentication and externally driven state changes. [Webhook handler][users]

## Challenges and engineering decisions

The repository makes several practical choices that suit a focused learning service: standard-library routing, direct handler methods, SQL visible in the repository, and generated database glue. It also exposes follow-up work I would do before treating it as production-ready.

- Some error paths in account creation write an error response but do not immediately `return`, so execution can continue after a failed decode, hash, or insert.
- Bearer parsing uses `strings.TrimPrefix`; it does not reject an `Authorization` value that lacks the expected prefix.
- Refresh tokens are stored in plaintext. A stronger production design would store only a hash so a database leak does not reveal active credentials.
- The code has authentication unit tests, but the route and database behavior would benefit from handler-level tests around invalid payloads, authorization, and status codes.

These are observations from the inspected code, not a claim that I encountered a specific incident.

## What I learned

Chirpy connected the parts of backend development that had previously felt separate: starting an HTTP server, routing by method and path, decoding request payloads, choosing status codes, authenticating requests, and persisting state in PostgreSQL. Writing Go for a service also made error handling and explicit types part of the everyday flow rather than something hidden by a framework.

It was especially useful to work through access and refresh tokens as different forms of state, and to see SQL migrations and generated queries living beside the application. The project gave me a much clearer mental model of what a REST API actually does between receiving a request and returning a response.

> **Author question before the next revision:** Which part took the most effort for you personally: authentication, SQL migrations, or shaping the handlers? A concrete memory would make this section more personal without inventing a story.

## Sources and scope

This article describes repository revision [`8f43a5c`][revision]. Technical claims link to the inspected source. The learning goals and Boot.dev context come from my own account. No deployment, load test, security audit, or production usage is claimed.

[revision]: https://github.com/Eng-Moaz/chirpy/tree/8f43a5c1d1959572e19df14bd3cb4dda70721641
[main]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/main.go
[chirps]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/handler_chirp.go
[json]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/json.go
[auth]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/internal/auth/auth.go
[users]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/users_handler.go
[refresh]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/handler_refresh.go
[token-queries]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/sql/queries/tokens.sql
[migrations]: https://github.com/Eng-Moaz/chirpy/tree/8f43a5c1d1959572e19df14bd3cb4dda70721641/sql/schema
[chirp-queries]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/sql/queries/chirps.sql
[user-queries]: https://github.com/Eng-Moaz/chirpy/blob/8f43a5c1d1959572e19df14bd3cb4dda70721641/sql/queries/users.sql
