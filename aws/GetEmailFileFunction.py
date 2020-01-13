import boto3
from botocore.exceptions import ClientError
import json
import os
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
emails_table = dynamodb.Table(os.environ['emails_table_name'])
sessions_table = dynamodb.Table(os.environ['sessions_table_name'])

s3 = boto3.client('s3')

def get_email_file(destination, messageId):
    result = None
    try:
        response = emails_table.get_item(
            Key={
            'destination': destination,
            'messageId' : messageId
            }
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])
    else:
        if 'Item' in response:
            result = response['Item']
    return result


def set_as_readed(destination, messageId):
    try:
        response = emails_table.update_item(
            Key={
            'destination': destination,
            'messageId' : messageId
            },
            UpdateExpression="SET isNew = :updated",                   
            ExpressionAttributeValues={':updated': 'false'}
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])

def session_is_valid(sessionid):
    valid = False
    try:
        response = sessions_table.get_item(
            Key={
            'sessionId': sessionid
            }
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])
    else:
        if 'Item' in response:
            item = response['Item']
            if item['TTL'] > int(time.time()):
                valid = True
    return valid

def lambda_handler(event, context):
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)
    logger.info('## EVENT')
    logger.info(event)
    
    headers = {
                "access-control-allow-headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
                "access-control-allow-methods": "DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT",
                "access-control-allow-origin": "*"
            }
    
    
    result = {"statusCode": 400, "body": json.dumps({"body": "missing parameters"}), "headers": headers }
    
    if event["queryStringParameters"] != None:
        if "sessionid" in event["queryStringParameters"]:
            if event["pathParameters"] != None:
                if ("destination" in event["pathParameters"]) and ("messageId" in event["pathParameters"]):
                    if session_is_valid(event["queryStringParameters"]["sessionid"]):
                        destination = event["pathParameters"]["destination"]
                        messageId = event["pathParameters"]["messageId"]
                        email_file = get_email_file(destination, messageId) 
                        if email_file != None:
                            data = s3.get_object(Bucket=email_file['bucketName'], Key=email_file['bucketObjectKey'])
                            contents = data['Body'].read().decode('utf-8')
                            headers.update({"content-type": "message/rfc822"})
                            result = {
                                "statusCode": 200,
                                "headers": headers,
                                "body":  contents 
                            }
                            if email_file['isNew'] == 'true':
                                set_as_readed(destination, messageId)
                        else:
                            result = {"statusCode": 401, "body": json.dumps({"message":"not found"}), "headers": headers }

    return result
