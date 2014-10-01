#!/bin/bash
BASEDIR=$(dirname $0)

echo "Deleting 'users' and 'sessions' collections..."
mongo pproulette --eval "db.users.drop()"
mongo pproulette --eval "db.sessions.drop()"

echo "Importing 'users' and 'sessions' data..."
mongoimport -d pproulette -c users --file $BASEDIR/data_users.json --jsonArray
mongoimport -d pproulette -c sessions --file $BASEDIR/data_sessions.json --jsonArray

echo "Done"
