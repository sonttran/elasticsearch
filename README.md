# Some frequently used cases with Elasticsearch
This code base is built on:
* <a href="https://www.elastic.co/" target="_blank">Elasticsearch</a> 5.4
* Node.js <a href="https://github.com/sonttran/server" target="_blank">Vpop server</a> with <a href="https://www.npmjs.com/package/mongoosastic" target="_blank">Mongoosastic</a> module
* Context: commercial website with postings. Search filters are nested categories, price range, flags.

## Use cases
* [Get document counts (same index, different categories)](#docCount)
* [Search for multi-field, nested-category document](#search)
* [Multiple searches in one trip query](#msearch)

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
    
    const filter = { range: { air: { gte: 1517778314240 } } }; // 30 days back from now
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
* Sample response as below. In this case, we can have all counts of posting categories (Fashion, Vehicle, Real Estate, ...) returned in a single trip to Elasticsearch server.
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
* More  about 5.x `aggregations` can be found in <a href="https://www.elastic.co/guide/en/elasticsearch/reference/5.5/search-aggregations.html" target="_blank">Elasticsearch official document</a>.


### Search for multi-field, nested-category document<a name="search"></a>
* Build your document schema
* Use `query_tring` to take advantage of built in <a href="https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-query-string-query.html" target="_blank">Elasticsearch query parser</a>.
```javascript
    const keyword = { query_string: { query: 'nike shoes' } };
```
* Build your filter for muti-field, nested-category filter. In this example, nested categories are `locations` and `topics`
```javascript
    const filter = { bool: { should: [ 
        { bool: { must: [ 
            { range: { air: { gte: 1517795104902 } } },
            { term: { sellType: 'owner' } },
            { range: { price: { gte: 80, lte: 150 } } },
            { term: { locations: 'nation_wide' } },
            { term: { locCount: 1 } },
            { term: { topics: 'shoes' } } 
        ] } },
        { bool: { must: [
            { range: { air: { gte: 1517795104902 } } },
            { term: { sellType: 'owner' } },
            { range: { price: { gte: 80, lte: 150 } } },
            { term: { locations: 'nation_wide' } },
            { term: { locations: 'california' } },
            { term: { topics: 'shoes' } } 
        ] } }
    ] } };
```
* Issue search query to Elasticsearch server.
```javascript
    post.search({ bool: {
        must    : keyword,
        filter  : filter,
    }}, {
        size    : 10, // number of returned results
        from    : 0, // return from result 0. These two can be apply to create paging
        sort    : { createdAt: { order: 'desc' } }, // sort your result
        _source: ['title','url','price','photos','board'], // control returned fields
    }, function(err, searchRes) {
        if(err) { cb(err, null) } else { cb(null, {
            found       : searchRes.hits.total, 
            searchTime  : searchRes.took, 
            resList     : searchRes.hits.hits
        })}
    });
```
* More  about 5.x `bool query` can be found in <a href="https://www.elastic.co/guide/en/elasticsearch/reference/5.5/query-dsl-bool-query.html" target="_blank">Elasticsearch official document</a>.


### Multiple searches in one trip query<a name="msearch"></a>
* Construct your search with multiple queries and indices.
```javascript
    esClient.msearch({
        body: [
            { index: 'blogs', type: 'blog' }, //  first query
            {
                size: 6, 
                query : { match: { air: true }},
                sort : [ { createdAt : { order : 'desc' }}], 
                _source: ['title','url',],
            },
            { index: 'blogs', type: 'blog' }, // second query, can search with different index too
            {
                size: 8, 
                query : {bool:{must:[{match:{type:'introduction'}},{match:{air:true}}]}},
                sort : [ { createdAt : { order : 'desc' }}],
                _source: ['title','url'],
            },
            { index: 'blogs', type: 'blog' }, // third query
            {
                size: 12, 
                query : {bool:{must:[{match:{type:'announcement'}},{match:{air:true}}]}},
                sort : [ { createdAt : { order : 'desc' }}],
                _source: ['title','url'],
            },
        ]
    }).then(result => {
        cb(null, result);
    }).catch(err => {
        cb(err, null);
    });
```
* With this one trip to Elasticsearch server, you will have multiple search results returned with same order in your search structure. Example response:
```javascript
    { responses: [ 
        {
            took        : 2,
            timed_out   : false,
            _shards     : [Object],
            hits        : [Object],
            status      : 200 
        },
        { 
            took        : 0,
            timed_out   : false,
            _shards     : [Object],
            hits        : [Object],
            status: 200 
        },
        { 
            took        : 1,
            timed_out   : false,
            _shards     : [Object],
            hits        : [Object],
            status      : 200 
        }
    ] }
```
* More about 5.x `multi search` can be found on <a href="https://www.elastic.co/guide/en/elasticsearch/reference/5.5/multi-search-template.html" target="_blank">Elasticsearch official document</a>.