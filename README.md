# Some frequently used cases Elasticsearch
This code base is built on:
* <a href="https://www.elastic.co/" target="_blank">Elasticsearch</a> 5.4
* Node.js <a href="https://github.com/sonttran/server" target="_blank">Vpop server</a> with <a href="https://www.npmjs.com/package/mongoosastic" target="_blank">Mongoosastic</a> module
* Context: commercial website with postings. Search filters are nested categories, price range, flags.

## Use cases
* [Get document counts (same index, different categories)](#docCount)

### Get document counts (same index, different categories)<a name="docCount"></a>
* Query and filter
```javascript
    const query = { 
        food_drink      : { match: { topics: 'food_drink' } },
        fashion         : { match: { topics: 'fashion' } },
        real_estate     : { match: { topics: 'real_estate' } },
        vehicle         : { match: { topics: 'vehicle' } },
        job             : { match: { topics: 'job' } },
        learn           : { match: { topics: 'learn' } },
        emtertainment   : { match: { topics: 'emtertainment' } }
    };
    
    const filter = { range: { air: { gte: 1517778314240 } } };
```
* Elasticsearch client query
```javascript
    esClient.search({
        index: 'posts', // elasticsearch index
        type: 'post', // elasticsearch type
        body: {
            "size"  : 12, // return no detail about found posts
            "query" : query, // plugin your query
            "aggs"  : { "messages" : { "filters" : { "filters" : filters }} }, // plugin your filter
            _source: ['title','url','photos','viewed'], //  controlled returned fields
        }
    }).then(resp => { cb(null, resp)}).catch(err => cb(err, null));
```
* Sample response
```javascript
    { 
        took: 15,
        timed_out: false,
        _shards: { total: 5, successful: 5, skipped: 0, failed: 0 },
        hits: { total: 12345678, max_score: null, hits: [ [length]: 0 ] },
        aggregations: { 
            messages: { 
                buckets: { 
                    food_drink      : { doc_count: 433 },
                    fashion         : { doc_count: 346 },
                    real_estate     : { doc_count: 2342 },
                    vehicle         : { doc_count: 424 },
                    job             : { doc_count: 4567 },
                    learn           : { doc_count: 8763 },
                    emtertainment   : { doc_count: 4542 },
                }
            }
        }
    }
```
* More  about aggregations can be found in <a href="https://www.elastic.co/guide/en/elasticsearch/reference/5.5/search-aggregations.html" target="_blank">Elasticsearch official document</a>.