
FROM docker.elastic.co/elasticsearch/elasticsearch:5.6.2

WORKDIR /usr/share/elasticsearch/

ADD config/elasticsearch.yml config/

RUN mkdir utils

ADD *.sh utils/

# RUN utils/docker-entrypoint.sh elasticsearch -p tmp/epid & utils/wait-for-it.sh -t 0 localhost:9200 -- echo "Elasticsearch is ready" && curl -XPUT 'localhost:9200/real-affinities?pretty' -H 'Content-Type: application/json' -d'{ "settings" : { "index" : { "number_of_shards" : 3, "number_of_replicas" : 0 }}}' && kill $(cat tmp/epid) && wait $(cat tmp/epid); exit 0;
