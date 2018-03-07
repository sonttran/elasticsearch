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

//{ responses: [ 
//    {
//        took        : 2,
//        timed_out   : false,
//        _shards     : [Object],
//        hits        : [Object],
//        status      : 200 
//    },
//    { 
//        took        : 0,
//        timed_out   : false,
//        _shards     : [Object],
//        hits        : [Object],
//        status: 200 
//    },
//    { 
//        took        : 1,
//        timed_out   : false,
//        _shards     : [Object],
//        hits        : [Object],
//        status      : 200 
//    }
//] }