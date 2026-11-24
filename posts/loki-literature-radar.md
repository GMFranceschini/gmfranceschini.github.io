I think I haven't found a satisfying paper recommendation system in years.
So I designed a minimal tool: [Loki](https://github.com/GMFranceschini/loki). It fetches new
PubMed, bioRxiv and medRxiv records once a day, scores them on topic relevance and journal
impact, and ranks them into three digests — day, week and month. It serves them on
`127.0.0.1`, and nothing leaves the machine except the queries themselves.

The part that decides whether it works is the topic list. You describe each interest in a
sentence or two of plain prose, the way you would to a colleague, and that text is matched
against abstracts.

For day, week, or month windows you get the most relevant papers - weighted by Journal IF + topic relevance.
