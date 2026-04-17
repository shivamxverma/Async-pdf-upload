import boto3
from app.core.config import settings

def get_s3_client():
    return boto3.client(
        "s3",
        region_name = settings.aws_region,
        aws_secret_access_key = settings.aws_secret_access_key,
        aws_access_key_id = settings.aws_access_key_id
    )

s3_client = get_s3_client()