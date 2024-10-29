#!/bin/bash
mongoimport \
  --db kasuff2 \
  --collection questions \
  --file /docker-entrypoint-initdb.d/BASE_QUESTION.json \
  --jsonArray
