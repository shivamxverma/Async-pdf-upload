startServer:
	venv/bin/uvicorn app.main:app --reload --port 8000

startWorker:
	OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES venv/bin/celery -A app.worker.tasks worker --pool=solo --loglevel=info