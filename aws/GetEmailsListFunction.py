import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
import json
import os
import logging
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
emails_table = dynamodb.Table(os.environ['emails_table_name'])
sessions_table = dynamodb.Table(os.environ['sessions_table_name'])

def get_emails(destination):
    items = None
    try:
        filtering_exp = Key('destination').eq(destination)
        response = emails_table.query(KeyConditionExpression=filtering_exp)        
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])
    else:
        #Clean response       
        for i in response['Items']:
            i.pop('bucketObjectKey', None)
            i.pop('bucketName', None)
        items = {'Items' : response['Items'], 'Count' : response['Count']}
    return items

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
    
    result = {"statusCode": 400, 
            "body": json.dumps({"message":"missing or invalid parameters"}), 
            "headers": headers
    }

    if event["queryStringParameters"] != None:
        if "sessionid" in event["queryStringParameters"]:
            if event["pathParameters"] != None:
                if "destination" in event["pathParameters"]:
                    if session_is_valid(event["queryStringParameters"]["sessionid"]):
                        destination = event["pathParameters"]["destination"]
                        items = get_emails(destination)
                        if items != None:
                            result = {"statusCode": 200, "body": json.dumps(items), "headers": headers }

    return result    
