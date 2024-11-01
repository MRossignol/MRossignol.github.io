import uvicorn

if __name__ == '__main__':
    uvicorn.run("server:app", port=8080, log_level="info", host="0.0.0.0")
