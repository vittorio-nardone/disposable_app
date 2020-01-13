import boto3
from botocore.exceptions import ClientError
import json
import os
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ['emails_table_name'])

def store_email(email, receipt):
    try:
        response = table.put_item(
            Item= {'destination': email['destination'][0],
                'messageId': email['messageId'],
                'timestamp': email['timestamp'],
                'source': email['source'],
                'commonHeaders': email['commonHeaders'],
                'bucketName': receipt['action']['bucketName'],
                'bucketObjectKey': receipt['action']['objectKey'],
                'isNew': "true"
            }
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])

def lambda_handler(event, context):
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)
    logger.info('## EVENT')
    logger.info(event)

    message = json.loads(event['Records'][0]['Sns']['Message'])
    store_email(message['mail'], message['receipt'])

