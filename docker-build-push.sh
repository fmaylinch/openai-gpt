docker build . -t fmaylinch/openai-gpt
docker push fmaylinch/openai-gpt
# docker run -p 3000:3000 -e OPENAI_API_KEY=xxx -d fmaylinch/openai-gpt
