# Cloudshift — Sindhu's Pickles (GST fork notes)

Native customizations for Openship deploy of this fork. Build the container image **from this fork**, not upstream `invoicerr-app/invoicerr`.

## Invoice create form — template type

On create/edit invoice, required field **Invoice template** (`invoiceFormat`):

| Value | Label | PDF title |
| ----- | ----- | --------- |
| `b2b` | B2B Tax Invoice | Tax Invoice |
| `b2c` | B2C Retail Invoice | Retail Invoice |

Help text: B2B for GST-registered buyers; B2C for retail / unregistered customers.

## Settings → Branding — template master

Document template option **Sindhu's Pickles** (`sindhu`): green `#063f32`, gold `#c89b3c`, cream `#f7f4ea`. Preset tile `sindhu` (accent `#063f32`, font `lora`) matches.

## Status flow (this branch)

There is **no** `UNPAID` / `PAID` enum on invoice status. Lifecycle is draft → validated / sending → sent (or send_failed) → cancelled; payment is a projection via **Record payment**, not a status flip.

Typical ops path:

1. **Validate** — number and lock (or transmit when a mandated channel applies)
2. **Send** — deliver
3. **Record payment** — bookkeeping; balance shows Paid / Partially paid on read

## Openship

Point the project's image / release source at **this fork** (`cloudshiftsolutions-dev/invoicerr`, branch with these commits) so deploy picks up the Sindhu template, `invoiceFormat`, and thank-you email defaults.
