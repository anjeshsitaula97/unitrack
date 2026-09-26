---
kind: external_dependency
name: JWT signing and verification
slug: jose
category: external_dependency
category_hints:
    - auth_protocol
scope:
    - '**'
source_files:
    - src/lib/session.ts
    - .env.example
---

jose is used to sign and verify JWT session tokens. Tokens use HS256 algorithm, include id/email/role in the payload, are issued with issuedAt and expire after 24 hours. The secret key is read from JWT_SECRET env var; both signToken and verifyAuth throw when it is missing or invalid. Tokens are exchanged between client and server for authenticated API access.