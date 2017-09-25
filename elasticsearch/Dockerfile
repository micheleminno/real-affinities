FROM ubuntu:14.04

ENV ES_PKG_NAME elasticsearch-5.5.2

# Install system level packages needed to install elastic search or dependancies.
RUN sudo apt-get update
RUN apt-get -y install software-properties-common

# Install Java.
RUN echo oracle-java8-installer shared/accepted-oracle-license-v1-1 \
    select true | debconf-set-selections && \
    add-apt-repository -y ppa:webupd8team/java && \
    apt-get update && \
    apt-get install -y oracle-java8-installer && \
    rm -rf /var/lib/apt/lists/* && \
    rm -rf /var/cache/oracle-jdk8-installer

# Define commonly used JAVA_HOME variable
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

# Install Elasticsearch.
RUN \
    cd / && \
    wget https://artifacts.elastic.co/downloads/elasticsearch/$ES_PKG_NAME.tar.gz && \
    tar xvzf $ES_PKG_NAME.tar.gz && \
    rm -f $ES_PKG_NAME.tar.gz && \
    mv /$ES_PKG_NAME /elasticsearch

# Mount elasticsearch.yml config
ADD config/elasticsearch.yml /elasticsearch/config/elasticsearch.yml

# Run as elasticsearch user, not as root
RUN groupadd elasticsearchGroup
RUN adduser --disabled-password --gecos "" elasticsearch
RUN adduser elasticsearch elasticsearchGroup
RUN usermod -aG sudo elasticsearch
RUN chown -R elasticsearch:elasticsearchGroup elasticsearch/config
USER elasticsearch:elasticsearchGroup
