# Schedule

1. `yarn install`

2. Try the tests to assure everything works fine (Redis Server is mocked there) `yarn test`

3. In a separated terminal setup and run Redis Server `sudo docker run --name my-redis-container -d redis && redis-server`

4. In a separated terminal start server `yarn start`

5. In a separated terminal start poller `yarn poll`

6. Schedule some task with request `curl -d '{"message":"Hello there scheduled task!", "timestamp":"1574145807443"}' -H "Content-Type: application/json" -X POST http://localhost:21212/api/tasks`