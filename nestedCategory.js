const keyword = { query_string: { query: 'nike shoes' } };

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