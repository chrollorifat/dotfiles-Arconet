**advanced_mode**: If true, first review after the last learning or relearning step is shown as a "Graduation" step,
and successive same-length learning steps are separated. Can be slow.

**max_step_reps**: Maximum number of repeats to show for a learning step. Repeats after this are combined.
If advanced_mode is not true, this has no effect.

**max_ivl**: Reviews with an interval longer than this are not shown. Those are likely too spread out to provide useful
information and make the graph less legible. Set to 0 to show all.

**min_revs**: Review intervals with less than this many reviews are not shown.

**hide_learn**: If true, statistics for learning steps are never shown.

**hide_review_day**: If true, the graph for learning intervals up to a month is never shown.

**hide_review_week**: If true, the graph for long learning intervals is never shown.
