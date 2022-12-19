rundb:
	docker run \
	--rm -d \
	--network darknet \
	-p 5435:5432 \
	--name db \
	-e POSTGRES_PASSWORD=admin \
	-e POSTGRES_USER=bridge \
	-v /home/geos/nodejs/bridge/libs:/docker-entrypoint-initdb.d \
	postgres
run:
	docker run \
	--rm -d \
	--network darknet \
	-p 3500:3500 \
	--name bridge_app \
	-e SERVER_PORT=3500 \
	-e DB_USER=bridge \
	-e DB_HOST=db \
	bridge