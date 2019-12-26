FROM amazonlinux:2
ADD bootstrap.sh /bootstrap.sh
RUN touch ~/.bash_profile && chmod +x /bootstrap.sh
RUN yum install -y tar gzip zip
RUN curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh | bash
RUN . ~/.bash_profile && nvm install 10.17.0 && nvm use 10.17.0 && npm install -g aws-lambda
CMD /bootstrap.sh
