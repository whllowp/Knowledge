# Decision map: <feature name>

Slug: <feature-slug>
Date: <date>
Status: open

## Destination

<One sentence: what becomes possible when this map closes.>

## Decisions blocking the path

| # | Question | Options | Owner | Unblocks |
|---|---|---|---|---|
| D1 | <question> | A) <option> B) <option> | user | <what can start once answered> |

## Resolution log

| # | Decision | Record | Date |
|---|---|---|---|
| D1 | <choice> | decisions/0001-<slug>.md | <date> |

## Collapse

Once no decision blocks the first spec, run:

    python scripts/sdd.py init --slug <feature-slug> --name "<feature name>" --mode standard

Do not build from this map.
