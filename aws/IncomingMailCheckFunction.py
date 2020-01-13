import boto3
from botocore.exceptions import ClientError
import os
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ['addresses_table_name'])

def address_exists(address):
    exists = False
    try:
        response = table.get_item(
            Key={
            'address': address
            }
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])
    else:
        if 'Item' in response:
            item = response['Item']
            if item['TTL'] > int(time.time()):
                exists = True
    return exists

def lambda_handler(event, context):
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)
    logger.info('## EVENT')
    logger.info(event)

    for record in event['Records']:
        to_address = record['ses']['mail']['destination'][0]
        logger.info('## DESTINATION')
        logger.info(to_address)
        if address_exists(to_address):
            return {'disposition': 'CONTINUE'}
        else:
            return {'disposition': 'STOP_RULE_SET'}
        break;