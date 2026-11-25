# calculator

Custom **custom** block. Purpose: Static rendering of a premium / subsidy calculator or tariff configurator: labelled fields (select, range, checkbox, date, value) with hints and an optional result table.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per item. 1 cell = intro text or heading (or a result table). 2-3 cells = field: label | control | optional hint. Control cell: a list (optionally preceded by 'select'; bold item = selected) renders a select; 'checkbox' or '[ ]'/'[x]' a checkbox; 'range: <value>' a slider with the value; 'date' day/month/year inputs; 'input: <placeholder>' or 'search: <placeholder>' a text input; any other content is shown as a static value (e.g. '67 Jahre'). A row whose first cell is 'Results' (or 'Ergebnis') starts the results panel; its second cell is the panel heading.

## Supported variations

| Variation | Option class |
| --- | --- |
| Light | `light` |
| Light 2 | `light-2` |
| Light 3 | `light-3` |
| Alt | `alt` |
| Magenta Shadow Light | `magenta-shadow-light` |
| Cyan Dark Shadow Light | `cyan-dark-shadow-light` |

## Universal Editor fields

N/A (Document Authoring project)
