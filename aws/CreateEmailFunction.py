import boto3
from botocore.exceptions import ClientError
import http.client, urllib.parse
import json
import os
import logging
import time
import re
import uuid

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource("dynamodb")
addresses_table = dynamodb.Table(os.environ['addresses_table_name'])
sessions_table = dynamodb.Table(os.environ['sessions_table_name'])

ssm = boto3.client('ssm')
valid_domains = os.environ['valid_domains'].split(',')
mailboxTTL = int(os.environ['mailbox_ttl'])
sessionTTL = int(os.environ['session_ttl'])

recaptcha_key = os.environ['recaptcha_key']

def address_exists(address):
    exists = False
    try:
        response = addresses_table.get_item(
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

def create_address(address):
    TTL = int(time.time()) + mailboxTTL
    try:
        response = addresses_table.put_item(
            Item= {'address': address, 'TTL': TTL}
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])

def create_session():
    session_id = str(uuid.uuid4())
    TTL = int(time.time()) + sessionTTL
    try:
        response = sessions_table.put_item(
            Item= {'sessionId': session_id, 'TTL': TTL}
        )
    except ClientError as e:
        logger.info('## DynamoDB Client Exception')
        logger.info(e.response['Error']['Message'])
    return session_id
                    
def validate_email(address):
    valid = False
    # Do some basic regex validation 
    match = re.match('^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$', address)
    if (match != None):
        domain = address.split("@")[-1]
        if domain in valid_domains:
            valid = True
    return valid

def validate_recaptcha(token):
    conn = http.client.HTTPSConnection('www.google.com')
    headers = {"Content-type": "application/x-www-form-urlencoded"}
    params = urllib.parse.urlencode({'secret': recaptcha_key, 'response': token}) 
    conn.request('POST', '/recaptcha/api/siteverify', params, headers)
    response = conn.getresponse()
    r = response.read().decode() 
    logger.info('## reCAPTCHA response')
    logger.info(r)
    r = json.loads(r)
    return r['success']
                        
def lambda_handler(event, context):
    logger.info('## ENVIRONMENT VARIABLES')
    logger.info(os.environ)
    logger.info('## EVENT')
    logger.info(event)
    logger.info('## Configuration')
    logger.info('Domains: {}'.format(valid_domains))
    logger.info('TTL: {}/{}'.format(mailboxTTL,sessionTTL))
    
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
        if (("address" in event["queryStringParameters"]) and 
            ("captcha" in event["queryStringParameters"])):
            email_address = event["queryStringParameters"]["address"] 
            captcha = event["queryStringParameters"]["captcha"] 
            if validate_recaptcha(captcha):
                if validate_email(email_address):
                    if address_exists(email_address):
                        message = "email address already exists"
                    else:
                        create_address(email_address)
                        message = "email address created"
                    
                    result = {
                            "statusCode": 200,
                            "body": json.dumps({"message":message, "sessionid": create_session()}), 
                            "headers": headers
                    }
    
    return result     