from app.worker.celery_app import celery
from app.db.session import SessionLocal
from app.models import PDF, DocumentStatus
from app.utils.publisher import publish_progress
from app.config import s3_client, settings
import time


@celery.task
def process_pdf(document_id: str):
    db = SessionLocal()

    try:
        pdf = db.get(PDF, document_id)
        if not pdf:
            return

        channel = f"task:{pdf.task_id}"

        pdf.status = DocumentStatus.PROCESSING
        db.commit()

        publish_progress(channel, {
            "document_id": document_id,
            "status": "processing",
            "progress": 10
        })


        obj = s3_client.get_object(
            Bucket=settings.aws_bucket_name,
            Key=pdf.s3_key
        )

        file_content = obj["Body"].read()

        publish_progress(channel, {
            "document_id": document_id,
            "status": "processing",
            "progress": 30
        })

        time.sleep(2)

        extracted_data = {
            "length": len(file_content),
            "preview": file_content[:50].decode(errors="ignore")
        }

        publish_progress(channel, {
            "document_id": document_id,
            "status": "processing",
            "progress": 70
        })

        pdf.result = extracted_data  
        pdf.status = DocumentStatus.COMPLETED

        db.commit()

        publish_progress(channel, {
            "document_id": document_id,
            "status": "completed",
            "progress": 100
        })

    except Exception as e:
        db.rollback()

        if pdf:
            pdf.status = DocumentStatus.FAILED
            pdf.error_message = str(e)
            db.commit()

        publish_progress(channel, {
            "document_id": document_id,
            "status": "failed",
            "progress": 0
        })

    finally:
        db.close()