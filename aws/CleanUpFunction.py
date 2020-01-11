import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key, Attr
import json
import os
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client('s3')

addresses_table = dynamodb.Table(os.environ['addresses_table_name'])
emails_table = dynamodb.Table(os.environ['emails_table_name'])
sessions_table = dynamodb.Table(os.environ['sessions_table_name'])

def delete_object(bucket_name, object_name):
    """Delete an object from an S3 bucket

    :param bucket_name: string
    :param object_name: string
    :return: True if the referenced object was deleted, otherwise False
    """
    logger.info('## Deleting S3')
    logger.info(bucket_name + object_name)
    
    # Delete the object
    try:
        s3.delete_object(Bucket=bucket_name, Key=object_name)
    except ClientError as e:
        logger.error(e)
        return False
    return True

def delete_email_item(destination, messageId):
    try:
        response = emails_table.delete_item(
            Key={
            'destination': destination,
            'messageId': messageId
            }
        )
    except ClientError as e:
        logger.error('## DynamoDB Client Exception')
        logger.error(e.response['Error']['Message'])
        
def delete_address_item(address):
    try:
        response = addresses_table.delete_item(
            Key={
            'address': address
            }
        )
    except ClientError as e:
        logger.error('## DynamoDB Client Exception')
        logger.error(e.response['Error']['Message'])

def find_emails(destination):
    try:
        filtering_exp = Key('destination').eq(destination)
        response = emails_table.query(KeyConditionExpression=filtering_exp)        
    except ClientError as e:
        logger.error('## DynamoDB Client Exception')
        logger.error(e.response['Error']['Message'])
    else:
        #Clean response       
        for I in response['Items']:
            delete_object(I['bucketName'], I['bucketObjectKey'])
            delete_email_item(destination, I['messageId'])

def delete_session_item(sessionId):
    try:
        response = sessions_table.delete_item(
            Key={
            'sessionId': sessionId
            }
        )
    except ClientError as e:
        logger.error('## DynamoDB Client Exception')
        logger.error(e.response['Error']['Message'])
            
def cleanup():
    #get expired addresses
    try:
        response = addresses_table.scan(
            FilterExpression = Attr('TTL').lt(int(time.time())),
            ProjectionExpression = "address"
        )
    except ClientError as e:
        logger.error('## DynamoDB Client Exception')
        logger.error(e.response['Error']['Message'])
    else:
        for I in response['Items']:
            find_emails(I['address'])
            delete_address_item(I['address'])
            
            
    #get expired sessions
    try:
        response = sessions_table.scan(
            FilterExpression = Attr('TTL').lt(int(time.time())),
            ProjectionExpression = "sessionId"
        )
    except ClientError as e:
        logger.error('## DynamoDB Client Exception')
        logger.error(e.response['Error']['Message'])
    else:
        for I in response['Items']:
            delete_session_item(I['sessionId'])
        

def lambda_handler(event, context):
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)
    logger.info('## EVENT')
    logger.info(event)
    
    result = {"statusCode": 200, "body": "cleanup"}
    cleanup()
    
    return result
