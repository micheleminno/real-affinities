#Step 1
FROM docker.elastic.co/elasticsearch/elasticsearch:5.6.2

#Step 2
WORKDIR /usr/share/elasticsearch/

#Step 3
ADD config/elasticsearch.yml config/

#Step 4
RUN mkdir utils

#Step 5
ADD *.sh utils/

#Step 6
# RUN utils/docker-entrypoint.sh elasticsearch -p tmp/epid & utils/wait-for-it.sh -t 0 localhost:9200 -- echo "Elasticsearch is ready" && curl -XPUT 'localhost:9200/real-affinities?pretty' -H 'Content-Type: application/json' -d'{ "settings" : { "index" : { "number_of_shards" : 3, "number_of_replicas" : 0 }}}' && kill $(cat tmp/epid) && wait $(cat tmp/epid); exit 0;
