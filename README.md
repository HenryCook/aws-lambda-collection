# aws-lambda-collection
Place for my random AWS Lambda functions

I thought it'd be nice to drop my not-so-pretty-but-working lambda functions in a repo for later reference.

## NodeJS 4.3

### indices_cleaner

This removes anything that is outside of the retention period and matches the regex.

**Beware:** This will remove *everything* that matches the retention period for example, `/logstash-/` with a retention of 10 would keep 10 of the last indices that match `logstash-*`. While a regex of `/(logstash-this|logstash-that)-/` would match `logtash-this-*` and `logstash-that-*` and will only keep the last 5 of each due to the last 10 are split between the two.

### index_template

This applies an [index template](https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-templates.html) for everything that matches `logstash-*` and makes sure each indices has one primary and one replica shard, to help keep the shard count down.
