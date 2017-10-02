#Step 1
FROM docker.elastic.co/elasticsearch/elasticsearch:5.6.1

#Step 2
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/e1f115e4ca285c3c24e847c4dd4be955e0ed51c2/wait-for-it.sh /utils/wait-for-it.sh

#Step 3
RUN /docker-entrypoint.sh elasticsearch -p /tmp/epid & /utils/wait-for-it.sh -t 0 localhost:9200 -- curl -XPUT 'http://127.0.0.1:9200/real-affinities' -d @index.json; kill $(cat /tmp/epid) && wait $(cat /tmp/epid); exit 0;
