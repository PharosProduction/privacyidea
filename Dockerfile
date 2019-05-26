FROM python:3.7-slim-stretch

LABEL company="Pharos Production Inc."
LABEL version="1.0.0"

ARG ADMIN_LOGIN
ARG ADMIN_PASSWORD

ENV LANGUAGE en_GB.UTF-8 \
  LC_ALL C \
  REFRESHED_AT 2019-05-25-1 \
  TERM xterm \
  DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends apt-utils
RUN apt-get install -y --no-install-recommends --no-install-suggests \
    libpq-dev \
    python3-dev \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    build-essential \
    git \
    bash \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

RUN pip3 install --upgrade pip \
  && pip3 install virtualenv \
  && pip3 install setuptools --upgrade

WORKDIR /opt/server/
COPY . /opt/server/

RUN virtualenv venv
RUN . venv/bin/activate
RUN pip3 install -r requirements.txt

RUN git submodule init
RUN git submodule update

RUN python3 ./pi-manage createdb
RUN python3 ./pi-manage create_enckey
RUN python3 ./pi-manage create_audit_keys
RUN python3 ./pi-manage admin add ${ADMIN_LOGIN}

EXPOSE 5000
CMD ["/bin/bash"]